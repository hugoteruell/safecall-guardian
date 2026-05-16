# Spec: Bright Data Integration

> Sponsor tool #1. The Investigator agent uses Bright Data to scrape
> live scam reports and bank security policies.
> Prerequisite: read `00-project-overview.md` and `05-agents-architecture.md`.

---

## 1. Goal

Two functions that the Investigator agent calls:

1. `searchScamReports(phone)` — checks if the sender phone number appears in public scam-report sites (scamadviser.com, 800notes.com, etc.).
2. `fetchOfficialPolicy(orgName)` — fetches the security policy page of an impersonated organization (Bank of America, IRS, etc.) and returns relevant warnings.

Both functions:
- Return a structured `RawFinding` array.
- Have a 5-second timeout.
- Return an empty array on failure (never crash).

---

## 2. File structure

```
lib/
└── brightdata.ts             ← Bright Data client wrapper
```

---

## 3. What Bright Data is (for the strategist)

Bright Data is a web-scraping platform. We send them a URL, they fetch the page (handling proxies, captchas, JavaScript rendering), and return clean HTML or extracted data.

We use them because:
- Scraping scam-report sites directly often gets blocked (rate limits, captchas).
- Bright Data is one of the sponsor tools — using it ticks the "Sponsored Product Usage" judging box.

---

## 4. Bright Data API basics

Bright Data offers a Web Unlocker API. The typical call:

```
POST https://api.brightdata.com/dca/trigger?queue_next=1
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "zone": "your_zone_name",
  "url": "https://www.scamadviser.com/check-website/14155550142",
  "format": "raw"
}
```

Response is the raw HTML of the target page.

> **Hackathon note:** the exact API shape may differ depending on your Bright Data account type. The team should check the Bright Data dashboard for the actual endpoint and headers when they get the API key. The structure below is the right shape — the URL/headers may need a 1-line tweak.

---

## 5. Type definitions (`lib/brightdata.ts`)

```typescript
export type RawFinding = {
  source: string;              // human-readable, e.g. "scamadviser.com"
  url: string;                 // the URL we scraped
  rawText: string;             // the extracted text (first 2000 chars)
};

export type BrightDataResult =
  | { ok: true; findings: RawFinding[] }
  | { ok: false; error: string };
```

---

## 6. Core scraping helper

```typescript
async function scrapePage(url: string, source: string): Promise<RawFinding | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('https://api.brightdata.com/dca/trigger?queue_next=1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone: process.env.BRIGHT_DATA_ZONE,
        url,
        format: 'raw',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const html = await res.text();
    const text = stripHtml(html).slice(0, 2000);

    return { source, url, rawText: text };
  } catch (err) {
    console.error(`[brightdata] scrape failed for ${url}:`, err);
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
```

---

## 7. `searchScamReports(phone)` function

### Purpose
Check the sender's phone number against scam-report databases.

### Implementation
```typescript
export async function searchScamReports(phone: string): Promise<RawFinding[]> {
  // Normalize phone: strip everything but digits
  const digits = phone.replace(/\D/g, '');

  // We try 2 sites in parallel; whichever responds, we use.
  const urls = [
    {
      url: `https://www.scamadviser.com/check-phone/${digits}`,
      source: 'scamadviser.com',
    },
    {
      url: `https://800notes.com/Phone.aspx/1-${digits}`,
      source: '800notes.com',
    },
  ];

  const results = await Promise.all(
    urls.map(({ url, source }) => scrapePage(url, source))
  );

  return results.filter((r): r is RawFinding => r !== null);
}
```

### What the LLM does with these findings
The raw text gets passed to the Investigator's summarization step (spec 05 section 5, step 4). The LLM reads the raw text and writes one of:
- `"This number appears in 47 scam reports in the last 30 days."`
- `"No reports found for this number."`
- `"Multiple users on 800notes.com flagged this number as a robocall."`

---

## 8. `fetchOfficialPolicy(orgName)` function

### Purpose
If a scammer impersonates a known organization, fetch that org's official security guidance to back up our warning.

### Mapping
We hardcode a small map of organizations → policy URLs:
```typescript
const POLICY_URLS: Record<string, { url: string; source: string }> = {
  'bank of america': {
    url: 'https://www.bankofamerica.com/security-center/overview/',
    source: 'bankofamerica.com/security',
  },
  'chase': {
    url: 'https://www.chase.com/digital/resources/privacy-security',
    source: 'chase.com/security',
  },
  'wells fargo': {
    url: 'https://www.wellsfargo.com/privacy-security/',
    source: 'wellsfargo.com/security',
  },
  'irs': {
    url: 'https://www.irs.gov/newsroom/tax-scams-consumer-alerts',
    source: 'irs.gov',
  },
  'medicare': {
    url: 'https://www.medicare.gov/forms-help-resources/help-fight-medicare-fraud',
    source: 'medicare.gov',
  },
};
```

### Implementation
```typescript
export async function fetchOfficialPolicy(orgName: string): Promise<RawFinding[]> {
  const key = orgName.toLowerCase().trim();
  const entry = POLICY_URLS[key];
  if (!entry) return [];

  const finding = await scrapePage(entry.url, entry.source);
  return finding ? [finding] : [];
}
```

---

## 9. How the Investigator uses these

In `lib/agents/investigator.ts`:

```typescript
import { searchScamReports, fetchOfficialPolicy } from '@/lib/brightdata';
import { lookupFamilyContact } from '@/lib/butterbase';

