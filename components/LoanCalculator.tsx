'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculateMonthlyPayment } from '@/lib/utils';

const AMOUNT_PRESETS = [5000, 10000, 15000, 25000, 50000];
const TERM_OPTIONS = [12, 24, 36, 48, 60, 84];
const REPRESENTATIVE_APR = 12.9;

export default function LoanCalculator() {
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState(60);

  const monthly = useMemo(
    () => calculateMonthlyPayment(amount, REPRESENTATIVE_APR, term),
    [amount, term]
  );
  const total = monthly * term;
  const interest = total - amount;

  const termLabel = term >= 12 ? `${term / 12} yr${term / 12 > 1 ? 's' : ''}` : `${term} mo`;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
          <span className="text-sky-600 text-base">🧮</span>
        </div>
        <h3 className="text-base font-bold text-slate-900">Loan Calculator</h3>
      </div>

      {/* Amount slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-600">Loan Amount</label>
          <span className="text-xl font-extrabold text-sky-600">€{amount.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={1000}
          max={100000}
          step={500}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: '#0284c7' }}
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>€1,000</span>
          <span>€100,000</span>
        </div>
        {/* Amount presets */}
        <div className="flex gap-1.5 mt-2.5">
          {AMOUNT_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`flex-1 text-xs font-semibold py-1 rounded-lg border transition-all ${
                amount === p
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-700'
              }`}
            >
              €{p >= 1000 ? `${p / 1000}K` : p}
            </button>
          ))}
        </div>
      </div>

      {/* Term selector */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-600">Repayment Period</label>
          <span className="text-xl font-extrabold text-slate-800">{termLabel}</span>
        </div>
        <div className="flex gap-1.5">
          {TERM_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTerm(t)}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-all ${
                term === t
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              {t >= 12 ? `${t / 12}y` : `${t}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Result box */}
      <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-4 mb-4 border border-sky-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-extrabold text-sky-700">
              €{Math.round(monthly).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">/ month</p>
          </div>
          <div className="border-x border-sky-200">
            <p className="text-xl font-bold text-slate-700">
              €{Math.round(interest).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">total interest</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-700">
              €{Math.round(total).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">total repayment</p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3 border-t border-sky-100 pt-2">
          Representative {REPRESENTATIVE_APR}% APR · actual rate depends on credit profile
        </p>
      </div>

      <Link
        href="/loans"
        className="block w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-center font-bold py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-sky-200"
      >
        Find My Best Rate →
      </Link>
      <p className="text-center text-xs text-slate-400 mt-2.5">
        ✓ Free · ✓ No credit check · ✓ Takes 2 minutes
      </p>
    </div>
  );
}
