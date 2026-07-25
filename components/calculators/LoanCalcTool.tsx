'use client';

/**
 * Bağımsız kredi hesaplayıcısı — /loan-calculator, /et/laenukalkulaator,
 * /fi/lainalaskuri sayfalarının aracı. Dict-driven (LanguageContext'e bağımlı
 * değil — sayfa kendi dilini geçer). SERP kazananlarının formülü: kullanıcı
 * ORANI DA ayarlayabilir + yıl-yıl kırılım tablosu (derin etkileşim).
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';

export interface CalcDict {
  amountLabel: string;
  yearsLabel: string;
  rateLabel: string;
  rateHint: string;
  monthlyLabel: string;
  totalInterestLabel: string;
  totalCostLabel: string;
  tableShow: string;
  tableHide: string;
  colYear: string;
  colInterest: string;
  colPrincipal: string;
  colBalance: string;
  ctaText: string;
  ctaHref: string;
  disclaimer: string;
  yearsSuffix: string;
}

interface YearRow { year: number; interest: number; principal: number; balance: number }

function amortize(principal: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  const monthly = r === 0
    ? principal / months
    : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  let balance = principal;
  const years: YearRow[] = [];
  for (let yr = 1; yr <= Math.ceil(months / 12); yr++) {
    let yInterest = 0;
    let yPrincipal = 0;
    const mInYear = Math.min(12, months - (yr - 1) * 12);
    for (let m = 0; m < mInYear; m++) {
      const int = balance * r;
      const pri = monthly - int;
      yInterest += int;
      yPrincipal += pri;
      balance = Math.max(0, balance - pri);
    }
    years.push({ year: yr, interest: Math.round(yInterest), principal: Math.round(yPrincipal), balance: Math.round(balance) });
    if (balance <= 0) break;
  }
  return { monthly, years };
}

export default function LoanCalcTool({ dict }: { dict: CalcDict }) {
  const [amount, setAmount] = useState(10_000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(9);
  const [showTable, setShowTable] = useState(false);

  const months = years * 12;
  const { monthly, years: rows } = useMemo(() => amortize(amount, rate, months), [amount, rate, months]);
  const totalPaid = monthly * months;
  const totalInterest = totalPaid - amount;

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 p-6">
      {/* Amount */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-slate-600">{dict.amountLabel}</label>
          <span className="text-2xl font-extrabold text-sky-600">€{amount.toLocaleString()}</span>
        </div>
        <input
          type="range" min={500} max={200_000} step={500} value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: '#2563eb' }}
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>€500</span><span>€200K</span></div>
      </div>

      {/* Years */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-slate-600">{dict.yearsLabel}</label>
          <span className="text-2xl font-extrabold text-slate-800">{years} {dict.yearsSuffix}</span>
        </div>
        <input
          type="range" min={1} max={30} step={1} value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: '#334155' }}
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>1</span><span>30</span></div>
      </div>

      {/* Rate — kullanıcı ayarlar; varsayılan nötr */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-slate-600">{dict.rateLabel}</label>
          <span className="text-2xl font-extrabold text-emerald-600">{rate.toFixed(1)}%</span>
        </div>
        <input
          type="range" min={1} max={25} step={0.1} value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: '#059669' }}
        />
        <p className="text-xs text-slate-400 mt-1">{dict.rateHint}</p>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl px-5 py-4 mb-4 border border-sky-100">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-3xl font-extrabold text-sky-700 leading-none">€{Math.round(monthly).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{dict.monthlyLabel}</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-700 mt-1">€{Math.round(totalInterest).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{dict.totalInterestLabel}</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-700 mt-1">€{Math.round(totalPaid).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{dict.totalCostLabel}</p>
          </div>
        </div>
      </div>

      {/* Year-by-year table */}
      <button
        onClick={() => setShowTable((t) => !t)}
        className="w-full text-xs font-semibold text-slate-400 hover:text-sky-600 py-1.5 mb-2 transition-colors"
      >
        {showTable ? dict.tableHide : dict.tableShow} {showTable ? '▲' : '▼'}
      </button>
      {showTable && (
        <div className="mb-4 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 uppercase tracking-wide">
                <th className="text-left px-3 py-2 font-semibold">{dict.colYear}</th>
                <th className="text-right px-3 py-2 font-semibold">{dict.colInterest}</th>
                <th className="text-right px-3 py-2 font-semibold">{dict.colPrincipal}</th>
                <th className="text-right px-3 py-2 font-semibold">{dict.colBalance}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.year} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-slate-600 font-medium">{row.year}</td>
                  <td className="px-3 py-1.5 text-right text-red-500 font-medium">€{row.interest.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-right text-emerald-600 font-medium">€{row.principal.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-right text-slate-700">€{row.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link
        href={dict.ctaHref}
        className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl py-3.5 text-sm transition-colors shadow-lg shadow-sky-600/20"
      >
        {dict.ctaText} →
      </Link>
      <p className="text-xs text-slate-400 mt-2.5 text-center">{dict.disclaimer}</p>
    </div>
  );
}
