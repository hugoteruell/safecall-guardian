import { NextRequest, NextResponse } from 'next/server';
import { bbDelete, bbUpdate, BUTTERBASE_READY } from '@/lib/butterbase';
import type { FamilyContactRow } from '@/lib/queries';

export const runtime = 'nodejs';

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!BUTTERBASE_READY) {
    return NextResponse.json({ error: 'butterbase unavailable' }, { status: 503 });
  }
  const ok = await bbDelete('family_contacts', id);
  if (!ok) return NextResponse.json({ error: 'delete failed' }, { status: 502 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  const ALLOWED = new Set(['name', 'relationship', 'phone', 'phone_digits', 'trusted']);
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k)) cleaned[k] = v;
  }
  if (typeof cleaned.phone === 'string' && !cleaned.phone_digits) {
    cleaned.phone_digits = cleaned.phone.replace(/\D/g, '');
  }
  const row = await bbUpdate<FamilyContactRow>('family_contacts', id, cleaned);
  if (!row) return NextResponse.json({ error: 'update failed' }, { status: 502 });
  return NextResponse.json({ row });
}
