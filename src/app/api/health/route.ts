import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Liveness probe for the load balancer / Fly health check. */
export function GET() {
  return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
