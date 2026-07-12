'use client';

import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

const PARTNER_TYPES = [
  { value: 'bank', label: 'Bank / Lender' },
  { value: 'broker', label: 'Credit Broker' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'real-estate', label: 'Real Estate / PropTech' },
  { value: 'media', label: 'Media / Publisher' },
  { value: 'other', label: 'Other' },
];

export default function PartnerLeadForm() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [partnerType, setPartnerType] = useState('bank');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, partnerType, message, source: 'b2b-partners' }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <p className="font-bold text-slate-900">Thanks — we&apos;ll be in touch within 1 business day.</p>
        <p className="text-sm text-slate-500 mt-1">You&apos;ll hear from us at {email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Work email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">You are a</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PARTNER_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setPartnerType(t.value)}
              aria-pressed={partnerType === t.value}
              className={`text-xs font-semibold py-2 px-2 rounded-lg border transition-colors ${
                partnerType === t.value
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">What are you looking for?</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="e.g. We're a broker in Estonia looking for qualified personal loan leads…"
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />
      </div>
      {state === 'error' && (
        <p className="text-xs text-red-600">Something went wrong — please try again or email us directly.</p>
      )}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-colors"
      >
        <Send size={15} />
        {state === 'sending' ? 'Sending…' : 'Request partnership details'}
      </button>
    </form>
  );
}
