import { Globe, Users, ShieldCheck } from 'lucide-react';
import { Evidence } from '@/lib/types';

const map = {
  web_scrape: { Icon: Globe, color: 'text-blue-700' },
  family_memory: { Icon: Users, color: 'text-emerald-700' },
  official_policy: { Icon: ShieldCheck, color: 'text-blue-700' },
};

export default function EvidenceCard({ evidence }: { evidence: Evidence }) {
  const { Icon, color } = map[evidence.type];
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-4">
      <Icon className={`w-8 h-8 shrink-0 ${color}`} />
      <div>
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
          {evidence.source}
        </div>
        <div className="text-lg text-slate-900 leading-relaxed">{evidence.finding}</div>
      </div>
    </div>
  );
}
