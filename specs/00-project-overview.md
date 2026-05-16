# SafeCall Guardian — Project Overview

> **Read this first.** Every other spec assumes you've read this file. Open it before implementing any screen, agent, or integration.

---

## 1. What we're building

SafeCall Guardian is an **agentic scam-protection assistant for elderly users**. It analyzes incoming messages (SMS, calls, WhatsApp) and tells the user — in calm, warm language — whether it's safe.

**Primary user:** US-based adult aged 65–85. Low tech literacy. May have mild visual or motor impairment.
**Secondary user:** Their adult child / family member. Configures the app and receives alerts.

**Why this wins judging:**
- **Real problem:** Elderly scam losses in the US topped $3B in recent FTC reports. Personal, specific pain.
- **Agentic:** 3 distinct LLM agents working in sequence (visible to judges via UI panel).
- **Sponsor usage:** Bright Data (live scam-report scraping), Butterbase (family memory), Zeabur (deploy).
- **Design as pitch:** Senior-accessible UI differentiates from 30 generic dashboards.

---

## 2. Hackathon constraints (non-negotiable)

- **Build time:** 5 hours total on May 16, 2026.
- **Submission deadline:** 4:30 PM.
- **Demo length:** 3 minutes.
- **Backup video:** must be recorded by 2:30 PM.
- **Deploy to Zeabur:** as soon as Hello World runs. Never leave for last minute.

### What this means for code
- **Minimalism over completeness.** If a feature doesn't appear in the demo, cut it.
- **Mocks over real calls** for the 3 demo scenarios. Real LLM calls only for free-form judge input (bonus).
- **Every feature must have a fallback** so the demo can't break live.
- **No experimental libraries.** Stick to what's proven and fast to ship.

---

## 3. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Fast setup, deploys to Zeabur in one click |
| Styling | Tailwind CSS | Token system fits senior design constraints |
| Font | Inter (via `next/font/google`) | High legibility, free, no license issues |
| Icons | `lucide-react` | Clean, lightweight, no extra config |
| Backend | Next.js API routes (serverless) | No separate Node server to deploy |
| Database / Memory | **Butterbase** | Stores family contacts + evidence log |
| Web investigation | **Bright Data** | Scrapes scamadviser.com + bank policy pages |
| LLM | OpenAI or Anthropic SDK (whichever the team has keys for) | Powers the 3 agents |
| Deploy | **Zeabur** | One-click deploy from GitHub |

### Required sponsor tools (we use all three with visible roles)
1. **Bright Data** → "Investigator" agent uses it to scrape live scam reports.
2. **Butterbase** → stores family contacts (so Analyzer can detect "this isn't Peter's real number") and saves evidence after each analysis.
3. **Zeabur** → production deploy. Public URL visible during demo.

---

## 4. Architecture

### Three agents (three LLM calls with different prompts)

```
        ┌──────────────┐      ┌────────────────┐      ┌──────────────┐
input → │   ANALYZER   │  →   │  INVESTIGATOR  │  →   │   GUARDIAN   │ → output
        │  (signals)   │      │  (web + memory)│      │  (response)  │
        └──────────────┘      └────────────────┘      └──────────────┘
```

- **Analyzer:** reads the incoming message. Extracts risk signals (urgency, money request, impersonation, etc.). Outputs JSON.
- **Investigator:** takes Analyzer's signals. Calls Bright Data to check the sender's number against scam databases. Calls Butterbase to compare against family contacts. Outputs JSON.
- **Guardian:** synthesizes everything. Writes the warm, empathetic response shown to the user. Chooses the action buttons. Outputs JSON.

### Three screens
1. **Home** — list of recent messages + "Check a new message" button. 3 demo scenario cards visible.
2. **Analysis** — *THE demo screen.* Shows score + empathic message + actions + live agent trace.
3. **Initial Setup** — onboarding for the family member to register elderly user's contacts.

