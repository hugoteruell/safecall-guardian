#!/usr/bin/env node
// Pre-generate SafeCall voice lines via ElevenLabs and save to public/voice/.
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
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY in .env.local');
  process.exit(1);
}

// Short, urgent-but-calm. These are what SafeCall actually says out loud.
const LINES = {
  fake_son:
    'Wait. This may not be Peter. Please call his real number before sending anything.',
  fake_bank:
    'Please hang up. Real banks never ask for this over the phone.',
};

const OUT_DIR = resolve(__dirname, '..', 'public', 'voice');
mkdirSync(OUT_DIR, { recursive: true });

const force = process.argv.includes('--force');

for (const [id, text] of Object.entries(LINES)) {
  const out = resolve(OUT_DIR, `${id}.mp3`);
  if (existsSync(out) && !force) {
    console.log(`✔ ${id}.mp3 already exists (--force to regenerate)`);
    continue;
  }
  console.log(`→ Generating ${id}.mp3 …`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'content-type': 'application/json',
        accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    console.error(`✗ ${id} failed: ${res.status} ${body}`);
    process.exit(2);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`✔ Saved ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
}

console.log('\nDone. Voice files in public/voice/');
