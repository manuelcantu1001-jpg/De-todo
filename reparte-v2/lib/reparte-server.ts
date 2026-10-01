import { cookies } from 'next/headers';
import { getD1 } from '@/db';
import type { Currency, EventSnapshot, Transfer } from '@/lib/reparte-types';

const SESSION_COOKIE = 'rp_session';
const NAME_MAX = 40;

type EventRow = {
  id: string;
  slug: string;
  name: string;
  status: 'open' | 'closed';
  version: number;
  updated_at: string;
};

export type MemberRow = {
  id: string;
  event_id: string;
  name: string;
  role: 'owner' | 'member';
  session_token: string | null;
  claim_token: string | null;
  clabe: string | null;
  bank: string | null;
};

type ExpenseRow = {
  id: string;
  title: string;
  amount_cents: number;
  currency: Currency;
  fx_millis: number;
  payer_member_id: string;
  created_by_member_id: string;
  spent_on: string;
  created_at: string;
};

type ShareRow = { expense_id: string; member_id: string; share_cents: number };
type PaymentRow = {
  from_member_id: string;
  to_member_id: string;
  amount_cents: number;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json(
    { error: 'No pudimos completar la acción.' },
    { status: 500 },
  );
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    throw new ApiError(403, 'Solicitud no permitida.');
  }
}

export function cleanName(value: unknown, label = 'Nombre') {
  const name =
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (!name || name.length > NAME_MAX)
    throw new ApiError(400, `${label} inválido.`);
  return name;
}

export function cleanClabe(value: unknown) {
  const clabe = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (clabe && clabe.length !== 18)
    throw new ApiError(400, 'La CLABE debe tener 18 dígitos.');
  return clabe;
}

export function localDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Matamoros',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function makeId() {
  return crypto.randomUUID();
}

