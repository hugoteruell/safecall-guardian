'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, ShieldAlert, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import PhoneFrame from './PhoneFrame';
import MessageView from './MessageView';
import CallView from './CallView';
import SafeCallOverlay from './SafeCallOverlay';
import CaretakerPhone from './CaretakerPhone';
import AgentTrace, { Phase } from './AgentTrace';
import { SCENARIOS } from '@/lib/mockScenarios';

type Stage =
  | 'idle'
  | 'incoming'
  | 'received'
  | 'in_call'
  | 'analyzing'
  | 'investigating'
  | 'guarding'
  | 'intercepted'
  | 'alerted';

const SCENARIO_ORDER = ['fake_son', 'fake_bank', 'legitimate'] as const;

const scenarioMeta: Record<string, { label: string; sub: string; tone: string }> = {
  fake_son: {
    label: 'Fake son',
    sub: 'SMS · "send $4,800"',
    tone: 'bg-bordeaux-soft text-bordeaux border-bordeaux/20',
  },
  fake_bank: {
    label: 'Fake bank call',
    sub: 'Voice · tap answer to play',
    tone: 'bg-bordeaux-soft text-bordeaux border-bordeaux/20',
  },
  legitimate: {
    label: 'Real son',
    sub: 'SMS · dinner plans',
    tone: 'bg-sage-soft text-sage-deep border-sage/30',
  },
};

function stageToPhase(stage: Stage): Phase {
  if (stage === 'intercepted' || stage === 'alerted') return 'complete';
  if (stage === 'guarding') return 'guarding';
  if (stage === 'investigating') return 'investigating';
  if (stage === 'analyzing') return 'analyzing';
  return 'idle';
}

const ANALYZE_MS = 1500;
const INVESTIGATE_MS = 1800;
const GUARD_MS = 1500;
const CARETAKER_DELAY_MS = 900;

