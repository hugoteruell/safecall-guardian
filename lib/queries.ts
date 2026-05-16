// Domain-level queries. Each function tries Butterbase first and falls back
// to mock data (lib/userData.ts) when the DB is unreachable. This guarantees
// the demo always renders something even if the network or the service is
// having a bad day.

import { bbSelect, bbSelectOne, bbInsert, bbUpdate, BUTTERBASE_READY } from './butterbase';
import {
  CARETAKER as MOCK_CARETAKER,
  SENIOR as MOCK_SENIOR,
  FAMILY_CONTACTS as MOCK_FAMILY,
  PROTECTION_EVENTS as MOCK_EVENTS,
  type Caretaker,
  type Senior,
  type FamilyContact,
  type ProtectionEvent,
} from './userData';

// Seeded UUIDs from the initial Butterbase seed. Hardcoded for the single-tenant
// demo. When real auth ships, these come from the session.
export const ANA_CARETAKER_ID = '1a5ac504-fc00-44a3-9711-e6688f5c86fd';
export const MARGARET_SENIOR_ID = '93f94b50-c3bc-4947-b675-9fa71d33a865';

// ───── DB row types (snake_case as Postgres returns) ─────

export type CaretakerRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type SeniorRow = {
  id: string;
  caretaker_id: string;
  name: string;
  relationship: string;
  age: number;
  phone: string;
  location: string;
  protected_since: string;
};

export type FamilyContactRow = {
  id: string;
  senior_id: string;
  name: string;
  relationship: string;
  phone: string;
  phone_digits: string;
  trusted: boolean;
  interactions: number;
  added_at: string;
};

export type ProtectionEventRow = {
  id: string;
  senior_id: string;
  scammer_number_id: string | null;
  signature_id: string | null;
  scenario_id: string | null;
  channel: 'sms' | 'call' | 'whatsapp';
  status: 'blocked' | 'safe' | 'warned';
  from_number: string;
  from_digits: string | null;
  summary: string;
  category: string;
  money_at_risk_usd: string | null; // numeric → string from PostgREST
  raw_message: string | null;
  score: number | null;
  occurred_at: string;
  created_at: string;
};

export type ScammerNumberRow = {
  id: string;
  phone: string;
  phone_digits: string;
  primary_category: string;
  reports_count: number;
  victims_count: number;
  confidence: string;
  first_seen_at: string;
  last_seen_at: string;
  notes: string | null;
};

export type ScamSignatureRow = {
  id: string;
  fingerprint: string;
  category: string;
  example_text: string;
  matches_count: number;
  first_seen_at: string;
  last_seen_at: string;
};

export type SettingsRow = {
  caretaker_id: string;
  notif_push: boolean;
  notif_email: boolean;
  notif_sms: boolean;
  risk_threshold: number;
  quiet_hours: boolean;
  voice_enabled: boolean;
  paused_until: string | null;
  updated_at: string;
};

// ───── Row → app type adapters ─────

function rowToInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function rowToCaretaker(r: CaretakerRow): Caretaker {
  return {
    name: r.name,
    shortName: r.name.split(' ')[0],
    email: r.email,
    avatar: '',
    initials: rowToInitials(r.name),
  };
}

function rowToSenior(r: SeniorRow): Senior {
  return {
    name: r.name,
    shortName: r.relationship || 'Mom',
    relationship: r.relationship,
    age: r.age,
    location: r.location,
    phone: r.phone,
    initials: rowToInitials(r.name),
    protectedSinceIso: r.protected_since,
  };
}

function rowToContact(r: FamilyContactRow): FamilyContact {
  return {
    id: r.id,
    name: r.name,
    relationship: r.relationship,
    phone: r.phone,
    initials: rowToInitials(r.name),
    addedAtIso: r.added_at,
    interactions: r.interactions,
    trusted: r.trusted,
  };
}

function rowToEvent(r: ProtectionEventRow): ProtectionEvent {
  return {
    id: r.id,
    scenarioId: r.scenario_id ?? undefined,
    timestampIso: r.occurred_at,
    channel: r.channel,
    status: r.status,
    from: r.from_number,
    summary: r.summary,
    category: (r.category as ProtectionEvent['category']) ?? 'legit',
    moneyAtRiskUsd: r.money_at_risk_usd ? Number(r.money_at_risk_usd) : undefined,
  };
}

// ───── Public queries ─────

export async function getCaretaker(): Promise<Caretaker> {
  const row = await bbSelectOne<CaretakerRow>('caretakers', {
    filters: { id: `eq.${ANA_CARETAKER_ID}` },
  });
  return row ? rowToCaretaker(row) : MOCK_CARETAKER;
}

export async function getSenior(): Promise<Senior> {
  const row = await bbSelectOne<SeniorRow>('seniors', {
    filters: { id: `eq.${MARGARET_SENIOR_ID}` },
  });
  return row ? rowToSenior(row) : MOCK_SENIOR;
}

export async function getFamilyContacts(): Promise<FamilyContact[]> {
  const rows = await bbSelect<FamilyContactRow>('family_contacts', {
    filters: { senior_id: `eq.${MARGARET_SENIOR_ID}` },
    order: 'added_at.asc',
  });
  return rows ? rows.map(rowToContact) : MOCK_FAMILY;
}

export async function getEvents(limit?: number): Promise<ProtectionEvent[]> {
  const rows = await bbSelect<ProtectionEventRow>('protection_events', {
    filters: { senior_id: `eq.${MARGARET_SENIOR_ID}` },
    order: 'occurred_at.desc',
    limit,
  });
  return rows ? rows.map(rowToEvent) : MOCK_EVENTS;
}

export async function getSettings(): Promise<SettingsRow> {
  const row = await bbSelectOne<SettingsRow>('settings', {
    filters: { caretaker_id: `eq.${ANA_CARETAKER_ID}` },
  });
  return (
    row ?? {
      caretaker_id: ANA_CARETAKER_ID,
      notif_push: true,
      notif_email: true,
      notif_sms: false,
      risk_threshold: 70,
      quiet_hours: true,
      voice_enabled: true,
      paused_until: null,
      updated_at: new Date().toISOString(),
    }
  );
}

// ───── Intel queries (cross-tenant) ─────

export async function getTopScammers(limit = 20): Promise<ScammerNumberRow[]> {
  const rows = await bbSelect<ScammerNumberRow>('scammer_numbers', {
    order: 'reports_count.desc',
    limit,
  });
  return rows ?? [];
}

export async function getTopSignatures(limit = 20): Promise<ScamSignatureRow[]> {
  const rows = await bbSelect<ScamSignatureRow>('scam_signatures', {
    order: 'matches_count.desc',
    limit,
  });
  return rows ?? [];
}

// ───── Writes ─────

export async function addFamilyContact(input: {
  name: string;
  relationship: string;
  phone: string;
}): Promise<FamilyContactRow | null> {
  if (!BUTTERBASE_READY) return null;
  const phoneDigits = input.phone.replace(/\D/g, '');
  return bbInsert<FamilyContactRow>('family_contacts', {
    senior_id: MARGARET_SENIOR_ID,
    name: input.name,
    relationship: input.relationship,
    phone: input.phone,
    phone_digits: phoneDigits,
    trusted: true,
    interactions: 0,
  });
}

export async function updateSettings(
  data: Partial<Omit<SettingsRow, 'caretaker_id' | 'updated_at'>>
) {
  return bbUpdate<SettingsRow>('settings', ANA_CARETAKER_ID, {
    ...data,
    updated_at: new Date().toISOString(),
  });
}

export async function setPaused(untilIso: string | null) {
  return updateSettings({ paused_until: untilIso });
}
