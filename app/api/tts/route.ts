import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response('TTS not configured', { status: 503 });
  }

  let body: { text?: unknown; voiceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 500) {
    return new Response('text must be 1..500 chars', { status: 400 });
  }

  const voiceId =
    (typeof body.voiceId === 'string' && body.voiceId) ||
    process.env.ELEVENLABS_VOICE_ID ||
    'EXAVITQu4vr4xnSDxMaL';

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
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
  });

  if (!r.ok) {
    return new Response(`ElevenLabs error: ${r.status}`, { status: 502 });
  }

  return new Response(r.body, {
    headers: {
      'content-type': 'audio/mpeg',
      'cache-control': 'public, max-age=3600',
    },
  });
}
