import Link from 'next/link';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
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
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Agentic protection
          </div>
          <Link
            href="/app"
            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold flex items-center gap-1.5 transition-colors"
          >
            Open dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
      <section className="max-w-7xl mx-auto px-6 pt-6 pb-12">
        <PhoneDemo />
      </section>

      {/* CTA to product */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-3xl px-8 py-10 lg:px-12 lg:py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">
              For families
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-3">
              See the dashboard your family uses to keep Mom safe.
            </h2>
            <p className="text-blue-100 leading-relaxed">
              Track every block, manage trusted contacts, and tune the
              protection to your peace of mind.
            </p>
          </div>
          <Link
            href="/app"
            className="bg-white hover:bg-blue-50 text-blue-900 text-base font-bold px-6 py-4 rounded-xl flex items-center gap-2 shrink-0 transition-colors"
          >
            Open Ana&apos;s dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
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
