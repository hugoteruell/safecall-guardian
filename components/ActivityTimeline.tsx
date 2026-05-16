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

const statusBg = {
  blocked: 'bg-bordeaux-soft text-bordeaux',
  warned: 'bg-gold-soft text-coral-deep',
  safe: 'bg-sage-soft text-sage-deep',
};

export default function ActivityTimeline({
  events,
  limit,
}: {
  events: ProtectionEvent[];
  limit?: number;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(i);
  }, []);

  const list = limit ? events.slice(0, limit) : events;

  if (list.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-ink-muted">
        <div className="font-display text-xl text-ink mb-1">All quiet today.</div>
        <div>No interactions in this view.</div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-cream-deep">
      {list.map((e) => {
        const Icon = channelIcon[e.channel];
        const detailHref = e.scenarioId ? `/analysis?scenario=${e.scenarioId}&skip=1` : null;

        const row = (
          <div className="flex items-center gap-4 px-6 py-4 hover:bg-cream-soft transition-colors">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusBg[e.status]}`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.8} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <EventStatusBadge status={e.status} />
                <span className="text-xs text-ink-muted">
                  {now ? formatRelativeTime(e.timestampIso, now) : '—'}
                </span>
              </div>
              <div className="text-sm font-semibold text-ink truncate">{e.summary}</div>
              <div className="text-xs text-ink-muted mt-0.5 numerals">From {e.from}</div>
            </div>

            {e.moneyAtRiskUsd ? (
              <div className="hidden sm:block text-right">
                <div className="text-[10px] text-ink-muted uppercase tracking-[0.15em] font-semibold">
                  Saved
                </div>
                <div className="text-sm font-bold text-sage-deep numerals font-display">
                  {formatMoney(e.moneyAtRiskUsd)}
                </div>
              </div>
            ) : null}

            {detailHref && <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />}
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
