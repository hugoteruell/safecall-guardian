'use client';
import * as Icons from 'lucide-react';
import { ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { Scenario } from '@/lib/types';

type IconMap = Record<string, React.ComponentType<{ className?: string }>>;

const tone = {
  critical: {
    bar: 'bg-red-600',
    score: 'text-red-600',
    chip: 'bg-red-50 text-red-700 border-red-200',
    label: 'High concern',
    Icon: ShieldAlert,
  },
  medium: {
    bar: 'bg-amber-500',
    score: 'text-amber-600',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Some concern',
    Icon: ShieldAlert,
  },
  low: {
    bar: 'bg-emerald-500',
    score: 'text-emerald-600',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Looks safe',
    Icon: ShieldCheck,
  },
};

export default function SafeCallOverlay({
  scenario,
  visible,
}: {
  scenario: Scenario;
  visible: boolean;
}) {
  const t = tone[scenario.riskLevel];
  const Icon = t.Icon;
  const isLow = scenario.riskLevel === 'low';
  const primary = scenario.actions.find((a) => a.primary);
  const secondary = scenario.actions.filter((a) => !a.primary).slice(0, 1);

  // Low-risk: small discreet pill, not an interruption
  if (isLow) {
    return (
      <div
        className={`absolute left-3 right-3 bottom-16 z-30 transition-all duration-500 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white/90 backdrop-blur border border-emerald-200 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              SafeCall · looks safe
            </div>
            <div className="text-sm text-slate-700 leading-snug truncate">
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
      {/* Backdrop blur over chat */}
      <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-b from-transparent to-black/20" />

      <div className="relative h-full bg-white rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full ${t.bar} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">SafeCall Guardian</span>
          </div>
          <X className="w-5 h-5 text-slate-400" />
        </div>

        {/* Score */}
        <div className="px-6 pt-2 pb-3 flex flex-col items-center">
          <div className={`text-[72px] leading-none font-bold tabular-nums ${t.score}`}>
            {scenario.score}
          </div>
          <div className={`mt-1 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${t.chip}`}>
            {t.label}
          </div>
        </div>

        {/* Empathic message */}
        <div className="px-6 pb-4">
          <p className="text-[15px] leading-snug text-slate-800 text-center">
            {scenario.empathicResponse}
          </p>
        </div>

        {/* Signals preview */}
        <div className="px-5 pb-3 grid grid-cols-2 gap-2">
          {scenario.signals.slice(0, 4).map((s) => (
            <div
              key={s.id}
              className="bg-red-50 border border-red-100 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-red-700 leading-tight"
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-auto px-5 pt-3 pb-6 space-y-2 border-t border-slate-100">
          {primary && (
            <button className="w-full min-h-[48px] bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 px-4">
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
              className="w-full min-h-[42px] bg-white border-2 border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 px-4"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
