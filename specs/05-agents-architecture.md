# Spec: Agents Architecture

> The three LLM calls that power the "agentic" pitch.
> Used only when the judge types free-form input on the Home screen.
> Cached scenarios bypass this entirely and read from mockScenarios.
> Prerequisite: read `00-project-overview.md` first.

---

## 1. Goal

Implement three independent LLM calls (the "agents") that run in sequence to produce a `Scenario` object that the Analysis screen can render.

```
        ┌──────────────┐      ┌────────────────┐      ┌──────────────┐
input → │   ANALYZER   │  →   │  INVESTIGATOR  │  →   │   GUARDIAN   │ → output
        │  (signals)   │      │  (web + memory)│      │  (response)  │
        └──────────────┘      └────────────────┘      └──────────────┘
```

Each agent:
- Takes a typed input (TypeScript)
- Calls one LLM
- Returns structured JSON (validated)
- On failure, falls back to a safe default (never crashes)

---

## 2. File structure

```
lib/
└── agents/
    ├── analyzer.ts             ← Signal extraction
    ├── investigator.ts         ← Web + family memory lookup
    ├── guardian.ts             ← Empathetic response generation
    ├── pipeline.ts             ← Orchestrates the 3 in sequence
    └── llm.ts                  ← Shared LLM client wrapper
app/
└── api/
    └── analyze/
        └── route.ts            ← POST endpoint, calls pipeline
```

---

## 3. LLM client wrapper (`lib/agents/llm.ts`)

### Purpose
Single chokepoint for all LLM calls. Lets us swap providers or change settings in one place.

### Implementation
```typescript
import Anthropic from '@anthropic-ai/sdk';
// or: import OpenAI from 'openai';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callLLM(opts: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<string> {
  const res = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.systemPrompt,
    messages: [{ role: 'user', content: opts.userPrompt }],
  });

  const block = res.content[0];
  if (block.type !== 'text') throw new Error('Unexpected LLM response');
  return block.text;
}
```

If using OpenAI instead, swap the SDK and use `gpt-4o-mini` for speed.

### JSON extraction helper
```typescript
export function extractJSON<T>(text: string): T {
  // Strip ```json fences if present
  const cleaned = text.replace(/```json|```/g, '').trim();
  // Find the first { and last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in response');
  return JSON.parse(cleaned.slice(start, end + 1));
}
```

---

## 4. Agent 1: Analyzer (`lib/agents/analyzer.ts`)

### Purpose
Read the incoming message. Extract risk signals.

### Input
```typescript
type AnalyzerInput = {
  messageText: string;
  senderInfo: string;  // e.g. "+1 (415) 555-0142, SMS"
};
```

### Output
```typescript
type AnalyzerOutput = {
  signals: Array<{
    id: string;
    label: string;
    description: string;
    severity: 'low' | 'medium' | 'critical';
  }>;
  preliminaryScore: number;  // 0-100, agent's first guess before investigation
};
```

### System prompt
```
You are the Analyzer agent in SafeCall Guardian, a scam-protection
assistant for elderly users.

Your job: read an incoming message and extract specific risk signals.
You do NOT investigate. You do NOT write user-facing responses.
You ONLY classify what's in the message.

Categories of signals to look for:
- urgency_pressure (demands immediate action)
- money_request (asks for payment, wire, Zelle, gift cards, crypto)
- credential_request (asks for passwords, card numbers, SSN, codes)
- impersonation_family (claims to be a relative)
- impersonation_authority (claims to be bank, IRS, police, Medicare, tech support)
- unknown_number (sender claims known identity but number is unfamiliar)
- secrecy_request (asks user to keep this private)
- suspicious_link (contains shortened or unfamiliar URL)
- emotional_manipulation (uses fear, guilt, or affection to pressure)

Output a JSON object. No prose. No markdown fences.

Schema:
{
  "signals": [
    {
      "id": "s1",
      "label": "Short title (3-5 words)",
      "description": "1-2 sentence plain-English explanation",
      "severity": "low" | "medium" | "critical"
    }
  ],
  "preliminaryScore": 0-100
}

Score guidance:
- 0-34: no significant red flags
- 35-69: some concerns, ambiguous
- 70-100: multiple critical signals, very likely scam

Be precise. Do not invent signals that aren't in the message.
If the message has no red flags, return an empty signals array
and a low preliminaryScore.
```

### User prompt template
```
Message received from: {senderInfo}

Message:
"""
{messageText}
"""

