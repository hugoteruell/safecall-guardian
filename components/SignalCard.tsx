import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Signal } from '@/lib/types';

const styles = {
  critical: { border: 'border-red-200', icon: 'text-red-600', Icon: AlertTriangle },
  medium: { border: 'border-amber-200', icon: 'text-amber-600', Icon: AlertCircle },
  low: { border: 'border-emerald-200', icon: 'text-emerald-600', Icon: CheckCircle2 },
};

export default function SignalCard({ signal }: { signal: Signal }) {
  const s = styles[signal.severity];
  const Icon = s.Icon;
  return (
    <div className={`bg-white border-2 rounded-xl p-5 ${s.border}`}>
      <Icon className={`w-6 h-6 mb-3 ${s.icon}`} />
      <div className="text-lg font-bold text-slate-900 mb-1">{signal.label}</div>
      <div className="text-base text-slate-700 leading-relaxed">{signal.description}</div>
    </div>
  );
}
