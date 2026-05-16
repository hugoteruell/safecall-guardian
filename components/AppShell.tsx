'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bell,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { CARETAKER, SENIOR } from '@/lib/userData';
import Avatar from './Avatar';

const navItems = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/events', label: 'Events', icon: Bell },
  { href: '/app/family', label: 'Family', icon: Users },
  { href: '/app/intel', label: 'Threat intel', icon: Globe },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-cream-soft border-r border-cream-deep flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-cream-deep">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl leading-none bg-gradient-to-r from-[#5de0e6] to-[#004aad] bg-clip-text text-transparent">
              SafeCall
            </span>
            <span className="text-[10px] text-ink-muted uppercase tracking-[0.18em] font-semibold">
              Guardian
            </span>
          </Link>
        </div>

        {/* Protected user */}
        <div className="px-5 py-4 border-b border-cream-deep">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted mb-3">
            Protecting
          </div>
          <div className="flex items-center gap-3">
            <Avatar seed={SENIOR.name} size="md" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink truncate">{SENIOR.name}</div>
              <div className="text-xs text-ink-muted truncate">
                {SENIOR.relationship} · {SENIOR.age}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/app' ? pathname === '/app' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-cream-deep text-ink'
                    : 'text-ink-soft hover:bg-cream-deep/60 hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-cream-deep space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-muted hover:bg-cream-deep/60 hover:text-ink"
          >
            <HelpCircle className="w-4 h-4" strokeWidth={1.8} />
            Back to landing
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-muted hover:bg-cream-deep/60 hover:text-ink">
            <LogOut className="w-4 h-4" strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-cream/85 backdrop-blur border-b border-cream-deep px-5 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-30">
          <Link href="/" className="lg:hidden flex items-baseline gap-1.5">
            <span className="font-display text-xl leading-none bg-gradient-to-r from-[#5de0e6] to-[#004aad] bg-clip-text text-transparent">
              SafeCall
            </span>
            <span className="text-[9px] text-ink-muted uppercase tracking-[0.18em] font-semibold">
              Guardian
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-soft border border-sage/30">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-sage animate-ping opacity-75" />
              <span className="relative rounded-full bg-sage-deep w-2 h-2" />
            </span>
            <span className="text-xs font-semibold text-sage-deep">Protection active</span>
          </div>

          <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-cream-soft transition-colors">
            <Avatar seed={CARETAKER.name} size="sm" />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-ink leading-tight">{CARETAKER.name}</div>
              <div className="text-[10px] text-ink-muted">{CARETAKER.email}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-ink-muted hidden sm:block" />
          </button>
        </header>

        <main className="flex-1 px-5 lg:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
