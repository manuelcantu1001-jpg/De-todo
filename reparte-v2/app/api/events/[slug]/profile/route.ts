import { getD1 } from '@/db';
import {
  BANKS,
  assertSameOrigin,
  cleanClabe,
  eventBySlug,
  jsonError,
  requireMember,
} from '@/lib/reparte-server';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    assertSameOrigin(request);
    const { slug } = await context.params;
    const event = await eventBySlug(slug);
    const member = await requireMember(event.id);
    const body = (await request.json()) as { clabe?: unknown };
    const clabe = cleanClabe(body.clabe);
    const bank = clabe ? (BANKS[clabe.slice(0, 3)] ?? null) : null;
    const now = new Date().toISOString();
    const db = getD1();
    await db.batch([
      db
        .prepare('UPDATE members SET clabe = ?, bank = ? WHERE id = ?')
        .bind(clabe || null, bank, member.id),
      db
        .prepare(
          'UPDATE events SET version = version + 1, updated_at = ? WHERE id = ?',
        )
        .bind(now, event.id),
    ]);
    return Response.json({ ok: true, bank });
  } catch (error) {
    return jsonError(error);
  }
}
