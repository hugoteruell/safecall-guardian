export type AgentStatus = 'pending' | 'running' | 'done';

const dot: Record<AgentStatus, string> = {
  pending: 'w-2.5 h-2.5 rounded-full bg-cream/20',
  running: 'w-2.5 h-2.5 rounded-full bg-gold animate-pulse',
  done: 'w-2.5 h-2.5 rounded-full bg-sage',
};

const label: Record<AgentStatus, string> = {
  pending: 'pending',
  running: 'running…',
  done: 'done',
};

export default function AgentStep({
  name,
  status,
  log,
}: {
  name: string;
  status: AgentStatus;
  log: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className={dot[status]} />
        <span className="text-cream font-semibold font-sans">{name}</span>
        <span className="ml-auto text-[10px] text-cream/50 font-sans uppercase tracking-wider">
          {label[status]}
        </span>
      </div>
      {status === 'running' && <div className="text-cream/60 pl-[22px]">Working…</div>}
      {status === 'done' && (
        <div className="text-cream/80 pl-[22px] leading-relaxed">{log}</div>
      )}
    </div>
  );
}