### Three cached demo scenarios
1. **Fake Son** (primary demo) — score 92, critical.
2. **Fake Bank Call** (secondary) — score 88, critical.
3. **Legitimate Message** (proves agent isn't paranoid) — score 12, low risk.

> **Scenario 3 is non-negotiable.** It's what proves to judges the agent is intelligent, not just trigger-happy.

---

## 5. Demo strategy (5-min build implication)

The demo screen must show **two layers simultaneously**:

- **Main layer:** what grandma would see — big score, big text, big buttons, calm tone.
- **Technical layer:** sidebar showing the 3 agents executing live (Analyzer → Investigator → Guardian). Each agent has its own log line.

The technical layer is what sells "agentic" to judges. The main layer is what sells "real product for real users." Both must be visible in the same screenshot.

### Animation contract
- When user clicks a scenario, navigate to `/analysis?scenario=fake_son`.
- On mount, the Analysis screen animates the agent trace:
  - Analyzer runs for **1500ms** (status: running)
  - Investigator runs for **1800ms** (status: running)
  - Guardian runs for **1500ms** (status: running)
  - Then the main result reveals (score, message, actions).
- Total animation: ~4.8 seconds. Long enough to feel like real work, short enough for a 3-min demo.
- **Fallback:** `?skip=1` in URL forces immediate reveal. Use this if anything goes wrong live or if recording the backup video and you need tight timing.

---

## 6. Design principles (non-negotiable, even under time pressure)

These exist because senior users are the user. Violating these = losing the design-as-pitch advantage.

### Typography
- **Body text:** minimum 20px
- **Labels:** minimum 18px
- **Headings:** 32–48px
- **The score on Analysis screen:** 96–120px (this is the hero element)
- **Font family:** Inter or system-ui
- **Weights:** regular for body, bold for primary actions only

### Color & contrast
- WCAG AAA minimum (7:1 for text, 4.5:1 for UI elements)
- Primary: navy blue `#1e3a8a` on white
- Critical risk: red `#dc2626`
- Medium risk: amber `#d97706`
- Low risk: green `#059669`
- **Never** use light gray text on white background
- **Avoid red** except for critical risk states

### Spacing
- Container padding: minimum **24px**
- Between elements: minimum **16px**
- Buttons: minimum **56px tall**, ideally **64px**, wide tap area
- Space between buttons: minimum **16px** (prevents misclicks)
- Max line length: **60 characters**

### Language
- Sentences: **max 12 words per instruction**
- Warm, simple, never corporate-SaaS
- ✅ "Take a breath. Let's check this together."
- ❌ "Risk analysis in progress…"
- ✅ "You did the right thing by checking."
- ❌ "Suspicious content detected."
- **Never** use technical jargon in the main UI — no "agent", "risk score", "engine"
- **Exception:** the agent-trace sidebar IS for judges, jargon is fine there

### Interaction
- Each screen has **1 primary action + maximum 2 secondary actions**
- Primary button is larger, bolder, with a clear verb ("Check this now")
- Immediate visual feedback on every action
- No subtle hover effects — elderly users need it obvious what's clickable
- Loading states must explain what's happening: "Checking the number…" "Searching public scam reports…" — these become the agent-trace logs

### Emotional tone
- **Never blame the user** ("You fell for a scam")
- **Always validate** ("You did the right thing by checking")
- **Calm before urgency** ("Take a breath. Let's verify.")

---

## 7. Folder structure

```
safecall-guardian/
├── specs/                       ← all .md spec files
├── app/
│   ├── page.tsx                 ← Home screen
│   ├── analysis/
│   │   └── page.tsx             ← Analysis screen (server entry)
│   ├── setup/
│   │   └── page.tsx             ← Initial setup
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts         ← real LLM endpoint (bonus: free-form input)
│   │   └── investigate/
│   │       └── route.ts         ← Bright Data endpoint
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── AnalysisScreen.tsx
│   ├── ScoreDisplay.tsx
│   ├── EmpathicMessage.tsx
│   ├── SignalCard.tsx
│   ├── EvidenceCard.tsx
│   ├── ActionButton.tsx
│   ├── AgentTrace.tsx
│   └── AgentStep.tsx
├── lib/
│   ├── mockScenarios.ts         ← 3 cached scenarios
│   ├── types.ts
│   ├── agents/
│   │   ├── analyzer.ts          ← prompt + LLM call
│   │   ├── investigator.ts
│   │   └── guardian.ts
│   ├── butterbase.ts            ← Butterbase client wrapper
│   └── brightdata.ts            ← Bright Data client wrapper
├── public/
├── .env.local
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 8. Environment variables (`.env.local`)

```
# LLM
OPENAI_API_KEY=...
# or
ANTHROPIC_API_KEY=...

# Bright Data
BRIGHT_DATA_API_KEY=...
BRIGHT_DATA_ZONE=...

# Butterbase
BUTTERBASE_API_KEY=...
BUTTERBASE_PROJECT_ID=...

# App
NEXT_PUBLIC_APP_URL=https://safecall-guardian.zeabur.app
```

Each integration spec lists exactly which vars it needs.

---

## 9. Build order (5-hour plan)

| Time | Milestone | Owner |
|---|---|---|
| 0:00–0:30 | Repo setup, Next.js Hello World, deploy to Zeabur (LIVE URL) | 1 dev |
| 0:30–2:30 | Analysis screen with mock scenarios working end-to-end | All devs |
| 2:30–3:30 | Home screen + scenario navigation + real LLM endpoint for free input | Split |
| 3:30–4:00 | Bright Data + Butterbase wired in (even if for one scenario only) | 1 dev |
| 4:00–4:30 | **Record backup demo video** | Felipe |
| 4:30–5:00 | Polish, final deploy, prep pitch |  |

**Critical rules:**
- If the Analysis screen isn't working by hour 2:30, **stop adding features**. Fix what exists.
- Backup video must be recorded even if final version isn't perfect yet.
- Anything not in the 3-minute demo is cut without discussion.

---

## 10. How to use these specs

When implementing a screen or feature, the team should run in Claude Code:

```
> Read specs/00-project-overview.md first for full context.
> Then read specs/02-analysis-screen.md and implement exactly as described.
> If anything is ambiguous, ask before guessing.
```

Specs are the source of truth. If reality diverges from a spec during build, update the spec — don't let code and docs drift apart.
