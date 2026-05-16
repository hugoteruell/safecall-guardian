import { ShieldCheck, Sparkles } from 'lucide-react';
import PhoneDemo from '@/components/PhoneDemo';
import ScamIntelSection from '@/components/ScamIntelSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold text-slate-900">SafeCall Guardian</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Agentic protection · live
        </div>
      </nav>

      {/* Problem first — live (cached) scam map */}
      <ScamIntelSection />

      {/* Bridge into the solution */}
      <div className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-4 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
            So we built something
          </div>
          <div className="mx-auto mt-3 w-12 h-0.5 bg-slate-300 rounded-full" />
        </div>
      </div>

      {/* Solution — phone theater */}
      <section className="max-w-7xl mx-auto px-6 pt-6 pb-20">
        <PhoneDemo />
      </section>

      {/* Sponsor mini strip */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-500">
          <span>
            Threat intel by <span className="font-semibold text-slate-700">Bright Data</span>
          </span>
          <span>·</span>
          <span>
            Family memory by{' '}
            <span className="font-semibold text-slate-700">Butterbase</span>
          </span>
          <span>·</span>
          <span>
            Voice by <span className="font-semibold text-slate-700">ElevenLabs</span>
          </span>
          <span>·</span>
          <span>
            Deployed on <span className="font-semibold text-slate-700">Zeabur</span>
          </span>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
        Built for the May 2026 hackathon · designed with elderly users in mind.
      </footer>
    </main>
  );
}
