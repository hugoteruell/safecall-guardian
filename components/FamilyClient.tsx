'use client';
import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  MoreHorizontal,
  PlusCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Pencil,
} from 'lucide-react';
import { type FamilyContact } from '@/lib/userData';
import { formatDate } from '@/lib/format';
import Avatar from './Avatar';
import { useToast } from './Toast';

const SUGGESTED = {
  name: '+1 (602) 555-9012',
  phone: '+1 (602) 555-9012',
};

export default function FamilyClient({ contacts }: { contacts: FamilyContact[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [suggestionPending, setSuggestionPending] = useState(false);
  const [optimisticDeleted, setOptimisticDeleted] = useState<Set<string>>(new Set());

  function save() {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required');
      return;
    }
    startTransition(async () => {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, relationship, phone }),
      });
      if (!res.ok) {
        setError('Could not save. Please try again.');
        return;
      }
      const savedName = name;
      setName('');
      setRelationship('');
      setPhone('');
      setShowAdd(false);
      router.refresh();
      toast({
        title: `${savedName} is now trusted`,
        description: 'SafeCall will recognize this number as safe.',
      });
    });
  }

  async function addSuggested() {
    setSuggestionPending(true);
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Trusted (saved by Mom)',
        relationship: 'Unknown',
        phone: SUGGESTED.phone,
      }),
    });
    setSuggestionPending(false);
    if (res.ok) {
      setSuggestionDismissed(true);
      router.refresh();
      toast({ title: 'Number added to trusted contacts.' });
    }
  }

  async function deleteContact(id: string) {
    if (!confirm('Remove this contact? SafeCall will no longer recognize this number as trusted.'))
      return;
    setOptimisticDeleted((s) => new Set(s).add(id));
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setOptimisticDeleted((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      toast({ title: 'Could not remove contact', variant: 'error' });
      return;
    }
    router.refresh();
    toast({ title: 'Contact removed.' });
  }

  const visibleContacts = contacts.filter((c) => !optimisticDeleted.has(c.id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap animate-fade-up">
        <div>
          <h1 className="font-display text-4xl text-ink leading-none">Family contacts</h1>
          <p className="text-sm text-ink-muted mt-2 max-w-2xl">
            These are the people SafeCall recognizes as safe. New numbers that claim to be
            one of them get flagged as impersonation attempts.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="min-h-[40px] px-4 bg-ink hover:bg-ink-soft text-cream text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add contact
        </button>
      </div>

      {!suggestionDismissed && (
        <div className="bg-gold-soft border border-gold/30 rounded-3xl p-5 card-lift">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-coral-deep mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            Suggested contact
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-full bg-paper text-coral-deep font-semibold flex items-center justify-center border border-gold/40 font-display">
                ?
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink numerals">
                  Unknown · {SUGGESTED.phone}
                </div>
                <div className="text-xs text-ink-soft">
                  Called <span className="font-semibold">5 times</span> in the last 2 weeks.
                  Mom has saved this number locally.
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={addSuggested}
                disabled={suggestionPending}
                className="min-h-[36px] px-3 bg-paper border border-gold/40 hover:border-coral text-coral-deep text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                {suggestionPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Add as trusted
              </button>
              <button
                onClick={() => setSuggestionDismissed(true)}
                className="min-h-[36px] px-3 bg-paper border border-cream-deep hover:border-ink-muted text-ink-soft text-xs font-semibold rounded-lg transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="bg-paper border border-cream-deep rounded-3xl p-6 animate-fade-up">
          <h2 className="text-[11px] font-bold text-ink uppercase tracking-[0.18em] mb-4">
            New contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="h-11 px-3 bg-cream border border-cream-deep rounded-lg text-sm focus:outline-none focus:border-ink"
            />
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Relationship (e.g. Grandson)"
              className="h-11 px-3 bg-cream border border-cream-deep rounded-lg text-sm focus:outline-none focus:border-ink"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="h-11 px-3 bg-cream border border-cream-deep rounded-lg text-sm focus:outline-none focus:border-ink sm:col-span-2"
            />
          </div>
          {error && <p className="text-xs text-bordeaux mb-3 font-semibold">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={pending}
              className="min-h-[36px] px-4 bg-ink hover:bg-ink-soft text-cream text-xs font-semibold rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {pending && <Loader2 className="w-3 h-3 animate-spin" />}
              {pending ? 'Saving…' : 'Save contact'}
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setError(null);
              }}
              className="min-h-[36px] px-4 bg-paper border border-cream-deep text-ink-soft text-xs font-semibold rounded-lg hover:border-ink-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleContacts.map((c) => (
          <ContactCard key={c.id} contact={c} onDelete={() => deleteContact(c.id)} />
        ))}
        {visibleContacts.length === 0 && (
          <div className="col-span-full text-center py-16 text-sm text-ink-muted bg-paper border border-cream-deep rounded-3xl">
            <div className="font-display text-2xl text-ink mb-2">All quiet.</div>
            <div>
              No trusted contacts yet. Click <span className="font-semibold">Add contact</span> to start.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactCard({
  contact,
  onDelete,
}: {
  contact: FamilyContact;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  return (
    <div className="bg-paper border border-cream-deep rounded-3xl p-6 relative card-lift">
      <div className="flex items-start gap-3 mb-5">
        <Avatar seed={contact.name} size="lg" ring />
        <div className="flex-1 min-w-0">
          <div className="font-display text-xl text-ink leading-tight truncate">
            {contact.name}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">{contact.relationship}</div>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="text-ink-muted hover:text-ink p-1 rounded hover:bg-cream-soft transition-colors"
            aria-label="Contact options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-paper border border-cream-deep rounded-xl shadow-lg z-10 py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert('Edit not wired in this demo yet.');
                }}
                className="w-full text-left px-3 py-2 text-sm text-ink-soft hover:bg-cream-soft flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="w-full text-left px-3 py-2 text-sm text-bordeaux hover:bg-bordeaux-soft flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-ink-soft">
          <Phone className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.8} />
          <span className="numerals">{contact.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-soft">
          <MessageSquare className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.8} />
          <span>{contact.interactions} interactions</span>
        </div>
        <div className="flex items-center gap-2 text-sage-deep">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span className="text-xs font-semibold">
            Trusted since {formatDate(contact.addedAtIso)}
          </span>
        </div>
      </div>
    </div>
  );
}
