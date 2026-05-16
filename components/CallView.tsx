'use client';
import { useEffect, useState } from 'react';
import StatusBar from './StatusBar';
import { Phone, PhoneOff, Mic, Volume2, Plus, Grid3x3, Captions } from 'lucide-react';
import { Scenario } from '@/lib/types';

type Props = {
  scenario: Scenario;
  ringing: boolean;
  answered: boolean;
  onAnswer: () => void;
  /** ms elapsed since the call was answered — drives captions + timer */
  callElapsedMs: number;
};

function formatTimer(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

export default function CallView({ scenario, ringing, answered, onAnswer, callElapsedMs }: Props) {
  const script = scenario.callScript ?? [];
  const currentCaption =
    [...script].reverse().find((c) => callElapsedMs >= c.atMs)?.text ?? null;

  // Tiny "tick" to re-render the timer every 500ms while in call.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!answered) return;
    const i = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(i);
  }, [answered]);

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-black text-white">
      <StatusBar dark />

      {/* Caller info */}
      <div className="flex-1 flex flex-col items-center justify-start pt-10 px-6">
        <div
          className={`w-28 h-28 rounded-full bg-slate-600 flex items-center justify-center text-4xl font-light text-white/80 mb-5 ${
            ringing ? 'animate-pulse' : ''
          }`}
        >
          ?
        </div>
        <div className="text-2xl font-light mb-1">Unknown</div>
        <div className="text-base text-slate-300 mb-1">{scenario.message.from}</div>
        <div className="text-sm text-slate-400 italic mb-3">maybe: Bank of America</div>
        {ringing && <div className="text-sm text-slate-400 mt-2">incoming call…</div>}
        {answered && (
          <div className="text-sm text-emerald-300 mt-1 font-mono">
            {formatTimer(callElapsedMs)}
          </div>
        )}
      </div>

      {/* Live captions */}
      {answered && (
        <div className="px-5 pb-3">
          <div className="bg-black/60 backdrop-blur border border-white/10 rounded-xl px-4 py-3 min-h-[78px] flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Captions className="w-3 h-3" />
              live captions
            </div>
            {currentCaption ? (
              <p
                key={currentCaption}
                className="text-[15px] leading-snug text-white animate-[slideIn_0.4s_ease-out]"
              >
                “{currentCaption}”
              </p>
            ) : (
              <p className="text-sm italic text-slate-500">…connecting</p>
            )}
          </div>
        </div>
      )}

      {/* In-call control grid OR action grid */}
      {answered ? (
        <div className="px-8 pb-4 grid grid-cols-3 gap-4 text-center text-[11px] text-slate-300">
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            mute
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Grid3x3 className="w-5 h-5" />
            </div>
            keypad
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            speaker
          </div>
        </div>
      ) : (
        <div className="px-8 pb-4 grid grid-cols-3 gap-4 text-center text-[11px] text-slate-300">
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            speaker
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            mute
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            add
          </div>
        </div>
      )}

      {/* Bottom action: decline / answer (ringing) or single end-call (in-call) */}
      {answered ? (
        <div className="px-8 pb-8 flex justify-center">
          <button className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
        </div>
      ) : (
        <div className="px-8 pb-8 flex justify-between items-center">
          <button className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={onAnswer}
            className={`w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              ringing ? 'animate-pulse ring-4 ring-emerald-400/40' : ''
            }`}
            aria-label="Answer call"
          >
            <Phone className="w-7 h-7 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
