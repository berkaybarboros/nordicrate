'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRIES } from '@/lib/data';

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal',  icon: '👤', path: '/loans' },
  { value: 'mortgage', label: 'Mortgage',  icon: '🏠', path: '/mortgage' },
  { value: 'business', label: 'Business',  icon: '🏢', path: '/business' },
  { value: 'auto',     label: 'Auto',      icon: '🚗', path: '/loans' },
] as const;

type LoanTypeValue = typeof LOAN_TYPES[number]['value'];

const AMOUNT_PRESETS = [
  { label: '€5K',   value: 5_000 },
  { label: '€15K',  value: 15_000 },
  { label: '€30K',  value: 30_000 },
  { label: '€75K',  value: 75_000 },
  { label: '€200K', value: 200_000 },
];

export default function HeroSearch() {
  const router = useRouter();
  const [loanType, setLoanType] = useState<LoanTypeValue>('personal');
  const [country, setCountry] = useState('');
  const [amount, setAmount] = useState(15_000);

  function handleSearch() {
    const config = LOAN_TYPES.find(t => t.value === loanType)!;
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    params.set('amount', String(amount));
    if (loanType === 'auto') params.set('type', 'auto');
    router.push(`${config.path}?${params.toString()}`);
  }

  return (
    <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl">

      {/* Loan type tabs */}
      <div className="flex gap-1 mb-5 bg-black/25 rounded-xl p-1">
        {LOAN_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setLoanType(t.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              loanType === t.value
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">

        {/* Country */}
        <div>
          <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">Country</label>
          <div className="relative">
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full appearance-none bg-white/10 border border-white/20 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent pr-8"
            >
              <option value="" className="text-slate-900 bg-white">🌍 Any country</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code} className="text-slate-900 bg-white">
                  {c.name}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Loan Amount</span>
            <span className="text-sky-300 font-bold text-sm normal-case">€{amount.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={1_000}
            max={500_000}
            step={1_000}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full h-2 rounded-lg cursor-pointer mb-2"
            style={{ accentColor: '#38bdf8' }}
          />
          <div className="flex gap-1">
            {AMOUNT_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => setAmount(p.value)}
                className={`flex-1 text-xs py-1 rounded-lg transition-all font-medium ${
                  amount === p.value
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div>
          <button
            onClick={handleSearch}
            className="w-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-xl py-3 text-sm transition-all shadow-lg shadow-sky-900/50 flex items-center justify-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Best Rates →
          </button>
          <p className="text-center text-xs text-white/30 mt-2">Free · No credit check · Instant results</p>
        </div>
      </div>
    </div>
  );
}
