'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS, INSTITUTIONS, COUNTRIES } from '@/lib/data';
import { calculateMonthlyPayment, calculateAPR, getInstitution, getCountry } from '@/lib/utils';
import type { LoanType } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type CalcLoanType = 'personal' | 'mortgage' | 'business';
interface YearRow { year: number; interest: number; principal: number; balance: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function amortize(principal: number, annualRate: number, months: number): { monthly: number; years: YearRow[] } {
  const r = annualRate / 100 / 12;
  const monthly = r === 0
    ? principal / months
    : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

  let balance = principal;
  const years: YearRow[] = [];

  for (let yr = 1; yr <= Math.ceil(months / 12); yr++) {
    let yInterest = 0, yPrincipal = 0;
    const mInYear = Math.min(12, months - (yr - 1) * 12);
    for (let m = 0; m < mInYear; m++) {
      const int = balance * r;
      const pri = monthly - int;
      yInterest += int; yPrincipal += pri;
      balance = Math.max(0, balance - pri);
    }
    years.push({ year: yr, interest: Math.round(yInterest), principal: Math.round(yPrincipal), balance: Math.round(balance) });
    if (balance <= 0) break;
  }
  return { monthly, years };
}

function getRateRange(type: LoanType, country: string) {
  const products = PRODUCTS.filter(p => {
    const inst = INSTITUTIONS.find(i => i.id === p.institutionId);
    return p.type === type && (!country || inst?.country === country);
  });
  if (products.length === 0) return null;
  const rates = products.map(p => p.rateMin);
  return { min: Math.min(...rates), max: Math.max(...rates), count: products.length };
}

const TYPE_CONFIG = {
  personal: { label: 'Personal', icon: '👤', path: '/loans',    loanType: 'personal' as LoanType, maxAmount: 100_000, maxTerm:  84, defaultAmount: 15_000, defaultTerm:  60 },
  mortgage: { label: 'Mortgage', icon: '🏠', path: '/mortgage', loanType: 'mortgage' as LoanType, maxAmount: 500_000, maxTerm: 360, defaultAmount: 200_000, defaultTerm: 240 },
  business: { label: 'Business', icon: '🏢', path: '/business', loanType: 'business' as LoanType, maxAmount: 500_000, maxTerm: 120, defaultAmount: 50_000,  defaultTerm:  60 },
} as const;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function LoanCalculator() {
  const [loanType,   setLoanType]   = useState<CalcLoanType>('personal');
  const [country,    setCountry]    = useState('');
  const [amount,     setAmount]     = useState(15_000);
  const [term,       setTerm]       = useState(60);
  const [euribor3m,  setEuribor3m]  = useState<number | null>(null);
  const [showTable,  setShowTable]  = useState(false);

  const config = TYPE_CONFIG[loanType];

  useEffect(() => {
    fetch('/api/rates').then(r => r.json())
      .then(d => { if (d?.euribor?.euribor3m?.rate) setEuribor3m(d.euribor.euribor3m.rate); })
      .catch(() => {});
  }, []);

  useEffect(() => { setAmount(config.defaultAmount); setTerm(config.defaultTerm); }, [loanType]); // eslint-disable-line react-hooks/exhaustive-deps

  const rateRange          = useMemo(() => getRateRange(config.loanType, country), [config.loanType, country]);
  const representativeRate = useMemo(() => rateRange
    ? parseFloat(((rateRange.min + rateRange.max) / 2).toFixed(2))
    : loanType === 'mortgage' ? 4.5 : loanType === 'business' ? 7.0 : 12.9,
  [rateRange, loanType]);
  const variableRate       = euribor3m != null ? parseFloat((euribor3m + 1.2).toFixed(2)) : null;

  const { monthly, years } = useMemo(() => amortize(amount, representativeRate, term), [amount, representativeRate, term]);
  const totalPaid          = monthly * term;
  const totalInterest      = totalPaid - amount;
  const effectiveAPR       = calculateAPR(amount, representativeRate, term, 0);
  const variableCalc       = useMemo(
    () => variableRate && loanType === 'mortgage' ? amortize(amount, variableRate, term) : null,
    [amount, variableRate, term, loanType]
  );

  const topProducts = useMemo(() => PRODUCTS.filter(p => {
    const inst = INSTITUTIONS.find(i => i.id === p.institutionId);
    return p.type === config.loanType && (!country || inst?.country === country) && p.limitMin <= amount && p.limitMax >= amount;
  }).sort((a, b) => a.rateMin - b.rateMin).slice(0, 3), [config.loanType, country, amount]);

  const termYears = term >= 12 ? `${Math.round(term/12)} yr${Math.round(term/12) > 1 ? 's' : ''}` : `${term} mo`;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full">

      {/* Loan type tabs */}
      <div className="flex border-b border-slate-100">
        {(Object.keys(TYPE_CONFIG) as CalcLoanType[]).map(t => (
          <button key={t} onClick={() => setLoanType(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
              loanType === t ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span>{TYPE_CONFIG[t].icon}</span>
            <span className="hidden sm:inline">{TYPE_CONFIG[t].label}</span>
          </button>
        ))}
      </div>

      <div className="p-5">

        {/* Country chips */}
        <div className="mb-4">
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCountry('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                !country ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'
              }`}
            >All</button>
            {COUNTRIES.map(c => (
              <button key={c.code} onClick={() => setCountry(c.code === country ? '' : c.code)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  country === c.code ? 'bg-sky-600 text-white border-sky-600' : 'border-slate-200 text-slate-500 hover:border-sky-300'
                }`}
              >
                <img src={`https://flagcdn.com/16x12/${c.code.toLowerCase()}.png`} width={16} height={12} alt={c.name} className="rounded-sm" />
                <span className="hidden lg:inline">{c.name}</span>
                <span className="lg:hidden">{c.code}</span>
              </button>
            ))}
          </div>
          {rateRange && (
            <p className="text-xs text-slate-400 mt-1.5">
              {rateRange.count} products · Rate range: <strong className="text-sky-600">{rateRange.min}%</strong> – <strong className="text-slate-600">{rateRange.max}%</strong> APR
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-600">Loan Amount</label>
            <span className="text-xl font-extrabold text-sky-600">€{amount.toLocaleString()}</span>
          </div>
          <input type="range" min={1_000} max={config.maxAmount} step={loanType === 'mortgage' ? 5_000 : 500}
            value={amount} onChange={e => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" style={{ accentColor: '#0284c7' }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
            <span>€1K</span><span>€{(config.maxAmount/1000).toFixed(0)}K</span>
          </div>
        </div>

        {/* Term */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-600">Repayment Period</label>
            <span className="text-xl font-extrabold text-slate-800">{termYears}</span>
          </div>
          <input type="range" min={6} max={config.maxTerm} step={6}
            value={term} onChange={e => setTerm(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" style={{ accentColor: '#334155' }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
            <span>6 mo</span>
            <span>{config.maxTerm >= 12 ? `${config.maxTerm/12} yr${config.maxTerm/12 > 1 ? 's':''}` : `${config.maxTerm} mo`}</span>
          </div>
        </div>

        {/* Fixed rate result */}
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-4 mb-3 border border-sky-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-sky-700 uppercase tracking-wide">
              {loanType === 'mortgage' && variableCalc ? '🔒 Fixed Rate' : '📊 Estimated Payment'}
            </div>
            <div className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {representativeRate}% APR · {rateRange ? 'from real data' : 'indicative'}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-extrabold text-sky-700">€{Math.round(monthly).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">/ month</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">€{Math.round(totalInterest).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">total interest</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">€{Math.round(totalPaid).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">total cost</p>
            </div>
          </div>
          <div className="mt-2.5 bg-sky-100/60 rounded-lg px-3 py-1.5 text-xs text-sky-700 text-center">
            Effective APR: <strong>{effectiveAPR}%</strong> &nbsp;·&nbsp; Interest share: <strong>{((totalInterest/totalPaid)*100).toFixed(0)}%</strong>
          </div>
        </div>

        {/* Mortgage variable scenario */}
        {loanType === 'mortgage' && variableCalc && variableRate && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-3 border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">📈 Variable Rate (EURIBOR 3M + 1.2%)</div>
              <div className="text-xs text-amber-600 bg-white border border-amber-200 px-2 py-0.5 rounded-full">
                {euribor3m?.toFixed(2)}% + 1.20% = {variableRate}%
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-extrabold text-amber-700">€{Math.round(variableCalc.monthly).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-0.5">/ month</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">
                  {variableCalc.monthly < monthly ? '−' : '+'}€{Math.abs(Math.round((variableCalc.monthly - monthly) * term)).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">vs fixed total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">€{Math.round(variableCalc.monthly * term).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-0.5">total cost</p>
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2 text-center">⚠️ Variable rates fluctuate with EURIBOR — this is today&apos;s snapshot.</p>
          </div>
        )}

        {/* Amortization toggle */}
        <button onClick={() => setShowTable(t => !t)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-600 py-1.5 mb-2 transition-colors"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${showTable ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showTable ? 'Hide' : 'Show'} year-by-year breakdown
        </button>

        {showTable && (
          <div className="mb-4 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr className="text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-3 py-2 font-semibold">Year</th>
                  <th className="text-right px-3 py-2 font-semibold">Interest</th>
                  <th className="text-right px-3 py-2 font-semibold">Principal</th>
                  <th className="text-right px-3 py-2 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {years.map(row => (
                  <tr key={row.year} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-600 font-medium">Yr {row.year}</td>
                    <td className="px-3 py-1.5 text-right text-red-500 font-medium">€{row.interest.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-emerald-600 font-medium">€{row.principal.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-slate-700">€{row.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Top products */}
        {topProducts.length > 0 && (
          <div className="border-t border-slate-100 pt-3 mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Top Matching Products
            </p>
            <div className="space-y-1.5">
              {topProducts.map((p, i) => {
                const inst = getInstitution(p.institutionId);
                const ctry = inst ? getCountry(inst.country) : null;
                const mPmt = calculateMonthlyPayment(amount, p.rateMin, term);
                const savings = Math.round((monthly - mPmt) * term);
                return (
                  <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${
                        i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-orange-300'
                      }`}>{i+1}</span>
                      {ctry && <img src={`https://flagcdn.com/16x12/${ctry.code.toLowerCase()}.png`} width={16} height={12} alt={ctry.name} className="rounded-sm" />}
                      <div>
                        <p className="text-xs font-bold text-slate-800">{inst?.shortName}</p>
                        <p className="text-xs text-slate-500">{p.rateMin}% APR</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-sky-700">€{Math.round(mPmt).toLocaleString()}/mo</p>
                      {savings > 0 && <p className="text-xs text-emerald-600 font-medium">saves €{savings.toLocaleString()}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Link href={`${config.path}${country ? `?country=${country}` : ''}`}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-xl py-2.5 text-sm transition-colors"
        >
          Compare All {rateRange?.count ?? ''} Products →
        </Link>
        <p className="text-xs text-slate-400 mt-2 text-center">
          {rateRange ? 'Rates from real market data' : 'Indicative rates'} · Always verify with bank
        </p>
      </div>
    </div>
  );
}
