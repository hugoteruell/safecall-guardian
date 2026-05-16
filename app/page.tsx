import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import PhoneDemo from '@/components/PhoneDemo';
import ScamIntelSection from '@/components/ScamIntelSection';
import Reveal from '@/components/Reveal';

export default function Home() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span
            className="font-display text-2xl leading-none bg-gradient-to-r from-[#5de0e6] to-[#004aad] bg-clip-text text-transparent"
          >
            SafeCall
          </span>
          <span className="text-[10px] text-ink-muted uppercase tracking-[0.18em] font-semibold">
            Guardian
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-soft border border-cream-deep text-ink-soft text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
            Agentic protection
          </div>
          <Link
            href="/app"
            className="px-4 py-2 rounded-lg bg-ink hover:bg-ink-soft text-cream text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            Open dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Problem first — live (cached) scam map */}
      <ScamIntelSection />

      {/* Bridge into the solution */}
      <Reveal>
        <div className="border-t border-cream-deep bg-cream">
          <div className="max-w-7xl mx-auto px-6 pt-20 pb-6 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-ink-muted">
              So we built something
            </div>
            <div className="mx-auto mt-4 w-12 h-0.5 bg-ink-muted/40 rounded-full" />
          </div>
        </div>
      </Reveal>

      {/* Solution — phone theater */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 pt-8 pb-16">
          <PhoneDemo />
        </section>
      </Reveal>

      {/* CTA to product */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="relative bg-ink text-cream rounded-3xl px-8 py-10 lg:px-14 lg:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 overflow-hidden shadow-xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-coral/20 blur-3xl" />
            <div className="absolute -left-16 bottom-0 w-56 h-56 rounded-full bg-sage/15 blur-3xl" />
            <div className="relative max-w-xl">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream/70 mb-3">
                For families
              </div>
              <h2 className="font-display text-4xl lg:text-5xl leading-tight mb-4">
                See the dashboard your family uses to keep Mom safe.
              </h2>
              <p className="text-cream/80 leading-relaxed text-base lg:text-lg">
                Track every block, manage trusted contacts, and tune the protection
                to your peace of mind.
              </p>
            </div>
            <Link
              href="/app"
              className="relative bg-cream hover:bg-paper text-ink text-base font-semibold px-6 py-4 rounded-xl flex items-center gap-2 shrink-0 transition-colors shadow-lg"
            >
              Open Ana&apos;s dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </Reveal>

      {/* Sponsor mini strip */}
      <section className="border-t border-cream-deep bg-cream-soft">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-ink-muted">
          <span>
            Threat intel by <span className="font-semibold text-ink">Bright Data</span>
          </span>
          <span className="text-ink-muted/40">·</span>
          <span>
            Family memory by <span className="font-semibold text-ink">Butterbase</span>
          </span>
          <span className="text-ink-muted/40">·</span>
          <span>
            Voice by <span className="font-semibold text-ink">ElevenLabs</span>
          </span>
          <span className="text-ink-muted/40">·</span>
          <span>
            Deployed on <span className="font-semibold text-ink">Zeabur</span>
          </span>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-10 text-center text-xs text-ink-muted">
        Built for the May 2026 hackathon · designed with elderly users in mind.
      </footer>
    </main>
  );
}
