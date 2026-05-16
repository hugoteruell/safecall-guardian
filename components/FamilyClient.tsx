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

const SUGGESTED = {
  name: '+1 (602) 555-9012',
  phone: '+1 (602) 555-9012',
};

export default function FamilyClient({ contacts }: { contacts: FamilyContact[] }) {
  const router = useRouter();
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
      setName('');
      setRelationship('');
      setPhone('');
      setShowAdd(false);
      router.refresh();
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
    }
  }

  async function deleteContact(id: string) {
    if (!confirm('Remove this contact? SafeCall will no longer recognize this number as trusted.')) return;
    setOptimisticDeleted((s) => new Set(s).add(id));
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      // Roll back optimistic state
      setOptimisticDeleted((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      alert('Could not delete. Please try again.');
      return;
    }
    router.refresh();
  }

  const visibleContacts = contacts.filter((c) => !optimisticDeleted.has(c.id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Family contacts</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            These are the people SafeCall recognizes as safe. New numbers that
            claim to be one of them get flagged as impersonation attempts.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="min-h-[40px] px-4 bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add contact
        </button>
      </div>

      {!suggestionDismissed && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Suggested contact
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-full bg-white text-amber-700 font-semibold flex items-center justify-center border border-amber-200">
                ?
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900">
                  Unknown · {SUGGESTED.phone}
                </div>
                <div className="text-xs text-slate-600">
                  Called <span className="font-semibold">5 times</span> in the last 2
                  weeks. Mom has saved this number locally.
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={addSuggested}
                disabled={suggestionPending}
                className="min-h-[36px] px-3 bg-white border border-amber-300 hover:border-amber-500 text-amber-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {suggestionPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Add as trusted
              </button>
              <button
                onClick={() => setSuggestionDismissed(true)}
                className="min-h-[36px] px-3 bg-white border border-slate-300 hover:border-slate-500 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            New contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Relationship (e.g. Grandson)"
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 sm:col-span-2"
            />
          </div>
          {error && <p className="text-xs text-red-600 mb-3 font-semibold">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={pending}
              className="min-h-[36px] px-4 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {pending && <Loader2 className="w-3 h-3 animate-spin" />}
              {pending ? 'Saving…' : 'Save contact'}
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setError(null);
              }}
              className="min-h-[36px] px-4 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
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
          <div className="col-span-full text-center py-12 text-sm text-slate-500">
            No trusted contacts yet. Click <span className="font-semibold">Add contact</span> to start.
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 relative">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold flex items-center justify-center">
          {contact.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-slate-900 truncate">
            {contact.name}
          </div>
          <div className="text-xs text-slate-500">{contact.relationship}</div>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
            aria-label="Contact options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert('Edit not wired in this demo yet.');
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span className="tabular-nums">{contact.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>{contact.interactions} interactions</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">
            Trusted since {formatDate(contact.addedAtIso)}
          </span>
        </div>
      </div>
    </div>
  );
}
