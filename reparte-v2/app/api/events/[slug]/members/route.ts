import { getD1 } from '@/db';
import {
  assertSameOrigin,
  cleanName,
  eventBySlug,
  jsonError,
  makeId,
  makeToken,
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
    const body = (await request.json()) as { name?: unknown };
    const name = cleanName(body.name);
    const memberId = makeId();
    const claimToken = makeToken(32);
    const now = new Date().toISOString();
    const db = getD1();
    await db.batch([
      db
        .prepare(
          'INSERT INTO members (id, event_id, name, role, claim_token, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(memberId, event.id, name, 'member', claimToken, now),
      db
        .prepare(
          'UPDATE events SET version = version + 1, updated_at = ? WHERE id = ?',
        )
        .bind(now, event.id),
      db
        .prepare(
          'INSERT INTO audit_log (id, event_id, actor_member_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(makeId(), event.id, owner.id, 'created', 'member', memberId, now),
    ]);
    return Response.json({ memberId, claimToken }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
