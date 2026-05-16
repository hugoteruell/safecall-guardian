import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { EventStatus } from '@/lib/userData';

const config = {
  blocked: {
    label: 'Blocked',
    Icon: ShieldAlert,
    pill: 'bg-bordeaux-soft text-bordeaux border-bordeaux/20',
  },
  warned: {
    label: 'Warned',
    Icon: AlertTriangle,
    pill: 'bg-gold-soft text-coral-deep border-gold/30',
  },
  safe: {
    label: 'Safe',
    Icon: ShieldCheck,
    pill: 'bg-sage-soft text-sage-deep border-sage/30',
  },
};

export default function EventStatusBadge({ status }: { status: EventStatus }) {
  const c = config[status];
  const Icon = c.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${c.pill}`}
    >
      <Icon className="w-3 h-3" strokeWidth={2} />
      {c.label}
    </span>
  );
}
