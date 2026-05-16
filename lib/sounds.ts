// Web Audio API tone helpers. Lazy-init the audio context on first use
// to comply with browser autoplay policies.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

function envelope(
  gain: GainNode,
  start: number,
  attack: number,
  release: number,
  peak = 0.18
) {
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
}

/**
 * iMessage-style two-note arrival ping. Bright, short, friendly.
 */
export function playMessageTone() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  const make = (freq: number, startOffset: number, dur: number) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(c.destination);
    envelope(gain, now + startOffset, 0.005, dur, 0.16);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + dur + 0.05);
  };

  // Two-note: E6 → A6 (bright, neutral, iMessage-ish without being identical)
  make(1318.51, 0, 0.18);
  make(1760.0, 0.08, 0.22);
}

/**
 * Soft swoosh — used when the SafeCall overlay slides up.
 */
export function playWhoosh() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  // Filtered noise burst, swept downward.
  const bufferSize = c.sampleRate * 0.4;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const noise = c.createBufferSource();
  noise.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.frequency.exponentialRampToValueAtTime(400, now + 0.35);
  filter.Q.value = 1.5;

  const gain = c.createGain();
  envelope(gain, now, 0.02, 0.35, 0.12);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  noise.start(now);
  noise.stop(now + 0.45);
}

/**
 * Classic phone ring — two overlapping tones, double burst.
 * Pass `times` for how many bursts (default 1).
 */
export function playRing(times = 1) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const burstDur = 0.32;
  const burstGap = 0.18;
  const cycleDur = burstDur * 2 + burstGap + 0.6;

  for (let i = 0; i < times; i++) {
    const tBase = now + i * cycleDur;
    for (let j = 0; j < 2; j++) {
      const tStart = tBase + j * (burstDur + burstGap);
      // Two-tone ring: 440Hz + 480Hz (US standard-ish, simplified)
      [440, 480].forEach((freq) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(c.destination);
        envelope(gain, tStart, 0.02, burstDur, 0.08);
        osc.start(tStart);
        osc.stop(tStart + burstDur + 0.05);
      });
    }
  }
}
