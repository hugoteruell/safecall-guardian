import { Globe, Users, ShieldCheck } from 'lucide-react';
import { Evidence } from '@/lib/types';

const map = {
  web_scrape: { Icon: Globe, color: 'text-ink-soft' },
  family_memory: { Icon: Users, color: 'text-sage-deep' },
  official_policy: { Icon: ShieldCheck, color: 'text-ink-soft' },
};

export default function EvidenceCard({ evidence }: { evidence: Evidence }) {
  const { Icon, color } = map[evidence.type];
  return (
    <div className="bg-cream-soft border border-cream-deep rounded-2xl p-5 flex gap-4">
      <Icon className={`w-8 h-8 shrink-0 ${color}`} strokeWidth={1.8} />
      <div>
        <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.18em] mb-1">
          {evidence.source}
        </div>
        <div className="text-lg text-ink leading-relaxed">{evidence.finding}</div>
      </div>
    </div>
  );
}
