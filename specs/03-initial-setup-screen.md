# Spec: Initial Setup Screen (Screen 3)

> Onboarding for the family member to register the elderly user's trusted contacts.
> **Build this last.** Only build if hours 0–3:30 are clean.
> Prerequisite: read `00-project-overview.md` first.

---

## 1. Goal

A two-step form where an adult child (the "family member" user) sets up SafeCall Guardian for their elderly parent. Output: a list of trusted contacts saved to Butterbase that the Investigator agent uses as ground truth.

This screen is **secondary to the demo**, but it sells the product story: "this app knows who your real son is, so when a scammer impersonates him, we catch it."

---

## 2. File structure

```
app/
└── setup/
    └── page.tsx                     ← server entry
components/
├── SetupScreen.tsx                  ← client component
├── SetupStepProfile.tsx             ← step 1: elderly user's name
├── SetupStepContacts.tsx            ← step 2: trusted contacts
└── ContactRow.tsx                   ← single contact input row
```

---

## 3. Two-step flow

### Step 1: Tell us about your loved one

```
┌─────────────────────────────────────────────┐
│                                             │
│   Let's set up protection together.         │
│   (48px headline)                           │
│                                             │
│   This takes about 2 minutes.               │
│   (24px subhead, slate-600)                 │
│                                             │
│                                             │
│   Who are we protecting?                    │
│                                             │
│   Their first name                          │
│   ┌─────────────────────────────────────┐   │
│   │ Mary                                │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Their relationship to you                 │
│   ┌─────────────────────────────────────┐   │
│   │ Mother  ▼                           │   │
│   └─────────────────────────────────────┘   │
│                                             │
│                                             │
│   [ Continue ]                              │
│                                             │
└─────────────────────────────────────────────┘
```

### Step 2: Their trusted contacts

```
┌─────────────────────────────────────────────┐
│                                             │
│   Who does Mary talk to most?               │
│                                             │
│   We use this to spot impersonators.        │
│                                             │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ Peter                               │   │
│   │ Son                                 │   │
│   │ (650) 555-9988                      │   │
│   │                              [×]    │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ Ana                                 │   │
│   │ Daughter                            │   │
│   │ (415) 555-2244                      │   │
│   │                              [×]    │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   [ + Add another contact ]                 │
│                                             │
│                                             │
│   [ Finish setup ]                          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. Main container

```
min-h-screen bg-white text-slate-900
font-[Inter,system-ui,sans-serif] antialiased
```

Wrapper:
```
max-w-2xl mx-auto px-6 py-12
```

---

## 5. State

```typescript
type Step = 'profile' | 'contacts';
const [step, setStep] = useState<Step>('profile');

const [profile, setProfile] = useState({
  firstName: '',
  relationship: 'Mother',
});

const [contacts, setContacts] = useState([
  { name: 'Peter', relationship: 'Son', phone: '(650) 555-9988' },
  { name: 'Ana', relationship: 'Daughter', phone: '(415) 555-2244' },
]);
```

> Pre-fill with the demo data above. The demo flow is: judge sees the form already filled (showing what setup looks like) and clicks "Finish setup".

---

## 6. Form fields

### Text input
```
w-full min-h-[64px]
text-xl text-slate-900 bg-white
border-2 border-slate-300 focus:border-blue-900
rounded-xl px-5
placeholder:text-slate-400
outline-none transition-colors
```

### Field label
```
text-lg font-semibold text-slate-700 mb-2 block
```

### Field group (label + input)
```
mb-6
```

### Select (relationship dropdown)
Same styling as text input, with options: `Mother`, `Father`, `Grandmother`, `Grandfather`, `Aunt`, `Uncle`, `Other`.

---

## 7. Contact row (`ContactRow.tsx`)

### Props
```typescript
type Props = {
  contact: { name: string; relationship: string; phone: string };
  onChange: (c: typeof contact) => void;
  onRemove: () => void;
};
```

### Container
```
bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-4
relative
```

### Three stacked inputs (name, relationship, phone)
Each label + input as in section 6.

### Remove button (top-right)
```tsx
<button
  onClick={onRemove}
  className="absolute top-4 right-4 w-10 h-10 rounded-full
             hover:bg-slate-200 flex items-center justify-center
             transition-colors"
  aria-label="Remove this contact"
