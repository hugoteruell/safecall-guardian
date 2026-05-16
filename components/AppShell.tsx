'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bell,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  HelpCircle,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { CARETAKER, SENIOR } from '@/lib/userData';

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200 flex-col">
        {/* Brand */}
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">
              SafeCall
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Guardian
            </div>
          </div>
        </div>

        {/* Protected user */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Protecting
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 text-white font-semibold flex items-center justify-center text-sm">
              {SENIOR.initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {SENIOR.name}
              </div>
              <div className="text-xs text-slate-500 truncate">
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
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-100 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <HelpCircle className="w-4 h-4" />
            Back to landing
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-5 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-900 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">SafeCall</span>
          </div>

          {/* Status pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative rounded-full bg-emerald-500 w-2 h-2" />
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Protection active
            </span>
          </div>

          {/* User chip */}
          <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold flex items-center justify-center text-xs">
              {CARETAKER.initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {CARETAKER.name}
              </div>
              <div className="text-[10px] text-slate-500">{CARETAKER.email}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>
        </header>

        <main className="flex-1 px-5 lg:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
