import { getD1 } from '@/db';
import {
  ApiError,
  assertSameOrigin,
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
    const owner = await requireMember(event.id, true);
    const body = (await request.json()) as { status?: unknown };
    const status =
      body.status === 'closed'
        ? 'closed'
        : body.status === 'open'
          ? 'open'
          : null;
    if (!status) throw new ApiError(400, 'Estado inválido.');
    const now = new Date().toISOString();
    const db = getD1();
    await db.batch([
      db
        .prepare(
          'UPDATE events SET status = ?, closed_at = ?, version = version + 1, updated_at = ? WHERE id = ?',
        )
        .bind(status, status === 'closed' ? now : null, now, event.id),
      db
        .prepare(
          'INSERT INTO audit_log (id, event_id, actor_member_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(makeId(), event.id, owner.id, status, 'event', event.id, now),
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