export function makeToken(length = 32) {
  const alphabet = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function ensureSessionToken() {
  const jar = await cookies();
  let token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    token = makeToken(48);
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return token;
}

export async function eventBySlug(slug: string) {
  const row = await getD1()
    .prepare(
      'SELECT id, slug, name, status, version, updated_at FROM events WHERE slug = ? LIMIT 1',
    )
    .bind(slug)
    .first<EventRow>();
  if (!row) throw new ApiError(404, 'Ese evento no existe.');
  return row;
}

export async function memberForSession(eventId: string) {
  const token = await getSessionToken();
  if (!token) return null;
  return getD1()
    .prepare(
      'SELECT id, event_id, name, role, session_token, claim_token, clabe, bank FROM members WHERE event_id = ? AND session_token = ? LIMIT 1',
    )
    .bind(eventId, token)
    .first<MemberRow>();
}

export async function requireMember(eventId: string, ownerOnly = false) {
  const member = await memberForSession(eventId);
  if (!member) throw new ApiError(401, 'Entra al evento para continuar.');
  if (ownerOnly && member.role !== 'owner')
    throw new ApiError(403, 'Solo quien organiza puede hacer eso.');
  return member;
}

export async function bumpEvent(eventId: string) {
  const now = new Date().toISOString();
  await getD1()
    .prepare(
      'UPDATE events SET version = version + 1, updated_at = ? WHERE id = ?',
    )
    .bind(now, eventId)
    .run();
}

export async function audit(
  eventId: string,
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  details?: unknown,
) {
  await getD1()
    .prepare(
      'INSERT INTO audit_log (id, event_id, actor_member_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      makeId(),
      eventId,
      actorId,
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : null,
      new Date().toISOString(),
    )
    .run();
}

function toMxn(expense: ExpenseRow) {
  return expense.currency === 'USD'
    ? Math.round((expense.amount_cents * expense.fx_millis) / 1000)
    : expense.amount_cents;
}

function greedyTransfers(balances: Map<string, number>) {
  const debtors = [...balances]
    .filter(([, value]) => value < 0)
    .map(([id, value]) => ({ id, value: -value }))
    .sort((a, b) => b.value - a.value);
  const creditors = [...balances]
    .filter(([, value]) => value > 0)
    .map(([id, value]) => ({ id, value }))
    .sort((a, b) => b.value - a.value);
  const result: Array<{ from: string; to: string; amount: number }> = [];
  let debtor = 0;
  let creditor = 0;
  while (debtor < debtors.length && creditor < creditors.length) {
    const amount = Math.min(debtors[debtor].value, creditors[creditor].value);
    if (amount > 0)
      result.push({
        from: debtors[debtor].id,
        to: creditors[creditor].id,
        amount,
      });
    debtors[debtor].value -= amount;
    creditors[creditor].value -= amount;
    if (debtors[debtor].value === 0) debtor += 1;
    if (creditors[creditor].value === 0) creditor += 1;
  }
  return result;
}

export async function buildSnapshot(slug: string): Promise<EventSnapshot> {
  const db = getD1();
  const event = await eventBySlug(slug);
  const [memberResult, expenseResult, shareResult, paymentResult] =
    await Promise.all([
      db
        .prepare(
          'SELECT id, event_id, name, role, session_token, claim_token, clabe, bank FROM members WHERE event_id = ? ORDER BY created_at',
        )
        .bind(event.id)
        .all<MemberRow>(),
      db
        .prepare(
          'SELECT id, title, amount_cents, currency, fx_millis, payer_member_id, created_by_member_id, spent_on, created_at FROM expenses WHERE event_id = ? AND deleted_at IS NULL ORDER BY created_at DESC',
        )
        .bind(event.id)
        .all<ExpenseRow>(),
      db
        .prepare(
          'SELECT es.expense_id, es.member_id, es.share_cents FROM expense_shares es JOIN expenses e ON e.id = es.expense_id WHERE e.event_id = ? AND e.deleted_at IS NULL',
        )
        .bind(event.id)
        .all<ShareRow>(),
      db
        .prepare(
          'SELECT from_member_id, to_member_id, amount_cents FROM payments WHERE event_id = ?',
        )
        .bind(event.id)
        .all<PaymentRow>(),
    ]);
  const members = memberResult.results;
  const expenses = expenseResult.results;
  const shares = shareResult.results;
  const payments = paymentResult.results;
  const me = await memberForSession(event.id);
  const memberNames = new Map(
    members.map((member) => [member.id, member.name]),
  );
  const sharesByExpense = new Map<string, ShareRow[]>();
  for (const share of shares) {
    const list = sharesByExpense.get(share.expense_id) ?? [];
    list.push(share);
    sharesByExpense.set(share.expense_id, list);
  }

  const balances = new Map(members.map((member) => [member.id, 0]));
  for (const expense of expenses) {
    balances.set(
      expense.payer_member_id,
      (balances.get(expense.payer_member_id) ?? 0) + toMxn(expense),
    );
    for (const share of sharesByExpense.get(expense.id) ?? []) {
      balances.set(
        share.member_id,
        (balances.get(share.member_id) ?? 0) - share.share_cents,
      );
    }
  }
  for (const payment of payments) {
    balances.set(
      payment.from_member_id,
      (balances.get(payment.from_member_id) ?? 0) + payment.amount_cents,
    );
    balances.set(
      payment.to_member_id,
      (balances.get(payment.to_member_id) ?? 0) - payment.amount_cents,
    );
  }

  const transferRows = greedyTransfers(balances);
  const personalTransfers: Transfer[] = me
    ? transferRows
        .filter((transfer) => transfer.from === me.id || transfer.to === me.id)
        .map((transfer) => {
          const receiver = members.find((member) => member.id === transfer.to);
          return {
            fromMemberId: transfer.from,
            fromName: memberNames.get(transfer.from) ?? '—',
            toMemberId: transfer.to,
            toName: memberNames.get(transfer.to) ?? '—',
            amountCents: transfer.amount,
            ...(transfer.from === me.id && receiver?.clabe
              ? {
                  recipientClabe: receiver.clabe,
                  recipientBank: receiver.bank ?? undefined,
                }
              : {}),
          };
        })
    : [];

  const visibleExpenses = expenses.filter((expense) => {
    const participantIds = (sharesByExpense.get(expense.id) ?? []).map(
      (share) => share.member_id,
    );
    if (!me) return participantIds.length === members.length;
    return expense.payer_member_id === me.id || participantIds.includes(me.id);
  });

  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    status: event.status,
    role: me?.role ?? 'guest',
    version: event.version,
    updatedAt: event.updated_at,
    me: me ? { id: me.id, name: me.name, role: me.role, mine: true } : null,
    members: members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      mine: member.id === me?.id,
      ...(me?.role === 'owner' && member.claim_token
        ? { claimToken: member.claim_token }
        : {}),
    })),
    expenses: visibleExpenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amountCents: expense.amount_cents,
      currency: expense.currency,
      fxMillis: expense.fx_millis,
      amountMxnCents: toMxn(expense),
      payerMemberId: expense.payer_member_id,
      payerName: memberNames.get(expense.payer_member_id) ?? '—',
      amongIds: (sharesByExpense.get(expense.id) ?? []).map(
        (share) => share.member_id,
      ),
      spentOn: expense.spent_on,
      canEdit: Boolean(
        me && (me.role === 'owner' || expense.created_by_member_id === me.id),
      ),
    })),
    visibleTotalCents: visibleExpenses.reduce(
      (sum, expense) => sum + toMxn(expense),
      0,
    ),
    myBalanceCents: me ? (balances.get(me.id) ?? 0) : null,
    transfers: personalTransfers,
  };
}

export const BANKS: Record<string, string> = {
  '002': 'Banamex',
  '012': 'BBVA',
  '014': 'Santander',
  '021': 'HSBC',
  '030': 'Bajío',
  '036': 'Inbursa',
  '044': 'Scotiabank',
  '058': 'Banregio',
  '062': 'Afirme',
  '072': 'Banorte',
  '127': 'Banco Azteca',
  '137': 'BanCoppel',
  '646': 'STP',
  '722': 'Mercado Pago',
};
