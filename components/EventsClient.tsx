'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { type ProtectionEvent, type EventStatus } from '@/lib/userData';
import ActivityTimeline from './ActivityTimeline';

const FILTERS: { id: 'all' | EventStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'warned', label: 'Warned' },
  { id: 'safe', label: 'Safe' },
];

export default function EventsClient({ events }: { events: ProtectionEvent[] }) {
  const [filter, setFilter] = useState<'all' | EventStatus>('all');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    let out = events;
    if (filter !== 'all') out = out.filter((e) => e.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (e) =>
          e.summary.toLowerCase().includes(q) ||
          e.from.toLowerCase().includes(q) ||
          e.category.includes(q)
      );
    }
    return out;
  }, [events, filter, query]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl text-ink leading-none">Events</h1>
        <p className="text-sm text-ink-muted mt-2">
          Everything SafeCall has filtered for Mom. Click an event for the full analysis.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                filter === f.id
                  ? 'bg-ink border-ink text-cream'
                  : 'bg-paper border-cream-deep text-ink-soft hover:border-ink-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by sender, summary, or scam type…"
            className="w-full h-10 pl-9 pr-3 bg-paper border border-cream-deep rounded-lg text-sm placeholder:text-ink-muted focus:outline-none focus:border-ink"
          />
        </div>
      </div>

      <div className="bg-paper border border-cream-deep rounded-3xl overflow-hidden">
        <ActivityTimeline events={list} />
      </div>
    </div>
  );
}
