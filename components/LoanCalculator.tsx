'use client';

/**
 * Hero hesaplayıcısı — BİLİNÇLİ OLARAK kompakt (Lendo pattern).
 * Ülke chip'leri, yıl kırılımı, top-products ve değişken-faiz senaryosu
 * hero'dan çıkarıldı: tek ekranda tamamı görünür, tek iş yapar —
 * tutar + vade → aylık ödeme → "Compare" CTA. Derin analiz /loans'ta.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/data';
import { calculateAPR } from '@/lib/utils';

type CalcLoanType = 'personal' | 'mortgage' | 'business';

function monthlyPayment(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function getRateRange(type: CalcLoanType) {
  const rates = PRODUCTS.filter(p => p.type === type).map(p => p.rateMin);
  if (rates.length === 0) return null;
  return { min: Math.min(...rates), max: Math.max(...rates), count: rates.length };
}

const TYPE_CONFIG = {
  personal: { label: 'Personal', icon: '👤', path: '/loans',    maxAmount: 100_000, maxTerm:  84, defaultAmount: 15_000,  defaultTerm:  60 },
  mortgage: { label: 'Mortgage', icon: '🏠', path: '/mortgage', maxAmount: 500_000, maxTerm: 360, defaultAmount: 200_000, defaultTerm: 240 },
  business: { label: 'Business', icon: '🏢', path: '/business', maxAmount: 500_000, maxTerm: 120, defaultAmount: 50_000,  defaultTerm:  60 },
} as const;

export default function LoanCalculator() {
  const [loanType, setLoanType] = useState<CalcLoanType>('personal');
  const [amount, setAmount] = useState(15_000);
  const [term, setTerm] = useState(60);

  const config = TYPE_CONFIG[loanType];

  const switchType = (t: CalcLoanType) => {
    setLoanType(t);
    setAmount(TYPE_CONFIG[t].defaultAmount);
    setTerm(TYPE_CONFIG[t].defaultTerm);
  };

  const rateRange = useMemo(() => getRateRange(loanType), [loanType]);
  const representativeRate = rateRange
    ? parseFloat(((rateRange.min + rateRange.max) / 2).toFixed(2))
    : loanType === 'mortgage' ? 4.5 : loanType === 'business' ? 7.0 : 12.9;

  const monthly = monthlyPayment(amount, representativeRate, term);
  const totalPaid = monthly * term;
  const effectiveAPR = calculateAPR(amount, representativeRate, term, 0);

  const termYears = term >= 12 ? `${Math.round(term / 12)} yr${Math.round(term / 12) > 1 ? 's' : ''}` : `${term} mo`;

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 overflow-hidden w-full">

      {/* Loan type tabs */}
      <div className="flex border-b border-slate-100">
        {(Object.keys(TYPE_CONFIG) as CalcLoanType[]).map(t => (
          <button key={t} onClick={() => switchType(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
              loanType === t ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span>{TYPE_CONFIG[t].icon}</span>
            <span>{TYPE_CONFIG[t].label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">

        {/* Amount */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-600">Loan Amount</label>
            <span className="text-2xl font-extrabold text-sky-600">€{amount.toLocaleString()}</span>
          </div>
          <input type="range" min={1_000} max={config.maxAmount} step={loanType === 'mortgage' ? 5_000 : 500}
            value={amount} onChange={e => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" style={{ accentColor: '#2563eb' }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
            <span>€1K</span><span>€{(config.maxAmount / 1000).toFixed(0)}K</span>
          </div>
        </div>

        {/* Term */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-600">Repayment Period</label>
            <span className="text-2xl font-extrabold text-slate-800">{termYears}</span>
          </div>
          <input type="range" min={6} max={config.maxTerm} step={6}
            value={term} onChange={e => setTerm(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" style={{ accentColor: '#334155' }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
            <span>6 mo</span>
            <span>{config.maxTerm >= 12 ? `${config.maxTerm / 12} yr${config.maxTerm / 12 > 1 ? 's' : ''}` : `${config.maxTerm} mo`}</span>
          </div>
        </div>

        {/* Result — tek net rakam */}
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl px-5 py-4 mb-5 border border-sky-100">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-sky-700 uppercase tracking-wide mb-1">Estimated payment</p>
              <p className="text-4xl font-extrabold text-sky-700 leading-none">
                €{Math.round(monthly).toLocaleString()}
                <span className="text-base font-semibold text-slate-500"> /mo</span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-1">
              <p><strong className="text-slate-700">{effectiveAPR}%</strong> effective APR</p>
              <p><strong className="text-slate-700">€{Math.round(totalPaid).toLocaleString()}</strong> total cost</p>
            </div>
          </div>
        </div>

        <Link href={config.path}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl py-3.5 text-sm transition-colors shadow-lg shadow-sky-600/20"
        >
          Compare {rateRange?.count ?? ''} {config.label.toLowerCase()} offers →
        </Link>
        <p className="text-xs text-slate-400 mt-2.5 text-center">
          {rateRange ? (
            <>Rates from <strong className="text-slate-500">{rateRange.min}%</strong> APR · real market data · always verify with bank</>
          ) : 'Indicative rates · always verify with bank'}
        </p>
      </div>
    </div>
  );
}