>
  <X className="w-5 h-5 text-slate-600" />
</button>
```

---

## 8. "Add another contact" button

```
w-full min-h-[64px] border-2 border-dashed border-slate-300
hover:border-blue-900 hover:bg-blue-50
text-slate-700 hover:text-blue-900 text-lg font-semibold
rounded-2xl flex items-center justify-center gap-2
transition-colors mb-8
```

Text: **"+ Add another contact"**

---

## 9. Primary action buttons

Step 1 button text: **"Continue"**
Step 2 button text: **"Finish setup"**

Styling (same as Analysis screen primary):
```
w-full min-h-[72px] bg-blue-900 hover:bg-blue-950
disabled:bg-slate-300 disabled:cursor-not-allowed
text-white text-xl font-bold rounded-2xl
flex items-center justify-center gap-3
transition-colors
```

### "Continue" behavior
- Disabled if `firstName` is empty.
- On click: `setStep('contacts')`.

### "Finish setup" behavior
- Disabled if `contacts.length === 0`.
- On click:
  1. POST `/api/setup` with `{ profile, contacts }`.
  2. Show button text **"Saving…"** while waiting.
  3. On success: navigate to `/` (home).
  4. On failure: show calm error message below button: **"We couldn't save this. Try again."** in `text-base text-red-700 text-center mt-4`.

---

## 10. Backend endpoint (`app/api/setup/route.ts`)

### Method: POST

### Request body
```typescript
{
  profile: { firstName: string; relationship: string };
  contacts: Array<{ name: string; relationship: string; phone: string }>;
}
```

### Behavior
1. Call Butterbase to save the profile under a key like `protected_user`.
2. Call Butterbase to save each contact under `trusted_contacts/{phone-digits-only}`.
3. Return `{ success: true }`.

If Butterbase is not yet wired in: return success and log to console. The Investigator agent already has fallback mock contacts in spec 04. **Do not block this screen on Butterbase being live.**

See `07-butterbase-integration.md` for the actual client wrapper.

---

## 11. Copy (exact English)

### Step 1
- Headline: **"Let's set up protection together."**
- Subhead: **"This takes about 2 minutes."**
- Section title: **"Who are we protecting?"**
- Field label: **"Their first name"**
- Field label: **"Their relationship to you"**
- Button: **"Continue"**

### Step 2
- Headline (replaces step 1 headline): **"Who does Mary talk to most?"**
  - Replace "Mary" with `{profile.firstName}` dynamically.
- Subhead: **"We use this to spot impersonators."**
- Field labels in each contact row: **"Their name"**, **"Their relationship"**, **"Their phone number"**
- Add button: **"+ Add another contact"**
- Submit button: **"Finish setup"**

### After save
Redirect to `/`. No success screen — saving time.

---

## 12. Accessibility checklist

- [ ] Headlines ≥ 48px
- [ ] Input text ≥ 20px (so eye can see what's being typed)
- [ ] Labels ≥ 18px
- [ ] Inputs ≥ 64px tall
- [ ] Primary buttons ≥ 72px tall
- [ ] Tab order follows visual order (top to bottom, left to right)
- [ ] Remove-contact button has `aria-label`
- [ ] Phone input uses `type="tel"` for mobile keyboards
- [ ] First name uses `autoComplete="given-name"`

---

## 13. Test plan

1. Load `/setup` → see step 1 with empty `firstName`.
2. Type "Mary" → click Continue → see step 2 with two pre-filled contacts.
3. Click `[+ Add another contact]` → see a new empty row appear.
4. Click `[×]` on a contact → row disappears.
5. Click "Finish setup" → button shows "Saving…" → redirects to `/`.
6. Refresh `/setup` → form resets (no persistence between visits in demo).

---

## 14. What this screen does NOT do (out of scope)

- Save data to a real database (Butterbase wire-up is optional for the demo).
- Validate phone number format strictly (judges aren't typing real numbers).
- Verify the elderly user's identity.
- Upload photos or voice samples.
- Connect to phone carrier APIs.

This is a polished mock of what setup would look like. It exists to make the product feel complete, not to be a real onboarding flow.
