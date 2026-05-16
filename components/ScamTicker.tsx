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
    <div className="bg-paper border border-cream-deep rounded-3xl divide-y divide-cream-deep overflow-hidden card-lift">
      <div className="px-4 py-3 flex items-center gap-2 bg-cream-soft">
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-sage animate-ping opacity-75" />
          <span className="relative rounded-full bg-sage-deep w-2 h-2" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
          Live feed
        </span>
      </div>
      <ul className="max-h-[420px] overflow-y-auto">
        {events.map((e) => (
          <li key={e.id} className="px-4 py-3 flex items-center gap-3 hover:bg-cream-soft transition-colors">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: CATEGORY_COLOR[e.category] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink truncate">
                {CATEGORY_LABEL[e.category]}
              </div>
              <div className="text-xs text-ink-muted numerals">
                {e.city}, {e.state} · {e.count} reports
              </div>
            </div>
            <div className="text-xs text-ink-muted whitespace-nowrap">
              {timeAgo(e.minutesAgo)}
            </div>
          </li>
        ))}
        {events.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-ink-muted">
            All quiet in this category.
          </li>
        )}
      </ul>
    </div>
  );
}
