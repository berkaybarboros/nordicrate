'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRIES } from '@/lib/data';

// ─── Category definitions ──────────────────────────────────────────────────────
type Category = 'loans' | 'insurance' | 'deposits';

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal',  icon: '👤', path: '/loans/personal' },
  { value: 'mortgage', label: 'Mortgage',  icon: '🏠', path: '/loans/mortgage' },
  { value: 'business', label: 'Business',  icon: '🏢', path: '/loans/business' },
  { value: 'auto',     label: 'Auto',      icon: '🚗', path: '/loans/car' },
] as const;

const INSURANCE_TYPES = [
  { value: 'motor',  label: 'Motor',  icon: '🚗', path: '/insurance/motor',  badge: 'Required' },
  { value: 'casco',  label: 'CASCO',  icon: '🛡️', path: '/insurance/casco',  badge: null },
  { value: 'home',   label: 'Home',   icon: '🏠', path: '/insurance/home',   badge: null },
  { value: 'health', label: 'Health', icon: '❤️', path: '/insurance/health', badge: null },
] as const;

const DEPOSIT_TERMS = [
  { label: '3M',  months: 3 },
  { label: '6M',  months: 6 },
  { label: '12M', months: 12 },
  { label: '24M', months: 24 },
  { label: '36M', months: 36 },
] as const;

const AMOUNT_PRESETS = [
  { label: '€5K',   value: 5_000 },
  { label: '€15K',  value: 15_000 },
  { label: '€30K',  value: 30_000 },
  { label: '€75K',  value: 75_000 },
  { label: '€200K', value: 200_000 },
];

const DEPOSIT_PRESETS = [
  { label: '€2K',  value: 2_000 },
  { label: '€5K',  value: 5_000 },
  { label: '€10K', value: 10_000 },
  { label: '€25K', value: 25_000 },
  { label: '€50K', value: 50_000 },
];

type LoanType      = typeof LOAN_TYPES[number]['value'];
type InsuranceType = typeof INSURANCE_TYPES[number]['value'];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function HeroSearch() {
  const router = useRouter();

  // Top-level category
  const [category, setCategory] = useState<Category>('loans');

  // Loans state
  const [loanType, setLoanType]   = useState<LoanType>('personal');
  const [loanCountry, setLoanCountry] = useState('');
  const [loanAmount, setLoanAmount]   = useState(15_000);

  // Insurance state
  const [insType, setInsType]       = useState<InsuranceType>('motor');
  const [insCountry, setInsCountry] = useState('');

  // Deposits state
  const [depCountry, setDepCountry]     = useState('');
  const [depAmount, setDepAmount]       = useState(10_000);
  const [depTermMonths, setDepTermMonths] = useState(12);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  function handleLoans() {
    const config = LOAN_TYPES.find(t => t.value === loanType)!;
    const params = new URLSearchParams();
    if (loanCountry) params.set('country', loanCountry);
    params.set('amount', String(loanAmount));
    router.push(`${config.path}?${params.toString()}`);
  }

  function handleInsurance() {
    const config = INSURANCE_TYPES.find(t => t.value === insType)!;
    const params = new URLSearchParams();
    if (insCountry) params.set('country', insCountry);
    router.push(`${config.path}?${params.toString()}`);
  }

  function handleDeposits() {
    const params = new URLSearchParams();
    if (depCountry) params.set('country', depCountry);
    params.set('amount', String(depAmount));
    params.set('term', String(depTermMonths));
    router.push(`/deposits?${params.toString()}`);
  }

  // ─── Shared sub-components ──────────────────────────────────────────────────
  const CountrySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">Country</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 pr-8"
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
  );

  const SearchButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className="w-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-xl py-3 text-sm transition-all shadow-lg shadow-sky-900/50 flex items-center justify-center gap-2 group"
    >
      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {label}
    </button>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl">

      {/* Category tabs */}
      <div className="flex gap-1 mb-5 bg-black/25 rounded-xl p-1">
        {([
          { key: 'loans',     icon: '💳', label: 'Loans'     },
          { key: 'insurance', icon: '🛡️', label: 'Insurance' },
          { key: 'deposits',  icon: '🏦', label: 'Deposits'  },
        ] as { key: Category; icon: string; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              category === tab.key
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── LOANS ── */}
      {category === 'loans' && (
        <div className="space-y-4">
          {/* Loan sub-type chips */}
          <div>
            <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">Loan Type</label>
            <div className="flex gap-1 flex-wrap">
              {LOAN_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setLoanType(t.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    loanType === t.value
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <CountrySelect value={loanCountry} onChange={setLoanCountry} />

            <div>
              <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Loan Amount</span>
                <span className="text-sky-300 font-bold text-sm normal-case">€{loanAmount.toLocaleString()}</span>
              </label>
              <input
                type="range" min={1_000} max={500_000} step={1_000}
                value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer mb-2"
                style={{ accentColor: '#38bdf8' }}
              />
              <div className="flex gap-1">
                {AMOUNT_PRESETS.map(p => (
                  <button key={p.value} onClick={() => setLoanAmount(p.value)}
                    className={`flex-1 text-xs py-1 rounded-lg transition-all font-medium ${
                      loanAmount === p.value
                        ? 'bg-sky-500 text-white'
                        : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                    }`}
                  >{p.label}</button>
                ))}
              </div>
            </div>
          </div>

          <SearchButton onClick={handleLoans} label="Find Best Rates →" />
          <p className="text-center text-xs text-white/30">Free · No credit check · Instant results</p>
        </div>
      )}

      {/* ── INSURANCE ── */}
      {category === 'insurance' && (
        <div className="space-y-4">
          {/* Insurance type chips */}
          <div>
            <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">Insurance Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INSURANCE_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setInsType(t.value)}
                  className={`relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    insType === t.value
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t.badge && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                      {t.badge}
                    </span>
                  )}
                  <span className="text-lg">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <CountrySelect value={insCountry} onChange={setInsCountry} />
          <SearchButton onClick={handleInsurance} label="Compare Insurance →" />
          <p className="text-center text-xs text-white/30">Free quotes · No personal data required</p>
        </div>
      )}

      {/* ── DEPOSITS ── */}
      {category === 'deposits' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CountrySelect value={depCountry} onChange={setDepCountry} />

            <div>
              <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Deposit Amount</span>
                <span className="text-sky-300 font-bold text-sm normal-case">€{depAmount.toLocaleString()}</span>
              </label>
              <input
                type="range" min={500} max={200_000} step={500}
                value={depAmount} onChange={e => setDepAmount(Number(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer mb-2"
                style={{ accentColor: '#38bdf8' }}
              />
              <div className="flex gap-1">
                {DEPOSIT_PRESETS.map(p => (
                  <button key={p.value} onClick={() => setDepAmount(p.value)}
                    className={`flex-1 text-xs py-1 rounded-lg transition-all font-medium ${
                      depAmount === p.value
                        ? 'bg-sky-500 text-white'
                        : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                    }`}
                  >{p.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Deposit term */}
          <div>
            <label className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1.5 block">Term</label>
            <div className="flex gap-1">
              {DEPOSIT_TERMS.map(t => (
                <button key={t.months} onClick={() => setDepTermMonths(t.months)}
                  className={`flex-1 text-xs py-2 rounded-lg font-semibold transition-all ${
                    depTermMonths === t.months
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                  }`}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <SearchButton onClick={handleDeposits} label="Compare Deposit Rates →" />
          <p className="text-center text-xs text-white/30">FSCS/deposit guarantee info shown on results</p>
        </div>
      )}
    </div>
  );
}
