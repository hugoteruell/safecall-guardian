import { CATEGORY_COLOR, CATEGORY_LABEL, FeedEvent } from '@/lib/scamFeed';

function timeAgo(min: number) {
  if (min === 0) return 'just now';
  if (min === 1) return '1 min ago';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h}h ago`;
}

export default function ScamTicker({ events }: { events: FeedEvent[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 bg-slate-50">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
          Live feed
        </span>
      </div>
      <ul className="max-h-[420px] overflow-y-auto">
        {events.map((e) => (
          <li key={e.id} className="px-4 py-3 flex items-center gap-3">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: CATEGORY_COLOR[e.category] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {CATEGORY_LABEL[e.category]}
              </div>
              <div className="text-xs text-slate-500">
                {e.city}, {e.state} · {e.count} reports
              </div>
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap">
              {timeAgo(e.minutesAgo)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
