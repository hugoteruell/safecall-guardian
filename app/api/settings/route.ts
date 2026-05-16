import { NextRequest, NextResponse } from 'next/server';
import { updateSettings } from '@/lib/queries';

export const runtime = 'nodejs';

const ALLOWED = new Set([
  'notif_push',
  'notif_email',
  'notif_sms',
  'risk_threshold',
  'quiet_hours',
  'voice_enabled',
]);

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k)) cleaned[k] = v;
  }
  if (Object.keys(cleaned).length === 0)
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 });

  const row = await updateSettings(cleaned);
  if (!row) return NextResponse.json({ error: 'butterbase unavailable' }, { status: 503 });
  return NextResponse.json({ row });
}
