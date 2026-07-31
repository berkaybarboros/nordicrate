'use client';

/**
 * EmailCaptureForm — GDPR-uyumlu e-posta yakalama (newsletter + rate report gate).
 * Lead'i Supabase leads tablosuna source ile yazar; RateAlertStrip'le aynı
 * consent modeli (zorunlu checkbox + /privacy linki).
 */

import { useState } from 'react';
import Link from 'next/link';
import { createLead } from '@/lib/db';
import { track } from '@/lib/tracker';

interface Props {
  /** leads.source değeri — 'newsletter' | 'rate-report' vb. */
  source: string;
  buttonLabel: string;
  /** Başarı sonrası çağrılır (ör. rapor linkini açmak için) */
  onSuccess?: () => void;
  /** Koyu zeminde mi render ediliyor? */
  dark?: boolean;
}

export default function EmailCaptureForm({ source, buttonLabel, onSuccess, dark = false }: Props) {
  const [email, setEmail]     = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy]       = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent || busy) return;
    setBusy(true);
    setError('');
    const { error: dbError } = await createLead({ email, source });
    setBusy(false);
    if (dbError) { setError('Something went wrong — please try again.'); return; }
    track('lead_capture', { source });
    setDone(true);
    onSuccess?.();
  }

  if (done) {
    return (
      <p className={`text-sm font-semibold ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}>
        ✓ You&apos;re in — thanks!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            dark
              ? 'bg-white/10 border border-white/15 text-white placeholder-white/40'
              : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400'
          }`}
        />
        <button
          type="submit"
          disabled={!consent || busy}
          className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-400/40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl px-5 py-2.5 transition-colors shrink-0"
        >
          {busy ? 'Saving…' : buttonLabel}
        </button>
      </div>
      <label className={`flex items-start gap-2 text-xs cursor-pointer ${dark ? 'text-white/60' : 'text-slate-500'}`}>
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 accent-sky-600"
        />
        <span>
          I agree to receive emails from NordicRate and accept the{' '}
          <Link href="/privacy" className={dark ? 'underline text-white/80' : 'underline text-slate-600'}>
            Privacy Policy
          </Link>
          . Unsubscribe anytime.
        </span>
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
