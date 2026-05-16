import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Signal } from '@/lib/types';

const styles = {
  critical: { border: 'border-bordeaux/20', icon: 'text-bordeaux', Icon: AlertTriangle },
  medium: { border: 'border-coral/30', icon: 'text-coral-deep', Icon: AlertCircle },
  low: { border: 'border-sage/30', icon: 'text-sage-deep', Icon: CheckCircle2 },
};

export default function SignalCard({ signal }: { signal: Signal }) {
  const s = styles[signal.severity];
  const Icon = s.Icon;
  return (
    <div className={`bg-paper border-2 rounded-2xl p-5 ${s.border}`}>
      <Icon className={`w-6 h-6 mb-3 ${s.icon}`} strokeWidth={1.8} />
      <div className="text-lg font-bold text-ink mb-1">{signal.label}</div>
      <div className="text-base text-ink-soft leading-relaxed">{signal.description}</div>
    </div>
  );
}
