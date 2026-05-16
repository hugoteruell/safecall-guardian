export type AgentStatus = 'pending' | 'running' | 'done';

const dot: Record<AgentStatus, string> = {
  pending: 'w-3 h-3 rounded-full bg-slate-700',
  running: 'w-3 h-3 rounded-full bg-amber-400 animate-pulse',
  done: 'w-3 h-3 rounded-full bg-emerald-400',
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
        <span className="text-slate-100 font-semibold">{name}</span>
        <span className="ml-auto text-xs text-slate-500">{label[status]}</span>
      </div>
      {status === 'running' && <div className="text-slate-400 pl-6">Working…</div>}
      {status === 'done' && <div className="text-slate-300 pl-6 leading-relaxed">{log}</div>}
    </div>
  );
}
