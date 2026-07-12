'use client';

import { useState } from 'react';
import { FileBarChart, CheckCircle2 } from 'lucide-react';

/** B2B lead magnet — çeyreklik oran raporu için şirket e-postası toplar. */
export default function RateReportSignup() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    try {
      await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'rate-report' }),
      });
    } catch { /* sessiz — yine teşekkür göster */ }
    setState('done');
  }

  return (
    <div className="bg-slate-950 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" aria-hidden />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/30 rounded-xl flex items-center justify-center shrink-0">
          <FileBarChart className="text-sky-400" size={22} />
        </div>
        <div className="flex-1">
          <h3 className="font-extrabold text-lg">Nordic &amp; Baltic Rate Report</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-lg">
            Quarterly market data from our live rate pipeline — EURIBOR trends, bank-by-bank
            loan pricing, and market movements across 8 countries. Free for industry professionals.
          </p>
        </div>
        {state === 'done' ? (
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm shrink-0">
            <CheckCircle2 size={18} /> You&apos;re on the list
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full sm:w-auto gap-2 shrink-0">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="work@company.com"
              className="flex-1 sm:w-56 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Get the report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
