'use client';
import { useEffect, useState } from 'react';
import { Scenario } from '@/lib/types';
import OriginalMessage from './OriginalMessage';
import ScoreDisplay from './ScoreDisplay';
import EmpathicMessage from './EmpathicMessage';
import ActionButton from './ActionButton';
import SignalCard from './SignalCard';
import EvidenceCard from './EvidenceCard';
import AgentTrace, { Phase } from './AgentTrace';

type Props = {
  scenario: Scenario;
  skipAnimation?: boolean;
};

export default function AnalysisScreen({ scenario, skipAnimation = false }: Props) {
  const [phase, setPhase] = useState<Phase>(skipAnimation ? 'complete' : 'analyzing');

  useEffect(() => {
    if (skipAnimation) return;
    const t1 = setTimeout(() => setPhase('investigating'), 1500);
    const t2 = setTimeout(() => setPhase('guarding'), 1500 + 1800);
    const t3 = setTimeout(() => setPhase('complete'), 1500 + 1800 + 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [skipAnimation]);

  const primary = scenario.actions.find((a) => a.primary);
  const secondary = scenario.actions.filter((a) => !a.primary);
  const complete = phase === 'complete';

  return (
    <main className="min-h-screen bg-cream text-ink antialiased">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 max-w-7xl mx-auto px-6 py-10">
        <div>
          <OriginalMessage message={scenario.message} />

          {!complete && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-3 h-3 rounded-full bg-ink animate-pulse" />
              <p className="text-2xl text-ink-muted font-display">Checking this message…</p>
            </div>
          )}

          {complete && (
            <>
              <ScoreDisplay score={scenario.score} riskLevel={scenario.riskLevel} />
              <EmpathicMessage text={scenario.empathicResponse} />

              <div className="mt-8 space-y-4">
                {primary && <ActionButton action={primary} />}
                {secondary.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {secondary.map((a) => (
                      <ActionButton key={a.id} action={a} />
                    ))}
                  </div>
                )}
              </div>

              {scenario.signals.length > 0 && (
                <>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted mt-12 mb-4">
                    Signals detected
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenario.signals.map((s) => (
                      <SignalCard key={s.id} signal={s} />
                    ))}
                  </div>
                </>
              )}

              {scenario.evidence.length > 0 && (
                <>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted mt-12 mb-4">
                    Evidence
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {scenario.evidence.map((e) => (
                      <EvidenceCard key={e.id} evidence={e} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <AgentTrace trace={scenario.agentTrace} phase={phase} />
      </div>
    </main>
  );
}
