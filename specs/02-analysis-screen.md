# Spec: Analysis Screen (Screen 2)

> **This is THE demo screen.** Everything the judges see happen live runs through here. Build this immediately after Hello World + Zeabur deploy. Nothing else is more important.

> **Prerequisite:** read `00-project-overview.md` first for design principles, stack, and animation contract.

---

## 1. Goal

Show two layers at the same time:
- **User layer (grandma):** big score, big empathetic message, 3 clear action buttons.
- **Technical layer (judges):** sidebar with 3 agents (Analyzer → Investigator → Guardian) animating in sequence, each showing what they "thought."

Component receives `scenarioId` via URL query param (`/analysis?scenario=fake_son`), loads the matching mock, animates the agent trace, then reveals the final result.

---

## 2. Dependencies

```bash
npm i lucide-react
```

No Framer Motion. No other animation libraries. Just Tailwind transitions + `setTimeout`.

---

## 3. File structure

```
app/
└── analysis/
    └── page.tsx                 ← server component, reads searchParams
components/
├── AnalysisScreen.tsx           ← main client component
├── ScoreDisplay.tsx             ← huge 120px number + label
├── EmpathicMessage.tsx          ← warm response, large text
├── SignalCard.tsx               ← single detected signal
├── EvidenceCard.tsx             ← single Bright Data / family finding
├── ActionButton.tsx             ← big 64px-tall button
├── AgentTrace.tsx               ← sidebar with 3 agents
├── AgentStep.tsx                ← single step (pending / running / done)
└── OriginalMessage.tsx          ← shows the suspect message at the top
lib/
├── mockScenarios.ts             ← (see spec 04 — must exist before building this)
└── types.ts                     ← (see spec 04)
```

---

## 4. Server entry (`app/analysis/page.tsx`)

```tsx
import AnalysisScreen from '@/components/AnalysisScreen';
import { SCENARIOS } from '@/lib/mockScenarios';
import { notFound } from 'next/navigation';

type Props = {
  searchParams: { scenario?: string; skip?: string };
};

export default function AnalysisPage({ searchParams }: Props) {
  const scenarioId = searchParams.scenario ?? 'fake_son';
  const scenario = SCENARIOS[scenarioId];
  if (!scenario) notFound();

  const skipAnimation = searchParams.skip === '1';

  return <AnalysisScreen scenario={scenario} skipAnimation={skipAnimation} />;
}
```

---

## 5. Main component (`components/AnalysisScreen.tsx`)

### Props
```typescript
type Props = {
  scenario: Scenario;          // from lib/types.ts
  skipAnimation?: boolean;     // ?skip=1 forces immediate reveal
};
```

### State
```typescript
type Phase = 'analyzing' | 'investigating' | 'guarding' | 'complete';
const [phase, setPhase] = useState<Phase>(skipAnimation ? 'complete' : 'analyzing');
```

### Animation effect
```tsx
useEffect(() => {
  if (skipAnimation) return;
  const t1 = setTimeout(() => setPhase('investigating'), 1500);
  const t2 = setTimeout(() => setPhase('guarding'), 1500 + 1800);
  const t3 = setTimeout(() => setPhase('complete'), 1500 + 1800 + 1500);
  return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
}, [skipAnimation]);
```

### Render contract
- **Always visible:** original message at top, agent trace sidebar.
- **Only when `phase === 'complete'`:** score, empathic message, action buttons, signals, evidence.
- **During animation:** main column shows a calm placeholder ("Checking this message…" 24px) with a subtle pulsing dot. **No spinners.** Loading is communicated entirely through the agent trace sidebar.

### Layout (desktop)
```
┌────────────────────────────────────────────────┬───────────────────────┐
│  [Original message card — top of main column]  │                       │
│                                                │   AGENT TRACE         │
│           [SCORE — 120px, centered]            │                       │
│                                                │   ● Analyzer    done  │
│        [Empathic message — 24px, ≤60ch]        │   ◐ Investigator      │
│                                                │     running…          │
│  [PRIMARY ACTION — 72px, full width]           │   ○ Guardian  pending │
│  [Secondary]   [Secondary]                     │                       │
│                                                │   [per-agent log      │
│  ──── Signals detected ────                    │    appears as each    │
│  [Signal] [Signal] [Signal]                    │    finishes]          │
│                                                │                       │
│  ──── Evidence ────                            │                       │
│  [Evidence] [Evidence]                         │                       │
└────────────────────────────────────────────────┴───────────────────────┘
```