Analyze this message. Return JSON only.
```

### Function signature
```typescript
export async function runAnalyzer(input: AnalyzerInput): Promise<AnalyzerOutput> {
  try {
    const raw = await callLLM({ systemPrompt, userPrompt });
    const parsed = extractJSON<AnalyzerOutput>(raw);
    // Validate at least the required fields exist
    if (!Array.isArray(parsed.signals)) throw new Error('bad shape');
    return parsed;
  } catch (err) {
    console.error('[analyzer] failed:', err);
    return { signals: [], preliminaryScore: 50 };  // safe fallback
  }
}
```

---

## 5. Agent 2: Investigator (`lib/agents/investigator.ts`)

### Purpose
Take the Analyzer's signals and verify them against the real world. Calls Bright Data and Butterbase. Then uses an LLM to summarize findings.

### Input
```typescript
type InvestigatorInput = {
  messageText: string;
  senderPhone: string;
  signals: AnalyzerOutput['signals'];
};
```

### Output
```typescript
type InvestigatorOutput = {
  evidence: Array<{
    id: string;
    source: string;
    finding: string;
    type: 'web_scrape' | 'family_memory' | 'official_policy';
  }>;
};
```

### Process (NOT pure LLM — this agent uses real tools)

1. **Web check (Bright Data):** Search `scamadviser.com` and Google for the sender's phone number. See spec 06.
2. **Family memory check (Butterbase):** Look up sender's phone in saved family contacts. See spec 07.
3. **Policy check (Bright Data, conditional):** If signals include `impersonation_authority`, scrape the impersonated org's security policy page (e.g., bankofamerica.com/security) for a relevant warning.
4. **LLM summarization:** Pass raw findings to LLM with the prompt below. LLM turns raw data into the `evidence` array.

### System prompt for summarization step
```
You are the Investigator agent in SafeCall Guardian.

Your job: turn raw research findings into clear, plain-English
evidence statements that an elderly user could understand.

You will receive:
- The original message
- Raw findings from web search
- Raw findings from family contact lookup
- (Optional) Raw findings from policy pages

Output a JSON object. No prose. No markdown fences.

Schema:
{
  "evidence": [
    {
      "id": "e1",
      "source": "Where this came from, e.g. scamadviser.com or 'Your family contacts'",
      "finding": "A clear, plain-English statement of what was found.
                  Maximum 2 sentences. No jargon.",
      "type": "web_scrape" | "family_memory" | "official_policy"
    }
  ]
}

Only include findings that are actually useful to the user.
Skip empty or irrelevant results. If you found nothing meaningful,
return { "evidence": [] }.
```

### Fallback
If Bright Data or Butterbase fail, return:
```typescript
{ evidence: [] }
```
The Guardian agent must still work even with zero evidence.

---

## 6. Agent 3: Guardian (`lib/agents/guardian.ts`)

### Purpose
Synthesize signals + evidence into a final score, an empathetic response, and action buttons.

### Input
```typescript
type GuardianInput = {
  messageText: string;
  senderPhone: string;
  signals: AnalyzerOutput['signals'];
  evidence: InvestigatorOutput['evidence'];
  preliminaryScore: number;
};
```

### Output
```typescript
type GuardianOutput = {
  finalScore: number;
  riskLevel: 'low' | 'medium' | 'critical';
  empathicResponse: string;
  actions: Array<{
    id: string;
    label: string;
    primary: boolean;
    icon: string;
  }>;
};
```

### System prompt
```
You are the Guardian agent in SafeCall Guardian, a scam-protection
assistant for elderly users (65-85 years old).

Your job: turn raw analysis into a warm, calming response the user
will actually trust. You ALWAYS write as if speaking to a worried
grandmother who just received a suspicious message.

Tone rules (non-negotiable):
- Calm before urgency. Open with reassurance, not alarm.
- Never blame the user. Never say "you fell for" or "you should have".
- Validate the act of checking: "You did the right thing by checking."
- Short sentences. Max 12 words per sentence.
- No jargon: never use "agent", "risk score", "engine", "AI".
- If risk is critical: gently propose a safe alternative action.
- If risk is low: a single sentence is enough.

Output a JSON object. No prose. No markdown fences.

Schema:
{
  "finalScore": 0-100,
  "riskLevel": "low" | "medium" | "critical",
  "empathicResponse": "The warm response, 1-3 sentences.",
  "actions": [
    {
      "id": "a1",
      "label": "Verb-led button text, e.g. 'Call Peter's real number'",
      "primary": true,
      "icon": "Lucide icon name, e.g. 'Phone'"
    }
  ]
}

Action button rules:
- Always 2-3 actions.
- Exactly one has primary: true.
- Primary action is what you most want the user to do.
- Icons must be valid lucide-react names: Phone, MessageCircle,
  Shield, Check, AlertTriangle, ShieldCheck.

Score guidance:
- Match Analyzer's preliminaryScore unless evidence changes the picture.
- If family memory confirms the sender is real and trusted, drop score below 30.
- If web search confirms scam reports, raise score above 80.
- riskLevel maps from finalScore: 0-34=low, 35-69=medium, 70-100=critical.
```

### User prompt template
```
Original message from: {senderPhone}
"""
{messageText}
"""

