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

type EditableExpense = {
  id: string;
  title: string;
  amount_cents: number;
  currency: string;
  fx_millis: number;
  payer_member_id: string;
  created_by_member_id: string;
  spent_on: string;
};

async function editableExpense(
  eventId: string,
  expenseId: string,
  actorId: string,
  isOwner: boolean,
) {
  const expense = await getD1()
    .prepare(
      'SELECT id, title, amount_cents, currency, fx_millis, payer_member_id, created_by_member_id, spent_on FROM expenses WHERE id = ? AND event_id = ? AND deleted_at IS NULL LIMIT 1',
    )
    .bind(expenseId, eventId)
    .first<EditableExpense>();
  if (!expense) throw new ApiError(404, 'Ese gasto ya no existe.');
  if (!isOwner && expense.created_by_member_id !== actorId) {
    throw new ApiError(
      403,
      'Solo quien capturó el gasto o quien organiza puede cambiarlo.',
    );
  }
  return expense;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; expenseId: string }> },
) {
  try {
    assertSameOrigin(request);
    const { slug, expenseId } = await context.params;
    const event = await eventBySlug(slug);
    if (event.status === 'closed')
      throw new ApiError(409, 'Reabre el evento para corregir gastos.');
    const actor = await requireMember(event.id);
    const before = await editableExpense(
      event.id,
      expenseId,
      actor.id,
      actor.role === 'owner',
    );
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
    const order = amongIds.includes(payerMemberId)
      ? [payerMemberId, ...amongIds.filter((id) => id !== payerMemberId)]
      : amongIds;
    const shares = new Map(amongIds.map((id) => [id, baseShare]));
    for (const id of order) {
      if (!remainder) break;
      shares.set(id, (shares.get(id) ?? 0) + 1);
      remainder -= 1;
    }
    const now = new Date().toISOString();
    await db.batch([
      db
        .prepare(
          'UPDATE expenses SET title = ?, amount_cents = ?, currency = ?, fx_millis = ?, payer_member_id = ?, spent_on = ? WHERE id = ?',
        )
        .bind(
          title,
          amountCents,
          currency,
          fxMillis,
          payerMemberId,
          spentOn,
          expenseId,
        ),
      db
        .prepare('DELETE FROM expense_shares WHERE expense_id = ?')
        .bind(expenseId),
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
          'updated',
          'expense',
          expenseId,
          JSON.stringify({
            before,
            after: {
              title,
              amountCents,
              currency,
              fxMillis,
              payerMemberId,
              amongIds,
              spentOn,
            },
          }),
          now,
        ),
    ]);
    return Response.json({ id: expenseId });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string; expenseId: string }> },
) {
  try {
    assertSameOrigin(request);
    const { slug, expenseId } = await context.params;
    const event = await eventBySlug(slug);
    if (event.status === 'closed')
      throw new ApiError(409, 'Reabre el evento para borrar gastos.');
    const actor = await requireMember(event.id);
    const before = await editableExpense(
      event.id,
      expenseId,
      actor.id,
      actor.role === 'owner',
    );
    const now = new Date().toISOString();
    const db = getD1();
    await db.batch([
      db
        .prepare('UPDATE expenses SET deleted_at = ? WHERE id = ?')
        .bind(now, expenseId),
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
          'deleted',
          'expense',
          expenseId,
          JSON.stringify({ before }),
          now,
        ),
    ]);
    return Response.json({ id: expenseId });
  } catch (error) {
    return jsonError(error);
  }
}
