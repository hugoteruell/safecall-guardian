'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Phone, ChevronRight } from 'lucide-react';
import { ProtectionEvent } from '@/lib/userData';
import { formatRelativeTime, formatMoney } from '@/lib/format';
import EventStatusBadge from './EventStatusBadge';

const channelIcon = {
  sms: MessageSquare,
  whatsapp: MessageSquare,
  call: Phone,
};

export default function ActivityTimeline({
  events,
  limit,
}: {
  events: ProtectionEvent[];
  limit?: number;
}) {
  // Compute relative times on the client to avoid SSR hydration drift.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(i);
  }, []);

  const list = limit ? events.slice(0, limit) : events;

  return (
    <ul className="divide-y divide-slate-100">
      {list.map((e) => {
        const Icon = channelIcon[e.channel];
        const detailHref = e.scenarioId
          ? `/analysis?scenario=${e.scenarioId}&skip=1`
          : null;

        const row = (
          <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                e.status === 'safe'
                  ? 'bg-emerald-50 text-emerald-700'
                  : e.status === 'warned'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <EventStatusBadge status={e.status} />
                <span className="text-xs text-slate-500">
                  {now ? formatRelativeTime(e.timestampIso, now) : '—'}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900 truncate">
                {e.summary}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">From {e.from}</div>
            </div>

            {e.moneyAtRiskUsd ? (
              <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                  Saved
                </div>
                <div className="text-sm font-bold text-emerald-700 tabular-nums">
                  {formatMoney(e.moneyAtRiskUsd)}
                </div>
              </div>
            ) : null}

            {detailHref && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
          </div>
        );

        return (
          <li key={e.id}>
            {detailHref ? (
              <Link href={detailHref} className="block">
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}
