# Spec: Mock Scenarios (Data Layer)

> The data backbone of the demo. The Analysis screen reads from here.
> Build this FIRST, before the Analysis screen — spec 02 imports from here.
> Prerequisite: read `00-project-overview.md` first.

---

## 1. Goal

Three pre-baked analysis results that the demo replays. Each scenario has:
- The original suspicious (or legitimate) message
- The risk score
- The detected signals
- The evidence (Bright Data findings + family memory)
- The empathetic response
- The action buttons
- The agent trace logs

These mocks ensure the demo is **identical every time**: no LLM latency, no network failures, no random output variation.

---

## 2. File structure

```
lib/
├── types.ts                ← TypeScript types for all data
└── mockScenarios.ts        ← the 3 scenarios (exact data)
```

---

## 3. Types (`lib/types.ts`)

```typescript
export type RiskLevel = 'low' | 'medium' | 'critical';

export type Channel = 'sms' | 'call' | 'whatsapp';

export type SignalSeverity = RiskLevel;

export type Signal = {
  id: string;
  label: string;             // short title shown on card, e.g. "Urgency pressure"
  description: string;       // 1-2 sentence explanation
  severity: SignalSeverity;
};

export type EvidenceType = 'web_scrape' | 'family_memory' | 'official_policy';

export type Evidence = {
  id: string;
  source: string;            // e.g. "scamadviser.com", "Your family contacts"
  finding: string;           // the actual finding text
  type: EvidenceType;
};

export type ActionButton = {
  id: string;
  label: string;             // exact button text
  primary: boolean;          // only one should be true per scenario
  icon: string;              // lucide-react icon name, e.g. "Phone"
};

export type AgentTrace = {
  analyzer: string;
  investigator: string;
  guardian: string;
};

export type Scenario = {
  id: string;
  message: {
    text: string;
    from: string;
    channel: Channel;
  };
  score: number;             // 0-100
  riskLevel: RiskLevel;
  signals: Signal[];
  evidence: Evidence[];
  empathicResponse: string;
  actions: ActionButton[];
  agentTrace: AgentTrace;
};
```

---

## 4. The data (`lib/mockScenarios.ts`)

