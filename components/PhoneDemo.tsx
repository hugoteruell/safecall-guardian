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
  | 'alerted'; // caretaker has been notified

const SCENARIO_ORDER = ['fake_son', 'fake_bank', 'legitimate'] as const;

const scenarioMeta: Record<string, { label: string; sub: string; tone: string }> = {
  fake_son: { label: 'Fake son', sub: 'SMS · "send $4,800"', tone: 'bg-red-50 text-red-700 border-red-200' },
  fake_bank: { label: 'Fake bank call', sub: 'Voice · tap answer to play', tone: 'bg-red-50 text-red-700 border-red-200' },
  legitimate: { label: 'Real son', sub: 'SMS · dinner plans', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
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

  useEffect(() => {
    const t = setTimeout(play, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wider mb-5">
            {scenario.riskLevel === 'low' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            Our answer · live simulation
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-5">
            Scams blocked
            <br />
            before they{' '}
            <span className="bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              land.
            </span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
            SafeCall Guardian watches every call and message coming to your parents.
            Three AI agents investigate in real time — they intervene with calm,
            plain language and ping the family so no one is left out of the loop.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
            Try a scenario
          </div>
          {SCENARIO_ORDER.map((id) => {
            const m = scenarioMeta[id];
            const active = id === scenarioId;
            return (
              <button
                key={id}
                onClick={() => switchScenario(id)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  active
                    ? 'border-blue-900 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-400 bg-white'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${m.tone}`}
                >
                  {id === 'legitimate' ? 'safe' : 'scam'}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{m.label}</div>
                  <div className="text-xs text-slate-500">{m.sub}</div>
                </div>
                {active && <div className="w-2 h-2 rounded-full bg-blue-900 animate-pulse" />}
              </button>
            );
          })}

          <div className="flex gap-2 pt-3">
            <button
              onClick={play}
              className="flex-1 min-h-[48px] bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
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
              className="min-h-[48px] w-12 bg-white border-2 border-slate-300 hover:border-slate-500 text-slate-700 rounded-xl flex items-center justify-center transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <a
              href={`/analysis?scenario=${scenarioId}&skip=1`}
              className="min-h-[48px] px-4 bg-white border-2 border-slate-300 hover:border-slate-500 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center transition-colors"
            >
              Full report →
            </a>
          </div>

          {isCall && stage === 'received' && (
            <p className="text-xs text-slate-500 italic pt-2">
              ☎ Tap the green button on Mom&apos;s phone to answer.
            </p>
          )}
        </div>
      </div>

      {/* Theater row: phones + trace */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_360px] gap-8 items-start">
        {/* Elderly phone */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
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

        {/* Caretaker phone */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Ana&apos;s phone <span className="text-slate-400">(her daughter)</span>
          </div>
          <PhoneFrame width={300} height={620} glow="cool">
            <CaretakerPhone scenario={scenario} alertVisible={caretakerAlertVisible} />
          </PhoneFrame>
        </div>

        {/* Agent trace */}
        <div>
          <AgentTrace trace={scenario.agentTrace} phase={phase} />
        </div>
      </div>
    </div>
  );
}
