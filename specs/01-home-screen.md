# Spec: Home Screen (Screen 1)

> First screen the judge sees. Must communicate the product in 5 seconds.
> Prerequisite: read `00-project-overview.md` first.

---

## 1. Goal

A clean landing page that does three jobs:

1. **Tell the judge what this product is** (one-line value prop).
2. **Let the judge run the demo** with one click per scenario.
3. **Let the judge type a free-form message** to test the real LLM (bonus).

This is the launchpad for the demo. It is NOT a marketing page.

---

## 2. File structure

```
app/
└── page.tsx                         ← server component, renders HomeScreen
components/
├── HomeScreen.tsx                   ← client component
├── ScenarioCard.tsx                 ← one card per cached scenario
└── FreeInputBox.tsx                 ← textarea + "Check this message" button
```

---

## 3. Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              SafeCall Guardian                              │
│       (small navy logo + name, top-left)                    │
│                                                             │
│                                                             │
│         Protect the people you love from scams.             │
│        (huge headline, 48px, centered)                      │
│                                                             │
│    A calm second opinion before they send money,            │
│       click a link, or share information.                   │
│        (subheadline, 24px, slate-600, ≤60ch)                │
│                                                             │
│                                                             │
│   ── Try a real example ──                                  │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Fake Son  │  │ Fake Bank  │  │ Real Son   │             │
│  │            │  │            │  │            │             │
│  │ (preview   │  │ (preview   │  │ (preview   │             │
│  │  of msg)   │  │  of call)  │  │  of msg)   │             │
│  │            │  │            │  │            │             │
│  │ [Check it] │  │ [Check it] │  │ [Check it] │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                             │
│                                                             │
│   ── Or paste any message ──                                │
│                                                             │
│  ┌──────────────────────────────────────────────┐           │
│  │  Paste a suspicious message or describe a    │           │
│  │  call you received…                          │           │
│  │                                              │           │
│  │                                              │           │
│  └──────────────────────────────────────────────┘           │
│                                                             │
│           [ Check this message ]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Mobile: single column, cards stack vertically.

---

## 4. Main container

```
min-h-screen bg-white text-slate-900
font-[Inter,system-ui,sans-serif] antialiased
```

Wrapper:
```
max-w-5xl mx-auto px-6 py-12
```

---

## 5. Header (logo)

```tsx
<header className="flex items-center gap-3 mb-16">
  <ShieldCheck className="w-8 h-8 text-blue-900" />
  <span className="text-xl font-bold text-slate-900">SafeCall Guardian</span>
</header>
```

---

## 6. Hero copy

Headline:
```
text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6
max-w-3xl
```
Text: **"Protect the people you love from scams."**

Subheadline:
```
text-2xl text-slate-600 leading-relaxed max-w-[60ch] mb-16
```
Text: **"A calm second opinion before they send money, click a link, or share information."**

---

## 7. Section labels

```
text-sm font-bold uppercase tracking-widest text-slate-500 mb-6
```

Sections in order:
1. **"Try a real example"**
2. **"Or paste any message"**

---

## 8. Scenario cards (`ScenarioCard.tsx`)

### Props
```typescript
type Props = {
  scenarioId: 'fake_son' | 'fake_bank' | 'legitimate';
  title: string;            // "Fake Son", "Fake Bank Call", "Real Son"
  preview: string;          // first ~80 chars of the message
  channel: 'sms' | 'call' | 'whatsapp';
};
```

### Card container
```
bg-white border-2 border-slate-200 hover:border-blue-900
rounded-2xl p-6 flex flex-col gap-4
transition-colors cursor-pointer
min-h-[280px]
```

### Card contents

```tsx
<article className="...">
  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-widest">
    <ChannelIcon className="w-4 h-4" />
    {channelLabel}
  </div>

  <h3 className="text-2xl font-bold text-slate-900">{title}</h3>

  <p className="text-base text-slate-700 leading-relaxed flex-1">
    "{preview}…"
  </p>

  <a
    href={`/analysis?scenario=${scenarioId}`}
    className="w-full min-h-[56px] bg-blue-900 hover:bg-blue-950
               text-white text-lg font-bold rounded-xl
               flex items-center justify-center gap-2
               transition-colors"
  >
    Check it now
    <ArrowRight className="w-5 h-5" />
  </a>
</article>
```

### Channel icon + label
- `sms` → `MessageSquare` icon, label: **"Text message"**
- `call` → `Phone` icon, label: **"Phone call"**
- `whatsapp` → `MessageCircle` icon, label: **"WhatsApp"**

