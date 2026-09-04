import { getD1 } from '@/db';
import {
  ApiError,
  assertSameOrigin,
  cleanName,
  eventBySlug,
  jsonError,
  localDate,
  makeId,
  requireMember,
} from '@/lib/reparte-server';

type ExpenseBody = {
  title?: unknown;
  amountCents?: unknown;
  currency?: unknown;
  fxMillis?: unknown;
  payerMemberId?: unknown;
  amongIds?: unknown;
  spentOn?: unknown;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    assertSameOrigin(request);
    const { slug } = await context.params;
    const event = await eventBySlug(slug);
    if (event.status === 'closed')
      throw new ApiError(409, 'El evento está cerrado.');
    const actor = await requireMember(event.id);
    const body = (await request.json()) as ExpenseBody;
    const amountCents = Number(body.amountCents);
    if (
      !Number.isSafeInteger(amountCents) ||
      amountCents <= 0 ||
      amountCents > 100_000_000
    ) {
      throw new ApiError(400, 'Monto inválido.');
    }
    const currency = body.currency === 'USD' ? 'USD' : 'MXN';
    const fxMillis = currency === 'USD' ? Number(body.fxMillis) : 1000;
    if (
      !Number.isSafeInteger(fxMillis) ||
      fxMillis < 1000 ||
      fxMillis > 100_000
    ) {
      throw new ApiError(400, 'Tipo de cambio inválido.');
    }
    const payerMemberId =
      typeof body.payerMemberId === 'string' ? body.payerMemberId : '';
    const amongIds = Array.isArray(body.amongIds)
      ? [
          ...new Set(
            body.amongIds.filter((id): id is string => typeof id === 'string'),
          ),
        ]
      : [];
    if (!payerMemberId || !amongIds.length)
      throw new ApiError(400, 'Elige quién pagó y entre quiénes se reparte.');
    const db = getD1();
    const memberRows = await db
      .prepare('SELECT id FROM members WHERE event_id = ?')
      .bind(event.id)
      .all<{ id: string }>();
    const allowed = new Set(memberRows.results.map((member) => member.id));
    if (
      !allowed.has(payerMemberId) ||
      amongIds.some((id) => !allowed.has(id))
    ) {
      throw new ApiError(400, 'Hay una persona inválida en el reparto.');
    }
    const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
    const title = rawTitle ? cleanName(rawTitle, 'Descripción') : 'Gasto';
    const spentOn =
      typeof body.spentOn === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(body.spentOn)
        ? body.spentOn
        : localDate();
    const totalMxnCents =
      currency === 'USD'
        ? Math.round((amountCents * fxMillis) / 1000)
        : amountCents;
    const baseShare = Math.floor(totalMxnCents / amongIds.length);
    let remainder = totalMxnCents - baseShare * amongIds.length;
    const distributionOrder = amongIds.includes(payerMemberId)
      ? [payerMemberId, ...amongIds.filter((id) => id !== payerMemberId)]
      : amongIds;
    const shares = new Map(amongIds.map((id) => [id, baseShare]));
    for (const id of distributionOrder) {
      if (!remainder) break;
      shares.set(id, (shares.get(id) ?? 0) + 1);
      remainder -= 1;
    }
    const expenseId = makeId();
    const now = new Date().toISOString();
    const statements = [
      db
        .prepare(
          'INSERT INTO expenses (id, event_id, title, amount_cents, currency, fx_millis, payer_member_id, created_by_member_id, spent_on, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(
          expenseId,
          event.id,
          title,
          amountCents,
          currency,
          fxMillis,
          payerMemberId,
          actor.id,
          spentOn,
          now,
        ),
      ...[...shares].map(([memberId, shareCents]) =>
        db
          .prepare(
            'INSERT INTO expense_shares (expense_id, member_id, share_cents) VALUES (?, ?, ?)',
          )
          .bind(expenseId, memberId, shareCents),
      ),
      db
        .prepare(
          'UPDATE events SET version = version + 1, updated_at = ? WHERE id = ?',
        )
        .bind(now, event.id),
      db
        .prepare(
          'INSERT INTO audit_log (id, event_id, actor_member_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(
          makeId(),
          event.id,
          actor.id,
          'created',
          'expense',
          expenseId,
          JSON.stringify({ amountCents, currency, amongIds }),
          now,
        ),
    ];
    await db.batch(statements);
    return Response.json({ id: expenseId }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
