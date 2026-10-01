import { getD1 } from '@/db';
import {
  assertSameOrigin,
  cleanName,
  ensureSessionToken,
  getSessionToken,
  jsonError,
  makeId,
  makeToken,
} from '@/lib/reparte-server';

export async function GET() {
  try {
    const token = await getSessionToken();
    if (!token) return Response.json({ events: [] });
    const result = await getD1()
      .prepare(
        `SELECT e.slug, e.name, e.status, e.updated_at, e.version
       FROM events e JOIN members m ON m.event_id = e.id
       WHERE m.session_token = ? ORDER BY e.updated_at DESC LIMIT 30`,
      )
      .bind(token)
      .all();
    return Response.json({ events: result.results });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as {
      name?: unknown;
      personName?: unknown;
    };
    const name = cleanName(body.name, 'Nombre del evento');
    const personName = cleanName(body.personName, 'Tu nombre');
    const sessionToken = await ensureSessionToken();
    const eventId = makeId();
    const memberId = makeId();
    const slug = makeToken(10).toLowerCase();
    const now = new Date().toISOString();
    const db = getD1();
    await db.batch([
      db
        .prepare(
          'INSERT INTO events (id, slug, name, status, base_currency, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(eventId, slug, name, 'open', 'MXN', 1, now, now),
      db
        .prepare(
          'INSERT INTO members (id, event_id, name, role, session_token, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(memberId, eventId, personName, 'owner', sessionToken, now),
      db
        .prepare(
          'INSERT INTO audit_log (id, event_id, actor_member_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(makeId(), eventId, memberId, 'created', 'event', eventId, now),
    ]);
    return Response.json({ slug }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
