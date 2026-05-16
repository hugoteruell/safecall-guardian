import { Scenario } from '@/lib/types';

export default function OriginalMessage({ message }: { message: Scenario['message'] }) {
  return (
    <div className="bg-paper border border-cream-deep rounded-2xl p-6 mb-10">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted mb-3">
        Message received
      </div>
      <div className="text-base text-ink-soft mb-3 numerals">From {message.from}</div>
      <div className="text-xl text-ink leading-relaxed">{message.text}</div>
    </div>
  );
}
