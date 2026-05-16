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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Events</h1>
        <p className="text-sm text-slate-500 mt-1">
          Everything SafeCall has filtered for Mom. Click an event for the full
          analysis.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                filter === f.id
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by sender, summary, or scam type…"
            className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {list.length > 0 ? (
          <ActivityTimeline events={list} />
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No events match those filters.
          </div>
        )}
      </div>
    </div>
  );
}
