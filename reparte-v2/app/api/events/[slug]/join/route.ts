import { getD1 } from '@/db';
import {
  ApiError,
  assertSameOrigin,
  cleanName,
  ensureSessionToken,
  eventBySlug,
  jsonError,
  makeId,
  memberForSession,
} from '@/lib/reparte-server';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    assertSameOrigin(request);
    const { slug } = await context.params;
    const event = await eventBySlug(slug);
    if (await memberForSession(event.id)) return Response.json({ ok: true });
    const body = (await request.json()) as {
      name?: unknown;
      claimToken?: unknown;
    };
    const sessionToken = await ensureSessionToken();
    const claimToken =
      typeof body.claimToken === 'string' ? body.claimToken : '';
    const db = getD1();
    const now = new Date().toISOString();

    if (claimToken) {
      const claimed = await db
        .prepare(
          'SELECT id FROM members WHERE event_id = ? AND claim_token = ? AND session_token IS NULL LIMIT 1',
        )
        .bind(event.id, claimToken)
        .first<{ id: string }>();
      if (!claimed)
        throw new ApiError(400, 'Esta invitación ya fue usada o no es válida.');
      await db.batch([
        db
          .prepare(
            'UPDATE members SET session_token = ?, claim_token = NULL WHERE id = ?',
          )
          .bind(sessionToken, claimed.id),
        db
          .prepare(
            'UPDATE events SET version = version + 1, updated_at = ? WHERE id = ?',
          )
          .bind(now, event.id),
        db
          .prepare(
            'INSERT INTO audit_log (id, event_id, actor_member_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(
            makeId(),
            event.id,
            claimed.id,
            'claimed',
            'member',
            claimed.id,
            now,
          ),
      ]);
      return Response.json({ ok: true });
    }

    const name = cleanName(body.name, 'Tu nombre');
    const duplicate = await db
      .prepare(
        'SELECT id FROM members WHERE event_id = ? AND lower(name) = lower(?) LIMIT 1',
      )
      .bind(event.id, name)
      .first();
    if (duplicate)
      throw new ApiError(
        409,
        'Ese nombre ya está en el evento. Pide tu invitación personal a quien organiza.',
      );
    const memberId = makeId();
    await db.batch([
      db
        .prepare(
          'INSERT INTO members (id, event_id, name, role, session_token, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(memberId, event.id, name, 'member', sessionToken, now),
      db
        .prepare(
          'UPDATE events SET version = version + 1, updated_at = ? WHERE id = ?',
        )
        .bind(now, event.id),
      db
        .prepare(
          'INSERT INTO audit_log (id, event_id, actor_member_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(makeId(), event.id, memberId, 'joined', 'member', memberId, now),
    ]);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
