import { getD1 } from '@/db';
import {
  ApiError,
  assertSameOrigin,
  buildSnapshot,
  eventBySlug,
  jsonError,
  makeId,
  requireMember,
} from '@/lib/reparte-server';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    assertSameOrigin(request);
    const { slug } = await context.params;
    const event = await eventBySlug(slug);
    const receiver = await requireMember(event.id);
    const body = (await request.json()) as {
      fromMemberId?: unknown;
      toMemberId?: unknown;
      amountCents?: unknown;
    };
    const fromMemberId =
      typeof body.fromMemberId === 'string' ? body.fromMemberId : '';
    const toMemberId =
      typeof body.toMemberId === 'string' ? body.toMemberId : '';
    const amountCents = Number(body.amountCents);
    if (toMemberId !== receiver.id)
      throw new ApiError(403, 'Solo quien recibe puede confirmar el pago.');
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0)
      throw new ApiError(400, 'Monto inválido.');
    const snapshot = await buildSnapshot(slug);
    const transfer = snapshot.transfers.find(
      (item) =>
        item.fromMemberId === fromMemberId && item.toMemberId === toMemberId,
    );
    if (!transfer || amountCents > transfer.amountCents)
      throw new ApiError(
        409,
        'Ese saldo cambió. Actualiza e inténtalo de nuevo.',
      );
    const paymentId = makeId();
    const now = new Date().toISOString();
    const db = getD1();
    await db.batch([
      db
        .prepare(
          'INSERT INTO payments (id, event_id, from_member_id, to_member_id, amount_cents, confirmed_by_member_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(
          paymentId,
          event.id,
          fromMemberId,
          toMemberId,
          amountCents,
          receiver.id,
          now,
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
          receiver.id,
          'confirmed',
          'payment',
          paymentId,
          JSON.stringify({ fromMemberId, toMemberId, amountCents }),
          now,
        ),
    ]);
    return Response.json({ id: paymentId }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