```typescript
import { Scenario } from './types';

export const SCENARIOS: Record<string, Scenario> = {

  // ─────────────────────────────────────────────────
  // Scenario A: Fake Son (PRIMARY DEMO)
  // ─────────────────────────────────────────────────
  fake_son: {
    id: 'fake_son',
    message: {
      text: "Mom, dropped my phone in water. This is my new number. Can you send $4,800 to this Zelle right now? It's an emergency. Please don't tell Dad.",
      from: '+1 (415) 555-0142',
      channel: 'sms',
    },
    score: 92,
    riskLevel: 'critical',
    signals: [
      {
        id: 's1',
        label: 'Urgency pressure',
        description: 'Message demands immediate action to bypass careful thinking.',
        severity: 'critical',
      },
      {
        id: 's2',
        label: 'Money request',
        description: 'Asks for $4,800 via Zelle — an irreversible payment method.',
        severity: 'critical',
      },
      {
        id: 's3',
        label: 'Unknown number',
        description: 'Sender claims to be family but writes from a new, unverified number.',
        severity: 'critical',
      },
      {
        id: 's4',
        label: 'Secrecy request',
        description: '"Please don\'t tell Dad" — a classic tactic to prevent verification.',
        severity: 'critical',
      },
      {
        id: 's5',
        label: 'Family impersonation',
        description: 'Pretends to be your son Peter, but the writing pattern does not match.',
        severity: 'critical',
      },
    ],
    evidence: [
      {
        id: 'e1',
        source: 'scamadviser.com',
        finding: 'This number appears in 47 scam reports in the last 30 days.',
        type: 'web_scrape',
      },
      {
        id: 'e2',
        source: 'Your family contacts',
        finding: "Your son Peter is registered with number (650) 555-9988 — this is a different number.",
        type: 'family_memory',
      },
    ],
    empathicResponse:
      "Take a breath. This doesn't sound like Peter. Scammers create urgency to stop you from checking. Before sending any money, let's verify another way.",
    actions: [
      { id: 'a1', label: "Call Peter's real number", primary: true, icon: 'Phone' },
      { id: 'a2', label: 'Tell Ana (your daughter)', primary: false, icon: 'MessageCircle' },
      { id: 'a3', label: 'Save evidence', primary: false, icon: 'Shield' },
    ],
    agentTrace: {
      analyzer:
        'Detected 5 high-risk signals: urgency, money request, new number, secrecy, impersonation.',
      investigator:
        "Searched scamadviser.com and your family contacts. Found 47 scam reports for this number. Confirmed Peter's real number is different.",
      guardian:
        "Composing a calm, warm response. Suggesting safe verification through Peter's real number.",
    },
  },

  // ─────────────────────────────────────────────────
  // Scenario B: Fake Bank Call (SECONDARY)
  // ─────────────────────────────────────────────────
  fake_bank: {
    id: 'fake_bank',
    message: {
      text: "Ma'am, this is Daniel from Bank of America fraud department. We detected a $2,300 suspicious transaction. To cancel it now, I need you to confirm the last 4 digits of your card via SMS.",
      from: '+1 (888) 555-0177',
      channel: 'call',
    },
    score: 88,
    riskLevel: 'critical',
    signals: [
      {
        id: 's1',
        label: 'Bank impersonation',
        description: 'Caller claims to represent Bank of America fraud department.',
        severity: 'critical',
      },
      {
        id: 's2',
        label: 'Urgency pressure',
        description: 'Demands immediate action to "cancel" a suspicious transaction.',
        severity: 'critical',
      },
      {
        id: 's3',
        label: 'Credential request',
        description: 'Asks for card digits — real banks never request this by phone.',
        severity: 'critical',
      },
    ],
    evidence: [
      {
        id: 'e1',
        source: 'bankofamerica.com/security',
        finding:
          'Bank of America NEVER asks for card credentials by phone. Official security policy.',
        type: 'official_policy',
      },
      {
        id: 'e2',
        source: 'scamadviser.com',
        finding: 'This number has been reported 23 times as a fake bank caller.',
        type: 'web_scrape',
      },
    ],
    empathicResponse:
      "Real banks never ask for this. Don't call back. Don't click any link they sent. If you want to check your account, call the number on the back of your card yourself.",
    actions: [
      { id: 'a1', label: 'See how to call your real bank', primary: true, icon: 'Phone' },
      { id: 'a2', label: 'Tell Ana (your daughter)', primary: false, icon: 'MessageCircle' },
      { id: 'a3', label: 'Save evidence', primary: false, icon: 'Shield' },
    ],
    agentTrace: {
      analyzer:
        'Detected 3 critical signals: bank impersonation, urgency, credential request.',
      investigator:
        "Verified Bank of America's official policy on bankofamerica.com/security. Found 23 scam reports for caller number.",
      guardian:
        'Composing reassuring response. Redirecting user to safe verification via the card-back number.',
    },
  },

  // ─────────────────────────────────────────────────
  // Scenario C: Legitimate Message (PROOF agent isn't paranoid)
  // ─────────────────────────────────────────────────
  legitimate: {
    id: 'legitimate',
    message: {
      text: 'Hi mom, how was your day? Want to grab dinner tomorrow? I can pick you up at 6.',
      from: '+1 (650) 555-9988',
      channel: 'sms',
    },
    score: 12,
    riskLevel: 'low',
    signals: [
      {
        id: 's1',
        label: 'Known contact',
        description: 'Number is registered in your family contacts as Peter (your son).',
        severity: 'low',
      },
      {
        id: 's2',
        label: 'Consistent pattern',
        description: 'Tone, vocabulary, and timing match previous conversations with Peter.',
        severity: 'low',
      },
      {
        id: 's3',
        label: 'No money request',
        description: 'Message contains no financial ask, no urgency, no suspicious link.',
        severity: 'low',
      },
    ],
    evidence: [
      {
        id: 'e1',
        source: 'Your family contacts',
        finding:
          "This is Peter (your son), registered on March 2024. You've exchanged 47 messages with this number.",
        type: 'family_memory',
      },
    ],
    empathicResponse:
      'This looks like Peter checking in. No signs of concern. Have a nice dinner.',
    actions: [
      { id: 'a1', label: 'Reply to Peter', primary: true, icon: 'MessageCircle' },
      { id: 'a2', label: 'Mark as safe', primary: false, icon: 'Check' },
    ],
    agentTrace: {
      analyzer: 'No risk signals detected. Message pattern matches known contact.',
      investigator:
        'Verified sender against your family contacts. Confirmed identity: Peter, your son.',
      guardian: 'No action needed. Composing a calm confirmation that this is safe.',
    },
  },
};
```

---

## 5. Why scenario C is non-negotiable

A judge's first question is always: **"isn't this just over-cautious?"**

Scenario C answers that question without you having to say a word. It proves:
- The agent reads the message (no money ask, no urgency)
- The agent cross-references family memory (Peter's real number)
- The agent gives a **low** score and a warm, non-alarming response

This is what separates SafeCall from a regex-based blocker. Run scenario C **right after** scenario A in the demo flow so the contrast is fresh in the judge's mind.

---

## 6. Editing rules

- **Do not change** `id` fields (`fake_son`, `fake_bank`, `legitimate`). They're referenced from URL params.
- **Do not change** phone numbers in scenarios. They must match across `mockScenarios.ts`, the family-memory evidence, and any text mentioning Peter's "real number."
- **Free to edit:** copy of `empathicResponse`, signal descriptions, evidence findings — as long as the tone follows the design principles in spec 00 (warm, never blame, never jargon).
- If the team wants a new scenario for fun (e.g. "Romance Scam"): add it as a new key, **don't break the three above**.

---

## 7. Test plan

After implementing this file:

1. In a Node REPL or test: `import { SCENARIOS } from './lib/mockScenarios'` — should not throw.
2. `SCENARIOS.fake_son.score === 92` → true.
3. `SCENARIOS.legitimate.riskLevel === 'low'` → true.
4. Every scenario has at least one primary action: `scenario.actions.some(a => a.primary) === true`.
5. Every scenario has at least one evidence and one signal.

If all 5 pass, the data layer is ready and the Analysis screen can be built on top.
