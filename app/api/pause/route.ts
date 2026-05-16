import { NextRequest, NextResponse } from 'next/server';
import { setPaused } from '@/lib/queries';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { until?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const until = typeof body.until === 'string' ? body.until : null;
  const row = await setPaused(until);
  if (!row) return NextResponse.json({ error: 'butterbase unavailable' }, { status: 503 });
  return NextResponse.json({ row });
}
