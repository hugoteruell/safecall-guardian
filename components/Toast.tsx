'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type Ctx = {
  toast: (opts: ToastInput) => void;
};

const ToastContext = createContext<Ctx | null>(null);

let nextId = 0;

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op when used outside the provider — prevents demo crashes.
    return { toast: () => {} };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<Ctx['toast']>((opts) => {
    const id = ++nextId;
    setToasts((curr) => [
      ...curr,
      { id, variant: opts.variant ?? 'success', title: opts.title, description: opts.description },
    ]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

const variantStyle: Record<ToastVariant, { border: string; icon: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  success: {
    border: 'border-sage/40',
    icon: 'text-sage-deep',
    Icon: CheckCircle2,
  },
  error: {
    border: 'border-bordeaux/30',
    icon: 'text-bordeaux',
    Icon: AlertTriangle,
  },
  info: {
    border: 'border-cream-deep',
    icon: 'text-ink-soft',
    Icon: CheckCircle2,
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const v = variantStyle[toast.variant];
  const Icon = v.Icon;

  return (
    <div
      className={`pointer-events-auto bg-paper border ${v.border} rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-[360px] transition-all duration-300 ${
        mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${v.icon}`} strokeWidth={1.8} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink">{toast.title}</div>
        {toast.description && (
          <div className="text-xs text-ink-soft mt-0.5">{toast.description}</div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-ink-muted hover:text-ink shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}
