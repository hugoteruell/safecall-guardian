#!/usr/bin/env node
// Pre-generate all voice lines via ElevenLabs and save to public/voice/.
// Run: node scripts/generate-voices.mjs  (or with --force to regenerate existing).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Minimal .env.local loader (no dotenv dependency).
const envPath = resolve(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY in .env.local');
  process.exit(1);
}

// Sarah — warm calm US female. Used for the SafeCall warnings.
const SARAH = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
// Brian — neutral US male. Used for the fake-bank scammer in the demo.
const BRIAN = 'nPczCjzI2devNBz1zQrb';

const SAFECALL_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.15,
  use_speaker_boost: true,
};

const SCAMMER_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.85,
  style: 0.35, // a bit more urgency / theatricality
  use_speaker_boost: true,
};

const LINES = [
  // SafeCall warnings (Sarah)
  {
    out: 'fake_son.mp3',
    voice: SARAH,
    settings: SAFECALL_SETTINGS,
    text: 'Wait. This may not be Peter. Please call his real number before sending anything.',
  },
  {
    out: 'fake_bank.mp3',
    voice: SARAH,
    settings: SAFECALL_SETTINGS,
    text: 'Please hang up. Real banks never ask for this over the phone.',
  },
  // Fake-bank scammer lines (Brian) — synced to captions in CallView
  {
    out: 'scammer_fake_bank_1.mp3',
    voice: BRIAN,
    settings: SCAMMER_SETTINGS,
    text: "Hello ma'am, this is Daniel from Bank of America fraud department.",
  },
  {
    out: 'scammer_fake_bank_2.mp3',
    voice: BRIAN,
    settings: SCAMMER_SETTINGS,
    text: 'We detected a $2,300 suspicious charge on your card a moment ago.',
  },
  {
    out: 'scammer_fake_bank_3.mp3',
    voice: BRIAN,
    settings: SCAMMER_SETTINGS,
    text: 'To cancel it, I just need the last four digits of your card. Quickly please.',
  },
];

const OUT_DIR = resolve(__dirname, '..', 'public', 'voice');
mkdirSync(OUT_DIR, { recursive: true });

const force = process.argv.includes('--force');

for (const line of LINES) {
  const out = resolve(OUT_DIR, line.out);
  if (existsSync(out) && !force) {
    console.log(`✔ ${line.out} already exists (--force to regenerate)`);
    continue;
  }
  console.log(`→ Generating ${line.out} …`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${line.voice}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'content-type': 'application/json',
        accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: line.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: line.settings,
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    console.error(`✗ ${line.out} failed: ${res.status} ${body}`);
    process.exit(2);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`✔ Saved ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
}

console.log('\nDone. Voice files in public/voice/');