export default function PhoneDemo() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIO_ORDER)[number]>('fake_son');
  const [stage, setStage] = useState<Stage>('idle');
  const [callAnsweredAt, setCallAnsweredAt] = useState<number | null>(null);
  const [callElapsedMs, setCallElapsedMs] = useState(0);
  const [muted, setMuted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scenario = SCENARIOS[scenarioId];
  const isCall = scenario.message.channel === 'call';

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (callAnsweredAt === null) return;
    const i = setInterval(() => {
      setCallElapsedMs(Date.now() - callAnsweredAt);
    }, 120);
    return () => clearInterval(i);
  }, [callAnsweredAt]);

  const startAgentTimeline = () => {
    setStage('analyzing');
    timers.current.push(setTimeout(() => setStage('investigating'), ANALYZE_MS));
    timers.current.push(setTimeout(() => setStage('guarding'), ANALYZE_MS + INVESTIGATE_MS));
    timers.current.push(
      setTimeout(() => setStage('intercepted'), ANALYZE_MS + INVESTIGATE_MS + GUARD_MS)
    );
    timers.current.push(
      setTimeout(
        () => setStage('alerted'),
        ANALYZE_MS + INVESTIGATE_MS + GUARD_MS + CARETAKER_DELAY_MS
      )
    );
  };

  const play = () => {
    clearTimers();
    setCallAnsweredAt(null);
    setCallElapsedMs(0);
    setStage('incoming');

    if (isCall) {
      timers.current.push(setTimeout(() => setStage('received'), 1600));
      return;
    }

    const incomingDuration = 1100;
    const beforeAnalyzing = 600;
    timers.current.push(setTimeout(() => setStage('received'), incomingDuration));
    timers.current.push(
      setTimeout(() => startAgentTimeline(), incomingDuration + beforeAnalyzing)
    );
  };

  const answerCall = () => {
    if (!isCall || stage !== 'received') return;
    setCallAnsweredAt(Date.now());
    setStage('in_call');
    timers.current.push(setTimeout(() => startAgentTimeline(), 1100));
  };

  const switchScenario = (id: (typeof SCENARIO_ORDER)[number]) => {
    clearTimers();
    setScenarioId(id);
    setStage('idle');
    setCallAnsweredAt(null);
    setCallElapsedMs(0);
  };

  useEffect(() => () => clearTimers(), []);

  const showTyping = !isCall && stage === 'incoming';
  const showMessage =
    !isCall &&
    (stage === 'received' ||
      stage === 'analyzing' ||
      stage === 'investigating' ||
      stage === 'guarding' ||
      stage === 'intercepted' ||
      stage === 'alerted');
  const callRinging = isCall && (stage === 'incoming' || stage === 'received');
  const callAnswered =
    isCall &&
    (stage === 'in_call' ||
      stage === 'analyzing' ||
      stage === 'investigating' ||
      stage === 'guarding' ||
      stage === 'intercepted' ||
      stage === 'alerted');
  const overlayVisible =
    stage === 'guarding' || stage === 'intercepted' || stage === 'alerted';
  const safeCallActive = overlayVisible;
  const caretakerAlertVisible = stage === 'alerted';
  const phase: Phase = stageToPhase(stage);

  const playLabel =
    stage === 'idle'
      ? 'Play simulation'
      : stage === 'intercepted' || stage === 'alerted'
      ? 'Replay'
      : 'Restart';

  return (
    <div className="space-y-10">
      {/* Hero row: pitch + scenario picker */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-soft text-ink-soft border border-cream-deep text-[11px] font-semibold uppercase tracking-[0.18em] mb-6">
            {scenario.riskLevel === 'low' ? (
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.8} />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.8} />
            )}
            Our answer · live simulation
          </div>
          <h1 className="font-display text-5xl lg:text-6xl text-ink leading-[1.02] tracking-tight mb-6">
            Scams blocked
            <br />
            before they{' '}
            <span className="text-coral-deep">land.</span>
          </h1>
          <p className="text-lg text-ink-soft leading-relaxed max-w-lg">
            SafeCall Guardian watches every call and message coming to your parents.
            Three AI agents investigate in real time — they intervene with calm,
            plain language and ping the family so no one is left out of the loop.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted mb-3">
            Try a scenario
          </div>
          {SCENARIO_ORDER.map((id) => {
            const m = scenarioMeta[id];
            const active = id === scenarioId;
            return (
              <button
                key={id}
                onClick={() => switchScenario(id)}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  active
                    ? 'border-ink bg-cream-soft shadow-sm'
                    : 'border-cream-deep hover:border-ink-muted bg-paper'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded border ${m.tone}`}
                >
                  {id === 'legitimate' ? 'safe' : 'scam'}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">{m.label}</div>
                  <div className="text-xs text-ink-muted">{m.sub}</div>
                </div>
                {active && <div className="w-2 h-2 rounded-full bg-ink animate-pulse" />}
              </button>
            );
          })}

          <div className="flex gap-2 pt-3">
            <button
              onClick={play}
              className="flex-1 min-h-[48px] bg-ink hover:bg-ink-soft text-cream text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {stage === 'idle' || stage === 'intercepted' || stage === 'alerted' ? (
                <Play className="w-4 h-4" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              {playLabel}
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute voice' : 'Mute voice'}
              title={muted ? 'Voice is muted' : 'SafeCall will speak out loud'}
              className="min-h-[48px] w-12 bg-paper border border-cream-deep hover:border-ink-muted text-ink-soft rounded-xl flex items-center justify-center transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <a
              href={`/analysis?scenario=${scenarioId}&skip=1`}
              className="min-h-[48px] px-4 bg-paper border border-cream-deep hover:border-ink-muted text-ink-soft text-xs font-semibold rounded-xl flex items-center justify-center transition-colors"
            >
              Full report →
            </a>
          </div>

          {isCall && stage === 'received' && (
            <p className="text-xs text-ink-muted italic pt-2">
              ☎ Tap the green button on Mom&apos;s phone to answer.
            </p>
          )}
        </div>
      </div>

      {/* Theater row: phones + trace */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_360px] gap-8 items-start">
        <div className="flex flex-col items-center gap-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            Mom&apos;s phone
          </div>
          <PhoneFrame width={300} height={620} glow="warm">
            {isCall ? (
              <CallView
                scenario={scenario}
                ringing={callRinging}
                answered={callAnswered}
                onAnswer={answerCall}
                callElapsedMs={callElapsedMs}
                muted={muted}
                safeCallActive={safeCallActive}
              />
            ) : (
              <MessageView
                scenario={scenario}
                showMessage={showMessage}
                showTyping={showTyping}
              />
            )}
            <SafeCallOverlay scenario={scenario} visible={overlayVisible} muted={muted} />
          </PhoneFrame>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            Ana&apos;s phone <span className="text-ink-muted/60">(her daughter)</span>
          </div>
          <PhoneFrame width={300} height={620} glow="cool">
            <CaretakerPhone scenario={scenario} alertVisible={caretakerAlertVisible} />
          </PhoneFrame>
        </div>

        <div>
          <AgentTrace trace={scenario.agentTrace} phase={phase} />
        </div>
      </div>
    </div>
  );
}
