'use client';
import { usePathname } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { ToastProvider } from '@/components/Toast';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ToastProvider>
      <AppShell>
        {/* Re-mount on pathname change so the fade-up animation fires per route. */}
        <div key={pathname} className="animate-fade-up">
          {children}
        </div>
      </AppShell>
    </ToastProvider>
  );
}