Signals detected by Analyzer:
{JSON.stringify(signals, null, 2)}

Evidence found by Investigator:
{JSON.stringify(evidence, null, 2)}

Analyzer's preliminary score: {preliminaryScore}

Write the Guardian output. JSON only.
```

### Fallback
If LLM call fails:
```typescript
{
  finalScore: 50,
  riskLevel: 'medium',
  empathicResponse: "Take a breath. Before doing anything, ask someone you trust to look at this with you.",
  actions: [
    { id: 'a1', label: 'Tell a family member', primary: true, icon: 'MessageCircle' },
  ],
}
```

---

## 7. Pipeline (`lib/agents/pipeline.ts`)

### Purpose
Run the three agents in sequence and assemble a `Scenario` object.

```typescript
import { runAnalyzer } from './analyzer';
import { runInvestigator } from './investigator';
import { runGuardian } from './guardian';
import { Scenario } from '@/lib/types';

export async function runPipeline(opts: {
  messageText: string;
  senderPhone: string;
  channel: 'sms' | 'call' | 'whatsapp';
}): Promise<Scenario> {

  const analyzerResult = await runAnalyzer({
    messageText: opts.messageText,
    senderInfo: `${opts.senderPhone}, ${opts.channel}`,
  });

  const investigatorResult = await runInvestigator({
    messageText: opts.messageText,
    senderPhone: opts.senderPhone,
    signals: analyzerResult.signals,
  });

  const guardianResult = await runGuardian({
    messageText: opts.messageText,
    senderPhone: opts.senderPhone,
    signals: analyzerResult.signals,
    evidence: investigatorResult.evidence,
    preliminaryScore: analyzerResult.preliminaryScore,
  });

  return {
    id: 'custom',
    message: {
      text: opts.messageText,
      from: opts.senderPhone,
      channel: opts.channel,
    },
    score: guardianResult.finalScore,
    riskLevel: guardianResult.riskLevel,
    signals: analyzerResult.signals,
    evidence: investigatorResult.evidence,
    empathicResponse: guardianResult.empathicResponse,
    actions: guardianResult.actions,
    agentTrace: {
      analyzer: `Detected ${analyzerResult.signals.length} signal(s). Preliminary score: ${analyzerResult.preliminaryScore}.`,
      investigator: `Found ${investigatorResult.evidence.length} piece(s) of evidence.`,
      guardian: `Composed empathetic response. Final score: ${guardianResult.finalScore}.`,
    },
  };
}
```

---

## 8. API endpoint (`app/api/analyze/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { runPipeline } from '@/lib/agents/pipeline';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text ?? '').trim();
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // For free-form input, we don't have a real sender phone.
    // Use a placeholder. The Investigator will skip the phone check.
    const scenario = await runPipeline({
      messageText: text,
      senderPhone: body.senderPhone ?? 'Unknown',
      channel: body.channel ?? 'sms',
    });

    return NextResponse.json(scenario);

  } catch (err) {
    console.error('[/api/analyze] error:', err);
    return NextResponse.json(
      { error: 'Analysis failed. Try again.' },
      { status: 500 }
    );
  }
}
```

---

## 9. Environment variables

```
ANTHROPIC_API_KEY=...
# or
OPENAI_API_KEY=...
```

---

## 10. Test plan

After implementing all three agents:

1. Run `curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"text":"Hi mom, want dinner tomorrow?","senderPhone":"+1 (650) 555-9988"}'`
   - Expect: `riskLevel: low`, score < 35, empathicResponse mentions it looks safe.

2. Same endpoint with the fake-son text:
   - Expect: `riskLevel: critical`, score > 80, multiple signals, empathicResponse mentions taking a breath / verifying.

3. Stop the LLM key, retry both:
   - Expect: fallback responses (no crash, calm message).

4. If Bright Data is down: still get a response with empty evidence array.

5. If Butterbase is down: still get a response (web findings only).

If all 5 pass, the agentic core is demo-ready for free-form judge input.

---

## 11. What this does NOT do (out of scope)

- Streaming responses (one-shot JSON only — simpler and faster for demo).
- Multi-turn conversation (no chat history).
- Tool-calling APIs (the agents call tools imperatively, not via LLM tool-use).
- Caching or rate limiting (5-hour build — out of scope).

---

## 12. Critical reminder

**The cached scenarios in spec 04 do NOT pass through this pipeline.** They are returned directly. This pipeline only runs when the user types free-form text on the Home screen.

This means: even if every agent is broken, the three-scenario demo still works perfectly. The pipeline is a bonus feature, not a dependency.
