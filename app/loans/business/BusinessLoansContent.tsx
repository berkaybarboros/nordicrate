'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import SmartRateWidget from '@/components/SmartRateWidget';
import PersonalizedRecs from '@/components/PersonalizedRecs';
import type { RateEntry } from '@/components/SmartRateWidget';

const FEATURES = [
  'Working capital financing',
  'Equipment & investment loans',
  'Invoice factoring',
  'EU-backed SME programs',
  'Startup bridge financing',
];

export default function BusinessLoansContent() {
  const [liveEuribor, setLiveEuribor] = useState<number | null>(null);

  const handleRateChange = useCallback((rates: RateEntry[]) => {
    const e3m = rates.find(r => r.key === 'euribor3m');
    if (e3m) setLiveEuribor(e3m.rate);
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#0d9488] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span>Loans</span> <span className="mx-2">/</span>
            <span className="text-white">Business Loans</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Business Loans in Estonia</h1>
          <p className="text-white/80">Financing for SMEs, startups and entrepreneurs · Launching soon</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <SmartRateWidget onRateChange={handleRateChange} />
            <PersonalizedRecs
              productType="personal"
              liveEuribor={liveEuribor}
              className=""
            />
          </div>

          {/* Main content */}
          <div className="space-y-6">
            {/* Coming soon card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} className="text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-[#1a3c6e] mb-2">Business Loan Comparison Coming Soon</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                We are aggregating business loan offers from Estonian banks and fintechs. Sign up
                to be notified when we launch — including exclusive pre-negotiated rates for NordicRate users.
              </p>

              {/* Feature list */}
              <div className="grid sm:grid-cols-2 gap-2 text-left mb-6 max-w-sm mx-auto">
                {FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Link
                href="/loans/personal"
                className="inline-flex items-center gap-2 bg-[#f97316] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#ea6c0a] transition"
              >
                Compare Personal Loans <ArrowRight size={16} />
              </Link>
            </div>

            {/* Market context */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-teal-400" />
                <h3 className="font-bold text-sm">Current Business Lending Climate</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Estonian SME lending rates track EURIBOR closely. With the ECB cutting rates
                throughout 2024–2025, variable-rate business loans are becoming more attractive.
                Nordic lenders such as SEB, Swedbank and LHV are actively expanding SME lending
                in the Baltic markets.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Typical SME rate', value: '6–9%' },
                  { label: 'Max term', value: '10 years' },
                  { label: 'Min amount', value: '€5,000' },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-white/40 mb-1">{item.label}</p>
                    <p className="font-extrabold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interim alternatives */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-bold text-blue-900 text-sm mb-3">Available Now — Interim Alternatives</h3>
              <div className="space-y-2">
                {[
                  { label: 'Personal loans up to €50,000', href: '/loans/personal', note: 'Can be used for small business needs' },
                  { label: 'EU & government programs', href: '/programs', note: 'KredEx, Enterprise Estonia, EIF-backed' },
                  { label: 'Mortgage-backed financing', href: '/loans/mortgage', note: 'For property-secured business credit' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3 hover:shadow-sm transition group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1a3c6e] group-hover:text-blue-600 transition">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.note}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-400 transition" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
