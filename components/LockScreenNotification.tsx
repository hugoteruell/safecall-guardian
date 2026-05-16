import { ShieldCheck } from 'lucide-react';

type Props = {
  title: string;
  body: string;
  appName?: string;
  time?: string;
  visible: boolean;
};

export default function LockScreenNotification({
  title,
  body,
  appName = 'SafeCall',
  time = 'now',
  visible,
}: Props) {
  return (
    <div
      className={`mx-3 transition-all duration-500 ${
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl px-3 py-2.5 shadow-2xl text-white">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
            {appName}
          </span>
          <span className="ml-auto text-[11px] text-white/60">{time}</span>
        </div>
        <div className="text-[13px] font-bold leading-tight mb-0.5">{title}</div>
        <div className="text-[12px] leading-snug text-white/85">{body}</div>
      </div>
    </div>
  );
}
