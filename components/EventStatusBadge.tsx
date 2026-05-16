import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { EventStatus } from '@/lib/userData';

const config = {
  blocked: {
    label: 'Blocked',
    Icon: ShieldAlert,
    pill: 'bg-red-50 text-red-700 border-red-200',
  },
  warned: {
    label: 'Warned',
    Icon: AlertTriangle,
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  safe: {
    label: 'Safe',
    Icon: ShieldCheck,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export default function EventStatusBadge({ status }: { status: EventStatus }) {
  const c = config[status];
  const Icon = c.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${c.pill}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}
