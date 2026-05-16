import { ShieldCheck, Sparkles } from 'lucide-react';
import PhoneDemo from '@/components/PhoneDemo';

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

      {/* Hero theater */}
      <section className="max-w-7xl mx-auto px-6 pt-4 pb-20">
        <PhoneDemo />
      </section>

      {/* Sponsor strip */}
      <section className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-2">
              Bright Data
            </div>
            <div className="text-base font-semibold text-slate-900 mb-1">
              Live scam intelligence
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Scrapes scam-report registries and bank security pages the moment a
              message lands.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">
              Butterbase
            </div>
            <div className="text-base font-semibold text-slate-900 mb-1">
              Family memory
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Knows who Peter is, what number he uses, how he writes. Catches
              impersonation no regex can.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-2">
              Zeabur
            </div>
            <div className="text-base font-semibold text-slate-900 mb-1">
              Always-on deploy
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Protection runs in the cloud — no app to install for the parent who
              just wants their phone to work.
            </p>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
        Built for the May 2026 hackathon · designed with elderly users in mind.
      </footer>
    </main>
  );
}