### Layout (mobile)
Single column. Agent trace appears at bottom of page when `phase === 'complete'`, but during animation it sits right below the original message so judges still see it animating.

---

## 6. Tailwind tokens

### Main container
```
min-h-screen bg-white text-slate-900
font-[Inter,system-ui,sans-serif] antialiased
```

### Grid wrapper
```
grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8
max-w-7xl mx-auto px-6 py-10
```

### Original message card (`OriginalMessage.tsx`)
```
bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-10
```
- Label above: `text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3`
- Sender line: `text-base text-slate-600 mb-3`
- Message body: `text-xl text-slate-900 leading-relaxed`

### Score (`ScoreDisplay.tsx`)
- Wrapper: `flex flex-col items-center my-8`
- Number: `text-[120px] leading-none font-bold tabular-nums`
- Color by risk level:
  - critical → `text-red-600`
  - medium → `text-amber-600`
  - low → `text-emerald-600`
- Label below: `text-xl font-semibold mt-2`
  - critical → `text-red-700` text: **"High concern"**
  - medium → `text-amber-700` text: **"Some concern"**
  - low → `text-emerald-700` text: **"Looks safe"**
- Subtext: `text-base text-slate-500` text: **"out of 100"**

> **Never write "score" or "risk score" on this label.** Use "level of concern" wording.

### Empathic message (`EmpathicMessage.tsx`)
```
max-w-[60ch] mx-auto
text-2xl leading-relaxed text-slate-800
text-center my-8
```

### Action buttons (`ActionButton.tsx`)
Primary:
```
w-full min-h-[72px] bg-blue-900 hover:bg-blue-950
text-white text-xl font-bold rounded-2xl
flex items-center justify-center gap-3
px-8 transition-colors
```

Secondary:
```
flex-1 min-h-[64px] bg-white border-2 border-slate-300
hover:border-slate-500 text-slate-900 text-lg font-semibold
rounded-2xl flex items-center justify-center gap-3 px-6
transition-colors
```

Container for secondaries:
```
grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4
```

> Primary uses `bg-blue-900` (= our `#1e3a8a`). Never red on primary action even for critical risk — red is reserved for the score itself.

### Signal card (`SignalCard.tsx`)
```
bg-white border-2 rounded-xl p-5
border-{color}-200
```
where `color` = `red` (critical) | `amber` (medium) | `emerald` (low).

- Icon (lucide: `AlertTriangle` for critical, `AlertCircle` for medium, `CheckCircle2` for low): `w-6 h-6 text-{color}-600 mb-3`
- Label: `text-lg font-bold text-slate-900 mb-1`
- Description: `text-base text-slate-700 leading-relaxed`

Grid: `grid grid-cols-1 md:grid-cols-2 gap-4`

### Evidence card (`EvidenceCard.tsx`)
```
bg-slate-50 border border-slate-200 rounded-xl p-5
flex gap-4
```
- Icon by `type`:
  - `web_scrape` → `Globe` icon, `text-blue-700`
  - `family_memory` → `Users` icon, `text-emerald-700`
  - `official_policy` → `ShieldCheck` icon, `text-blue-700`
- Source label: `text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1`
- Finding: `text-lg text-slate-900 leading-relaxed`

### Section headers (Signals, Evidence)
```
text-sm font-bold uppercase tracking-widest text-slate-500
mt-12 mb-4
```

---

## 7. Agent trace sidebar (`AgentTrace.tsx`)

### Container
```
bg-slate-950 text-slate-100 rounded-2xl p-6
font-mono text-sm
lg:sticky lg:top-10 lg:self-start
```

> Dark sidebar contrasts with the warm white main column. This is the **judge-facing** layer. Mono font signals "real engineering."

### Header
```tsx
<div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest mb-6">
  <Cpu className="w-4 h-4" />
  Agent execution
</div>
```

### Each `AgentStep`
Status states: `pending` | `running` | `done`

```tsx
<div className="mb-6">
  <div className="flex items-center gap-3 mb-2">
    <span className={statusDotClasses[status]} />
    <span className="text-slate-100 font-semibold">{agentName}</span>
    <span className="ml-auto text-xs text-slate-500">{statusLabel}</span>
  </div>
  {status === 'running' && (
    <div className="text-slate-400 pl-6">Working…</div>
  )}
  {status === 'done' && (
    <div className="text-slate-300 pl-6 leading-relaxed">{logText}</div>
  )}
</div>
```

