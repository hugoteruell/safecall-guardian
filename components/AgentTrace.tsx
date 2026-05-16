import { Cpu } from 'lucide-react';
import AgentStep, { AgentStatus } from './AgentStep';
import { AgentTrace as AgentTraceData } from '@/lib/types';

export type Phase = 'idle' | 'analyzing' | 'investigating' | 'guarding' | 'complete';

function getStatus(agent: 'analyzer' | 'investigator' | 'guardian', phase: Phase): AgentStatus {
  if (phase === 'idle') return 'pending';
  const order: Phase[] = ['analyzing', 'investigating', 'guarding', 'complete'];
  const agentIndex = { analyzer: 0, investigator: 1, guardian: 2 }[agent];
  const phaseIndex = order.indexOf(phase);
  if (phaseIndex > agentIndex) return 'done';
  if (phaseIndex === agentIndex) return 'running';
  return 'pending';
}

export default function AgentTrace({ trace, phase }: { trace: AgentTraceData; phase: Phase }) {
  return (
    <aside className="bg-ink text-cream/95 rounded-3xl p-6 font-mono text-sm lg:sticky lg:top-10 lg:self-start shadow-xl">
      <div className="flex items-center gap-2 text-cream/60 text-[10px] uppercase tracking-[0.2em] mb-6 font-sans font-semibold">
        <Cpu className="w-3.5 h-3.5" strokeWidth={1.8} />
        Agent execution
      </div>
      <AgentStep name="Analyzer" status={getStatus('analyzer', phase)} log={trace.analyzer} />
      <AgentStep
        name="Investigator"
        status={getStatus('investigator', phase)}
        log={trace.investigator}
      />
      <AgentStep name="Guardian" status={getStatus('guardian', phase)} log={trace.guardian} />
    </aside>
  );
}