### The 3 cards (exact data)

**Card 1 — Fake Son:**
- title: `"Fake Son"`
- preview: `Mom, dropped my phone in water. This is my new number. Can you send $4,800…`
- channel: `sms`

**Card 2 — Fake Bank Call:**
- title: `"Fake Bank Call"`
- preview: `Ma'am, this is Daniel from Bank of America fraud department. We detected a $2,300 suspicious transaction…`
- channel: `call`

**Card 3 — Real Son:**
- title: `"Real Son"`
- preview: `Hi mom, how was your day? Want to grab dinner tomorrow? I can pick you up at 6.`
- channel: `sms`

### Grid
```
grid grid-cols-1 md:grid-cols-3 gap-6 mb-20
```

---

## 9. Free input box (`FreeInputBox.tsx`)

### Layout
```tsx
<div className="bg-slate-50 rounded-2xl p-8 mb-12">
  <label htmlFor="free-input" className="sr-only">
    Paste a message
  </label>

  <textarea
    id="free-input"
    rows={4}
    placeholder="Paste a suspicious message or describe a call you received…"
    className="w-full text-xl leading-relaxed text-slate-900
               placeholder:text-slate-400 bg-white
               border-2 border-slate-200 focus:border-blue-900
               rounded-xl p-5 resize-none outline-none
               transition-colors"
    value={text}
    onChange={(e) => setText(e.target.value)}
  />

  <button
    onClick={handleCheck}
    disabled={!text.trim() || loading}
    className="mt-6 w-full min-h-[72px] bg-blue-900 hover:bg-blue-950
               disabled:bg-slate-300 disabled:cursor-not-allowed
               text-white text-xl font-bold rounded-2xl
               flex items-center justify-center gap-3
               transition-colors"
  >
    {loading ? 'Checking…' : 'Check this message'}
    {!loading && <ArrowRight className="w-6 h-6" />}
  </button>
</div>
```

### Behavior
1. User types in textarea.
2. Clicks "Check this message".
3. Component POSTs to `/api/analyze` with `{ text: string }`.
4. While waiting: button text becomes "Checking…", disabled.
5. When response arrives: store the result in `sessionStorage` under key `safecall:custom-result` and navigate to `/analysis?scenario=custom`.
6. The Analysis screen handles `scenario=custom` by reading from sessionStorage instead of `SCENARIOS` map.

### Error handling
If the API call fails: show below the button a calm message:
**"Something went wrong. Try one of the examples above."**
in `text-base text-red-700 mt-4 text-center`.

Never let it crash. Never show a stack trace.

---

## 10. Free input + Analysis screen handoff (sessionStorage contract)

When the API returns, store:
```typescript
sessionStorage.setItem('safecall:custom-result', JSON.stringify(scenario));
```
where `scenario` matches the `Scenario` type from `lib/types.ts`.

The Analysis screen, when it sees `?scenario=custom`, reads this storage value and renders it the same way as a cached scenario. If storage is empty, it shows the calm fallback error from spec 02 section 9.

This means the same Analysis component handles both cached and live results. No duplication.

---

## 11. Accessibility checklist

- [ ] Hero headline ≥ 48px
- [ ] All body text ≥ 20px
- [ ] All buttons ≥ 56px tall (scenario cards) or ≥ 72px (free input)
- [ ] Textarea text is ≥ 20px (so user can see what they typed)
- [ ] Card hover is **a clear border color change**, not a subtle shadow
- [ ] Tab order: logo → card 1 → card 2 → card 3 → textarea → submit button

---

## 12. Test plan

1. Load `/` → see hero, 3 cards, free input box.
2. Click "Check it now" on Fake Son card → navigates to `/analysis?scenario=fake_son`.
3. Click "Check it now" on Real Son card → navigates to `/analysis?scenario=legitimate`.
4. Type any text in free input → click "Check this message" → button shows "Checking…" → after API responds, navigates to `/analysis?scenario=custom`.
5. On mobile (narrow viewport): cards stack vertically, all text remains ≥ 20px.

If all 5 pass, this screen is demo-ready.

---

## 13. What this screen does NOT do (out of scope)

- Sign in / sign up (no auth in demo).
- Show recent message history (out of scope for 5h build).
- Settings or configuration (lives in Initial Setup screen, spec 03).
- Real-time call monitoring (that's the product vision, not the demo).

Keep it simple. The hero copy and the 3 cards are 90% of this screen's job. The free input is the cherry on top to impress judges that the agent works on real input, not just mocks.
