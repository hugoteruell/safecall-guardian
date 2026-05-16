import { NextRequest, NextResponse } from 'next/server';
import { addFamilyContact } from '@/lib/queries';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { name?: unknown; relationship?: unknown; phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  if (typeof body.name !== 'string' || !body.name.trim())
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (typeof body.phone !== 'string' || !body.phone.trim())
    return NextResponse.json({ error: 'phone required' }, { status: 400 });

  const row = await addFamilyContact({
    name: body.name.trim(),
    relationship: typeof body.relationship === 'string' ? body.relationship.trim() : '',
    phone: body.phone.trim(),
  });
  if (!row) return NextResponse.json({ error: 'butterbase unavailable' }, { status: 503 });
  return NextResponse.json({ row });
}
