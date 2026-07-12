/**
 * SEO-görünür lokalize homepage (FI/ET) — server component.
 * Bilinçli olarak yalnızca dil-bağımsız component'lar kullanılır (CountryFlag);
 * EN-hardcoded widget'lar (HeroSearch, LoanCalculator, TrustBar) dahil edilmez.
 * Tam site çevirisi ilerledikçe bu sayfalar zenginleşir.
 */

import Link from 'next/link';
import { Calculator, BarChart3, CheckCircle2 } from 'lucide-react';
import { COUNTRIES, INSTITUTIONS, PRODUCTS } from '@/lib/data';
import { getInstitution, getCountry, formatRate } from '@/lib/utils';
import CountryFlag from '@/components/CountryFlag';
import type { HomeDict } from '@/lib/home-i18n';

const STEP_ICONS = [Calculator, BarChart3, CheckCircle2];

export default function LocalizedHome({ dict }: { dict: HomeDict }) {
  const subtitle = dict.subtitle
    .replace('{products}', String(PRODUCTS.length))
    .replace('{institutions}', String(INSTITUTIONS.length))
    .replace('{countries}', String(COUNTRIES.length));

  const best = (type: 'personal' | 'mortgage' | 'business') =>
    [...PRODUCTS].filter((p) => p.type === type).sort((a, b) => a.rateMin - b.rateMin)[0];

  const bestCards = [
    { product: best('personal'), label: dict.bestPersonal, border: 'border-sky-100 hover:border-sky-300', text: 'text-sky-600' },
    { product: best('mortgage'), label: dict.bestMortgage, border: 'border-emerald-100 hover:border-emerald-300', text: 'text-emerald-600' },
    { product: best('business'), label: dict.bestBusiness, border: 'border-purple-100 hover:border-purple-300', text: 'text-purple-600' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-sky-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {dict.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.08] mb-5">
              {dict.h1Line1}
              <br />
              {dict.h1Line2}
              <br />
              <span className="text-sky-400">{dict.h1Accent}</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">{subtitle}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {dict.chips.map((chip) => (
                <span key={chip} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/loans" className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-7 py-3 rounded-xl transition-colors">
                {dict.ctaBrowse} →
              </Link>
              <Link href="/#calculator" className="bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold px-7 py-3 rounded-xl transition-colors">
                {dict.ctaCalculator}
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 text-sm">
              {[
                { value: `${COUNTRIES.length}`, label: dict.statCountries },
                { value: `${INSTITUTIONS.length}+`, label: dict.statInstitutions },
                { value: `${PRODUCTS.length}+`, label: dict.statProducts },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Best rates */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">{dict.bestRatesTitle}</h2>
            <p className="text-slate-500 text-sm mt-1">{dict.bestRatesSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bestCards.map(({ product, label, border, text }) => {
              if (!product) return null;
              const inst = getInstitution(product.institutionId);
              const country = inst ? getCountry(inst.country) : null;
              return (
                <Link key={label} href="/loans" className={`bg-white rounded-2xl border-2 ${border} p-5 hover:shadow-lg transition-all group`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wide ${text}`}>{label}</span>
                    {country && <CountryFlag code={country.code} size={32} rounded="sm" />}
                  </div>
                  <p className={`text-4xl font-extrabold ${text} mb-1`}>{formatRate(product.rateMin)}</p>
                  <p className="text-xs text-slate-500 mb-3">{dict.aprFrom}</p>
                  <p className="text-sm font-bold text-slate-800">{inst?.shortName}</p>
                  <p className={`text-xs font-semibold ${text} group-hover:underline mt-3`}>{dict.compareAll}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">{dict.howTitle}</h2>
            <p className="text-slate-500 mt-2 text-sm">{dict.howSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {dict.steps.map(({ title, desc }, i) => {
              const Icon = STEP_ICONS[i] ?? Calculator;
              return (
                <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 text-center relative overflow-hidden">
                  <div className="absolute top-3 right-3 w-7 h-7 bg-slate-100 text-slate-500 rounded-full text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">{dict.countriesTitle}</h2>
            <p className="text-slate-500 text-sm mt-1">{dict.countriesSubtitle}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/loans?country=${c.code}`}
                className="flex items-center gap-2 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl px-4 py-2.5 transition-colors text-sm font-medium text-slate-700"
              >
                <CountryFlag code={c.code} size={22} rounded="sm" />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-5 px-4 bg-amber-50 border-t border-amber-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-amber-800">{dict.disclaimer}</p>
        </div>
      </section>
    </div>
  );
}
