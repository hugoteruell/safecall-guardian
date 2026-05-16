// Mock data backing the in-product dashboards.
// In real life this would come from Butterbase + the event log.

export type Caretaker = {
  name: string;
  shortName: string;
  email: string;
  avatar: string;
  initials: string;
};

export type Senior = {
  name: string;
  shortName: string;
  relationship: string;
  age: number;
  location: string;
  phone: string;
  initials: string;
  protectedSinceIso: string;
};

export type FamilyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  initials: string;
  addedAtIso: string;
  interactions: number;
  trusted: boolean;
};

export type EventStatus = 'blocked' | 'safe' | 'warned';
export type EventChannel = 'sms' | 'call' | 'whatsapp';
export type EventCategory =
  | 'bank'
  | 'family'
  | 'romance'
  | 'irs'
  | 'medicare'
  | 'package'
  | 'legit';

export type ProtectionEvent = {
  id: string;
  scenarioId?: string; // links to /analysis scenarios when available
  timestampIso: string;
  channel: EventChannel;
  status: EventStatus;
  from: string;
  summary: string;
  category: EventCategory;
  moneyAtRiskUsd?: number;
};

export const CARETAKER: Caretaker = {
  name: 'Ana Silva',
  shortName: 'Ana',
  email: 'ana.silva@example.com',
  avatar: '',
  initials: 'AS',
};

export const SENIOR: Senior = {
  name: 'Margaret Silva',
  shortName: 'Mom',
  relationship: 'Mom',
  age: 72,
  location: 'Phoenix, AZ',
  phone: '+1 (602) 555-0184',
  initials: 'MS',
  protectedSinceIso: '2025-08-12T00:00:00Z',
};

export const FAMILY_CONTACTS: FamilyContact[] = [
  {
    id: 'fc1',
    name: 'Peter Silva',
    relationship: 'Son',
    phone: '+1 (650) 555-9988',
    initials: 'PS',
    addedAtIso: '2025-08-12T00:00:00Z',
    interactions: 47,
    trusted: true,
  },
  {
    id: 'fc2',
    name: 'John Silva',
    relationship: 'Husband',
    phone: '+1 (602) 555-3142',
    initials: 'JS',
    addedAtIso: '2025-08-12T00:00:00Z',
    interactions: 312,
    trusted: true,
  },
  {
    id: 'fc3',
    name: 'Sarah Silva',
    relationship: 'Daughter',
    phone: '+1 (415) 555-7710',
    initials: 'SS',
    addedAtIso: '2025-09-04T00:00:00Z',
    interactions: 89,
    trusted: true,
  },
  {
    id: 'fc4',
    name: 'Dr. Helen Park',
    relationship: 'Doctor',
    phone: '+1 (602) 555-7012',
    initials: 'HP',
    addedAtIso: '2025-10-22T00:00:00Z',
    interactions: 12,
    trusted: true,
  },
];

// 9 months of history. Today in-app is 2026-05-16.
export const PROTECTION_EVENTS: ProtectionEvent[] = [
  {
    id: 'ev1',
    scenarioId: 'fake_bank',
    timestampIso: '2026-05-16T16:30:00Z',
    channel: 'call',
    status: 'blocked',
    from: '+1 (888) 555-0177',
    summary: 'Fake Bank of America fraud department asked for card digits',
    category: 'bank',
    moneyAtRiskUsd: 2300,
  },
  {
    id: 'ev2',
    scenarioId: 'fake_son',
    timestampIso: '2026-05-14T11:24:00Z',
    channel: 'sms',
    status: 'blocked',
    from: '+1 (415) 555-0142',
    summary: 'Family impersonation — claimed to be Peter, asked for $4,800 via Zelle',
    category: 'family',
    moneyAtRiskUsd: 4800,
  },
  {
    id: 'ev3',
    scenarioId: 'legitimate',
    timestampIso: '2026-05-13T20:15:00Z',
    channel: 'sms',
    status: 'safe',
    from: '+1 (650) 555-9988',
    summary: 'Peter — dinner plans',
    category: 'legit',
  },
  {
    id: 'ev4',
    timestampIso: '2026-05-09T09:42:00Z',
    channel: 'call',
    status: 'blocked',
    from: '+1 (800) 555-0119',
    summary: 'IRS impersonation — threatened jail over "back taxes"',
    category: 'irs',
    moneyAtRiskUsd: 1900,
  },
  {
    id: 'ev5',
    timestampIso: '2026-05-02T18:00:00Z',
    channel: 'sms',
    status: 'blocked',
    from: '+1 (213) 555-0167',
    summary: 'Romance scam — "soldier overseas" asking for gift cards',
    category: 'romance',
    moneyAtRiskUsd: 6500,
  },
  {
    id: 'ev6',
    timestampIso: '2026-04-27T14:33:00Z',
    channel: 'call',
    status: 'warned',
    from: '+1 (855) 555-0214',
    summary: 'Medicare benefits scam — flagged but unsure, asked Ana',
    category: 'medicare',
    moneyAtRiskUsd: 0,
  },
  {
    id: 'ev7',
    timestampIso: '2026-04-19T10:11:00Z',
    channel: 'sms',
    status: 'blocked',
    from: '+1 (415) 555-0188',
    summary: 'Fake USPS package — phishing link for "redelivery fee"',
    category: 'package',
    moneyAtRiskUsd: 320,
  },
  {
    id: 'ev8',
    timestampIso: '2026-04-08T19:50:00Z',
    channel: 'sms',
    status: 'safe',
    from: '+1 (602) 555-3142',
    summary: 'John — picking up groceries',
    category: 'legit',
  },
  {
    id: 'ev9',
    timestampIso: '2026-03-25T08:20:00Z',
    channel: 'call',
    status: 'blocked',
    from: '+1 (888) 555-0234',
    summary: 'Tech support scam — claimed "your computer is infected"',
    category: 'bank',
    moneyAtRiskUsd: 1500,
  },
  {
    id: 'ev10',
    timestampIso: '2026-03-12T12:00:00Z',
    channel: 'call',
    status: 'blocked',
    from: '+1 (800) 555-0356',
    summary: 'Fake Medicare rep — asked for SSN and bank info',
    category: 'medicare',
    moneyAtRiskUsd: 980,
  },
];

export function eventsBlocked() {
  return PROTECTION_EVENTS.filter((e) => e.status === 'blocked').length;
}

export function eventsThisWeek(nowIso: string) {
  const now = new Date(nowIso).getTime();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  return PROTECTION_EVENTS.filter((e) => {
    const t = new Date(e.timestampIso).getTime();
    return t >= weekAgo && e.status === 'blocked';
  }).length;
}

export function moneySaved() {
  return PROTECTION_EVENTS.reduce(
    (acc, e) => acc + (e.status === 'blocked' ? e.moneyAtRiskUsd ?? 0 : 0),
    0
  );
}
