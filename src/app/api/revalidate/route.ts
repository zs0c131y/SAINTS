import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function authorised(req: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;
  const given = req.headers.get('x-revalidate-secret') ?? new URL(req.url).searchParams.get('secret') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/revalidate  (header `x-revalidate-secret: <REVALIDATE_SECRET>`)
 * Drops the cached Google Sheet data so an edit shows up immediately instead of within a minute.
 * Disabled (404) when REVALIDATE_SECRET is not set.
 */
export async function POST(req: NextRequest) {
  if (!process.env.REVALIDATE_SECRET) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  revalidateTag('sheet', { expire: 0 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
