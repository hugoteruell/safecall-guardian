'use client';
import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { Scenario } from '@/lib/types';
import { playWhoosh } from '@/lib/sounds';

type IconMap = Record<string, React.ComponentType<{ className?: string }>>;

const SCENARIOS_WITH_AUDIO = new Set(['fake_son', 'fake_bank']);

const tone = {
  critical: {
    bar: 'bg-bordeaux',
    score: 'text-bordeaux',
    chip: 'bg-bordeaux-soft text-bordeaux border-bordeaux/20',
    pillBg: 'bg-bordeaux-soft border-bordeaux/15 text-bordeaux',
    label: 'High concern',
    Icon: ShieldAlert,
  },
  medium: {
    bar: 'bg-coral',
    score: 'text-coral-deep',
    chip: 'bg-coral-soft text-coral-deep border-coral/30',
    pillBg: 'bg-coral-soft border-coral/20 text-coral-deep',
    label: 'Some concern',
    Icon: ShieldAlert,
  },
  low: {
    bar: 'bg-sage',
    score: 'text-sage-deep',
    chip: 'bg-sage-soft text-sage-deep border-sage/30',
    pillBg: 'bg-sage-soft border-sage/30 text-sage-deep',
    label: 'Looks safe',
    Icon: ShieldCheck,
  },
};

export default function SafeCallOverlay({
  scenario,
  visible,
  muted = false,
}: {
  scenario: Scenario;
  visible: boolean;
  muted?: boolean;
}) {
  const t = tone[scenario.riskLevel];
  const Icon = t.Icon;
  const isLow = scenario.riskLevel === 'low';
  const primary = scenario.actions.find((a) => a.primary);
  const secondary = scenario.actions.filter((a) => !a.primary).slice(0, 1);

  const hasAudio = SCENARIOS_WITH_AUDIO.has(scenario.id);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasVisible = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!hasAudio) return;
    const el = audioRef.current;
    if (!el) return;

    if (visible && !wasVisible.current) {
      if (!muted) {
        playWhoosh();
        el.currentTime = 0;
        el.play().catch(() => {});
      }
    }
    if (!visible && wasVisible.current) {
      el.pause();
      el.currentTime = 0;
      setIsSpeaking(false);
    }
    wasVisible.current = visible;
  }, [visible, muted, hasAudio]);

  useEffect(() => {
    if (muted && audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  }, [muted]);

  if (isLow) {
    return (
      <div
        className={`absolute left-3 right-3 bottom-16 z-30 transition-all duration-500 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-paper/95 backdrop-blur border border-sage/30 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sage-soft flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-sage-deep" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sage-deep">
              SafeCall · looks safe
            </div>
            <div className="text-sm text-ink-soft leading-snug truncate">
              {scenario.empathicResponse}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ height: '78%' }}
    >
      <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-b from-transparent to-black/20" />

      <div className="relative h-full bg-cream rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-cream-deep rounded-full" />
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full ${t.bar} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-cream" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold text-ink">SafeCall Guardian</span>
            {isSpeaking && (
              <div className="flex items-end gap-0.5 h-4 ml-1" aria-hidden>
                <span
                  className="w-0.5 bg-ink rounded-full animate-[wave_0.9s_ease-in-out_infinite]"
                  style={{ animationDelay: '0ms', height: '60%' }}
                />
                <span
                  className="w-0.5 bg-ink rounded-full animate-[wave_0.9s_ease-in-out_infinite]"
                  style={{ animationDelay: '150ms', height: '90%' }}
                />
                <span
                  className="w-0.5 bg-ink rounded-full animate-[wave_0.9s_ease-in-out_infinite]"
                  style={{ animationDelay: '300ms', height: '70%' }}
                />
              </div>
            )}
          </div>
          <X className="w-5 h-5 text-ink-muted" strokeWidth={1.8} />
        </div>

        {hasAudio && (
          <audio
            ref={audioRef}
            src={`/voice/${scenario.id}.mp3`}
            preload="auto"
            onPlay={() => setIsSpeaking(true)}
            onPause={() => setIsSpeaking(false)}
            onEnded={() => setIsSpeaking(false)}
          />
        )}

        <div className="px-6 pt-2 pb-3 flex flex-col items-center">
          <div className={`font-display text-[72px] leading-none numerals ${t.score}`}>
            {scenario.score}
          </div>
          <div
            className={`mt-1 text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full border ${t.chip}`}
          >
            {t.label}
          </div>
        </div>

        <div className="px-6 pb-4">
          <p className="text-[15px] leading-snug text-ink-soft text-center font-display">
            {scenario.empathicResponse}
          </p>
        </div>

        <div className="px-5 pb-3 grid grid-cols-2 gap-2">
          {scenario.signals.slice(0, 4).map((s) => (
            <div
              key={s.id}
              className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold leading-tight border ${t.pillBg}`}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div className="mt-auto px-5 pt-3 pb-6 space-y-2 border-t border-cream-deep">
          {primary && (
            <button className="w-full min-h-[48px] bg-ink hover:bg-ink-soft text-cream text-sm font-bold rounded-xl flex items-center justify-center gap-2 px-4 transition-colors">
              {(() => {
                const I = (Icons as unknown as IconMap)[primary.icon] ?? Icons.Circle;
                return <I className="w-4 h-4" />;
              })()}
              {primary.label}
            </button>
          )}
          {secondary.map((a) => (
            <button
              key={a.id}
              className="w-full min-h-[42px] bg-paper border-2 border-cream-deep hover:border-ink-muted text-ink-soft text-xs font-semibold rounded-xl flex items-center justify-center gap-2 px-4 transition-colors"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