Status dot classes:
- pending: `w-3 h-3 rounded-full bg-slate-700`
- running: `w-3 h-3 rounded-full bg-amber-400 animate-pulse`
- done: `w-3 h-3 rounded-full bg-emerald-400`

Status label text:
- pending: `pending`
- running: `running…`
- done: `done`

Agent names exactly:
1. `Analyzer`
2. `Investigator`
3. `Guardian`

Log text comes from `scenario.agentTrace.{analyzer | investigator | guardian}`.

### Phase → status mapping
```typescript
function getStatus(agent: 'analyzer' | 'investigator' | 'guardian', phase: Phase) {
  const order: Phase[] = ['analyzing', 'investigating', 'guarding', 'complete'];
  const agentIndex = { analyzer: 0, investigator: 1, guardian: 2 }[agent];
  const phaseIndex = order.indexOf(phase);
  if (phaseIndex > agentIndex) return 'done';
  if (phaseIndex === agentIndex) return 'running';
  return 'pending';
}
```

When `phase === 'complete'`, all three show `done` with logs visible. This is the state judges see for most of the demo.

---

## 8. Copy (exact English text, do not change without checking design principles in spec 00)

### Original message card
- Label above: **"Message received"**
- Sender prefix: **"From "** then the phone number

### During animation (main column placeholder)
- **"Checking this message…"** (text-2xl text-slate-500 centered)

### Score labels
- 0–34: **"Looks safe"**
- 35–69: **"Some concern"**
- 70–100: **"High concern"**
- Subtext under number: **"out of 100"**

### Section headers
- **"Signals detected"** (only if `signals.length > 0`)
- **"Evidence"** (only if `evidence.length > 0`)

### Agent trace
- Title: **"Agent execution"**
- Per-agent status: `pending` / `running…` / `done`

### Empathic message
Comes directly from `scenario.empathicResponse`. Do not modify.

### Action buttons
Come directly from `scenario.actions`. Render `lucide-react` icon by name (each `ActionButton` looks up the icon dynamically from the `icon` field).

---

## 9. Loading & error fallbacks

- If `scenario` is `undefined`: render a calm error screen, **not** a crash. Text: **"We couldn't load this check. Try again from the home screen."** + button back to `/`.
- If `skipAnimation === true`: render immediately in `complete` state. No setTimeouts fire.
- The main column **never shows a spinner**. Loading is exclusively communicated through the agent trace sidebar.

---

## 10. Accessibility checklist (verify before marking done)

- [ ] All main-UI text ≥ 20px (agent trace sidebar exempt — that's for judges, 14px mono is fine)
- [ ] No light gray text on white background
- [ ] Score uses `tabular-nums` so digits don't shift width
- [ ] All buttons ≥ 64px tall, ≥ 16px gap between them
- [ ] Empathic message ≤ 60 characters per line
- [ ] Primary button is the only blue-filled button; secondaries are bordered
- [ ] No red anywhere except the score number itself when critical
- [ ] Original message card uses muted slate, NOT red — we don't want to scare the user before analysis completes

---

## 11. Test plan (manual, during build)

Visit these URLs after deploy:

1. `/analysis?scenario=fake_son` → animation runs, ends with score **92**, red.
2. `/analysis?scenario=fake_bank` → animation runs, ends with score **88**, red.
3. `/analysis?scenario=legitimate` → animation runs, ends with score **12**, green. **No alarming language.** This proves the agent isn't paranoid.
4. `/analysis?scenario=fake_son&skip=1` → renders complete state instantly (used if live demo timing gets tight).
5. `/analysis?scenario=does_not_exist` → graceful 404 or fallback, no crash.

If all five pass, this screen is demo-ready.

---

## 12. What this screen does NOT do (out of scope)

- Real LLM calls for the 3 cached scenarios — they're mocks (spec 04 has the data).
- Real-time Bright Data scraping during the demo — findings are pre-baked in mock data. Bright Data fires on a separate "investigate" endpoint that the Home screen demonstrates separately.
- Saving evidence to Butterbase — that's the "Save evidence" button's job, handled in a separate spec.
- Free-form judge input — handled by the Home screen's "Check a new message" flow (separate spec).

Keep this screen focused. It exists to render a beautiful, fast, judge-impressing analysis of a known scenario. That's it.