export async function runInvestigator(input: InvestigatorInput) {
  // Run all lookups in parallel for speed.
  const [scamFindings, familyMatch, policyFindings] = await Promise.all([
    searchScamReports(input.senderPhone),
    lookupFamilyContact(input.senderPhone),
    detectImpersonatedOrg(input.signals)
      .then(org => org ? fetchOfficialPolicy(org) : []),
  ]);

  // Pass raw findings to LLM for summarization (see spec 05 section 5).
  // ...
}

function detectImpersonatedOrg(signals: AnalyzerOutput['signals']): Promise<string | null> {
  // Look through signal descriptions for known org names.
  const text = signals.map(s => s.description).join(' ').toLowerCase();
  for (const key of Object.keys(POLICY_URLS)) {
    if (text.includes(key)) return Promise.resolve(key);
  }
  return Promise.resolve(null);
}
```

---

## 10. Environment variables

```
BRIGHT_DATA_API_KEY=...
BRIGHT_DATA_ZONE=...
```

Add these to:
1. `.env.local` for dev
2. Zeabur project settings for production

---

## 11. Demo strategy

### What the judges see
In the agent trace sidebar, the Investigator's log line says:
**"Searched scamadviser.com and your family contacts. Found 47 scam reports for this number."**

This sells Bright Data without the judge having to know what it is.

### Backup
**The cached scenarios already include realistic Bright Data findings.** So even if Bright Data is unreachable from the venue Wi-Fi, the three demo scenarios still display the right evidence.

Live Bright Data only fires when the judge types free-form input. If that fails, the agent still works — evidence array is just empty, and the empathic response from Guardian still gets generated.

---

## 12. Test plan

1. **Hello-world test:** call `searchScamReports('+1 415 555 0142')` from a Node script. Expect: array with at least one `RawFinding` containing scraped text.

2. **Timeout test:** point at an unreachable URL. Expect: returns `null` within 5 seconds, no exception thrown.

3. **Unknown org test:** call `fetchOfficialPolicy('nonexistent bank')`. Expect: returns `[]`.

4. **Real demo test:** type into Home free input box: "Hi this is Daniel from Bank of America fraud department, give me your card number." Hit submit. After ~5-10 seconds, see analysis page with evidence card mentioning Bank of America's policy.

If all 4 pass, Bright Data is wired in and demo-ready.

---

## 13. What this does NOT do

- Scraping with login (no authenticated sites).
- Parsing complex SPAs (we use `format: raw` and strip HTML).
- Caching (every call is fresh — 5-hour build, not worth optimizing).
- Storing findings (Butterbase handles that, see spec 07).

---

## 14. Fallback strategy summary

| Failure | Behavior |
|---|---|
| Bright Data API down | Functions return `[]`. Pipeline continues. Evidence array is empty. |
| Single URL times out | That source is skipped. Other sources still tried. |
| Invalid API key | Functions log error, return `[]`. App keeps working. |
| Rate limited | Functions return `[]`. Pipeline continues. |

**Rule:** Bright Data failure must NEVER break the demo. Worst case: empty evidence array, Guardian still produces a response.
