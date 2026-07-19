import Link from 'next/link';
import type { Metadata } from 'next';
import { Calculator, BarChart3, CheckCircle2, Check } from 'lucide-react';
import { COUNTRIES, INSTITUTIONS, PRODUCTS } from '@/lib/data';
import { FAQS } from '@/lib/faq-data';
import { COUNTRY_SLUG_BY_CODE } from '@/lib/country-content';
import { applyScrapedOverrides } from '@/lib/scraped-overrides';

export const revalidate = 1800;
import { buildFaqJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

// Homepage canonical + hreflang (FI/ET lokalize versiyonlar)
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://nordicrate.com',
    languages: {
      'en': 'https://nordicrate.com',
      'fi': 'https://nordicrate.com/fi',
      'et': 'https://nordicrate.com/et',
      'x-default': 'https://nordicrate.com',
    },
  },
};
import { PROGRAMS } from '@/lib/programs-data';
import { getCountryStats, getInstitution, getCountry, formatRate, LOAN_TYPE_LABELS, LOAN_TYPE_ICONS } from '@/lib/utils';
import RateCard from '@/components/RateCard';
import CountryCard from '@/components/CountryCard';
import CountryFlag from '@/components/CountryFlag';
import LiveRatesBanner from '@/components/LiveRatesBanner';
import LoanCalculator from '@/components/LoanCalculator';
import HeroCta from '@/components/home/HeroCta';
import InstitutionMarquee from '@/components/home/InstitutionMarquee';
import EditorialPicks from '@/components/EditorialPicks';
import FaqSection from '@/components/FaqSection';

export default async function HomePage() {
  const totalInstitutions = INSTITUTIONS.length;
  const totalProducts = PRODUCTS.length;
  const totalCountries = COUNTRIES.length;

  // Canlı oran override'ları — tip kartları gerçek scrape verisini yansıtsın
  const liveProducts = await applyScrapedOverrides(PRODUCTS);

  const featuredProducts = liveProducts.filter((p) => p.isPromoted)
    .sort((a, b) => a.rateMin - b.rateMin)
    .slice(0, 6);

  const countryStats = COUNTRIES.map((c) => ({
    country: c,
    ...getCountryStats(c.code),
  }));

  // Ürün tipi başına en iyi oran — Altero pattern: tile'da gerçek "from X%" göster
  const typeStats = (
    [
      { type: 'personal', href: '/loans', desc: 'Unsecured personal finance' },
      { type: 'mortgage', href: '/mortgage', desc: 'Home & property loans' },
      { type: 'auto', href: '/loans?type=auto', desc: 'Vehicle financing' },
      { type: 'business', href: '/business', desc: 'SME & corporate credit' },
    ] as const
  ).map(({ type, href, desc }) => {
    const prods = liveProducts.filter((p) => p.type === type);
    const best = [...prods].sort((a, b) => a.rateMin - b.rateMin)[0];
    const inst = best ? getInstitution(best.institutionId) : null;
    return { type, href, desc, count: prods.length, best, inst };
  });

  return (
    <div>
      <JsonLd data={buildFaqJsonLd(FAQS)} />

      {/* ========== HERO — açık tema, form-first (Lendo/Altero pattern) ========== */}
      <section className="relative bg-gradient-to-b from-sky-50 via-white to-white border-b border-slate-100 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-0 lg:min-h-[calc(100dvh-4rem)] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full py-2">

            {/* Left — kısa mesaj + somut değer maddeleri + tek CTA */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 bg-white border border-sky-200 text-sky-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live EURIBOR &amp; central bank data
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.08] text-slate-900 mb-5">
                Find your best loan.
                <br />
                <span className="text-sky-600">Compare. Apply. Save.</span>
              </h1>

              {/* Lendo tarzı somut bullet'lar — pazarlama paragrafı yerine */}
              <ul className="space-y-3 mb-7">
                {[
                  `${totalProducts}+ offers from ${totalInstitutions}+ banks in one view`,
                  `${totalCountries} Nordic & Baltic countries covered`,
                  'Free & independent — no credit check, no sign-up',
                  'Live EURIBOR & bank-verified rates, updated daily',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-slate-700">
                    <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-[15px] font-medium leading-snug">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-4">
                <HeroCta />
                <Link href="/loans" className="text-sm font-bold text-slate-600 hover:text-sky-700 transition-colors">
                  Browse all loans →
                </Link>
              </div>
            </div>

            {/* Right — hesaplayıcı ana aktör (kendi kart stili var) */}
            <div className="lg:col-span-7">
              <LoanCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* ========== ÜRÜN TİPİ KARTLARI — gerçek "from X%" oranlarıyla ========== */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">What do you need financing for?</h2>
              <p className="text-slate-500 text-sm mt-1">Lowest APR in our database right now — per loan type</p>
            </div>
            <Link href="/loans" className="text-sky-600 hover:text-sky-800 font-semibold text-sm hidden sm:block">
              View all {totalProducts} products →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {typeStats.map(({ type, href, desc, count, best, inst }) => (
              <Link
                key={type}
                href={href}
                className="bg-white rounded-2xl border-2 border-slate-100 hover:border-sky-300 hover:shadow-lg p-5 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{LOAN_TYPE_ICONS[type]}</span>
                  {best?.isLiveRate && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                      Live rate
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {LOAN_TYPE_LABELS[type]}
                </h3>
                <p className="text-xs text-slate-500 mb-3">{desc}</p>
                {best && (
                  <>
                    <p className="text-3xl font-extrabold text-sky-600 leading-none">
                      {formatRate(best.rateMin)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-3">
                      APR from · {inst?.shortName}
                    </p>
                  </>
                )}
                <p className="text-sm font-bold text-sky-600 group-hover:underline">
                  Compare {count} offers →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== LIVE RATES BANNER ========== */}
      <LiveRatesBanner />

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-12 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">How NordicRate Works</h2>
            <p className="text-slate-500 mt-2 text-sm">Find your best loan rate in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: 1, Icon: Calculator, title: 'Calculate', desc: 'Enter your loan amount and term in our free calculator to see estimated monthly payments instantly.' },
              { step: 2, Icon: BarChart3, title: 'Compare', desc: 'Browse and filter 100+ loan products from 50+ banks, sorted by lowest APR, highest limit, or most recent.' },
              { step: 3, Icon: CheckCircle2, title: 'Apply', desc: 'Click directly through to your chosen bank. No middleman, no hidden fees — we are 100% free to use.' },
            ].map(({ step, Icon, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-slate-200 p-6 text-center relative overflow-hidden">
                <div className="absolute top-3 right-3 w-7 h-7 bg-slate-100 text-slate-500 rounded-full text-sm font-bold flex items-center justify-center">
                  {step}
                </div>
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} strokeWidth={1.8} />
                </div>
                <h3 className="font-extrabold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== KURUM LOGO MARQUEE ========== */}
      <InstitutionMarquee />

      {/* ========== EDITORIAL PICKS ========== */}
      <EditorialPicks />

      {/* ========== FEATURED OFFERS ========== */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">Featured</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Top Credit Products</h2>
              <p className="text-slate-500 text-sm mt-1">Handpicked offers from leading Nordic &amp; Baltic institutions</p>
            </div>
            <Link href="/loans" className="text-sky-600 hover:text-sky-800 font-semibold text-sm hidden sm:block">
              View all {PRODUCTS.length} products →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const inst = getInstitution(product.institutionId);
              const country = inst ? getCountry(inst.country) : null;
              if (!inst || !country) return null;
              return (
                <RateCard key={product.id} product={product} institution={inst} country={country} />
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/loans" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg">
              Browse All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ========== COUNTRIES ========== */}
      <section className="py-14 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Browse by Country</h2>
              <p className="text-slate-500 text-sm mt-1">Explore credit markets across 8 Nordic &amp; Baltic countries</p>
              {/* Ülke landing sayfalarına iç linkler (SEO değeri korunur) */}
              <div className="flex flex-wrap gap-2 mt-3">
                {COUNTRIES.map((c) => (
                  <Link
                    key={c.code}
                    href={`/loans/${COUNTRY_SLUG_BY_CODE[c.code]}`}
                    className="flex items-center gap-1.5 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg px-2.5 py-1 transition-colors text-xs font-medium text-slate-600"
                  >
                    <CountryFlag code={c.code} size={16} rounded="sm" />
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/countries" className="text-sky-600 hover:text-sky-800 font-semibold text-sm hidden sm:block">
              All countries →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {countryStats.map(({ country, institutions, products: prods, avgPersonalRate, avgMortgageRate, avgBusinessRate }) => (
              <CountryCard
                key={country.code}
                country={country}
                institutionCount={institutions}
                productCount={prods}
                avgPersonalRate={avgPersonalRate}
                avgMortgageRate={avgMortgageRate}
                avgBusinessRate={avgBusinessRate}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========== PROGRAMS TEASER ========== */}
      <section className="py-14 px-4 bg-gradient-to-br from-slate-950 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">For Nomads &amp; Founders</span>
              <h2 className="text-2xl font-extrabold mt-1">Entrepreneur &amp; Digital Nomad Hub</h2>
              <p className="text-slate-400 text-sm mt-1">Government loans, digital nomad visas, e-Residency, and EU funding programs</p>
            </div>
            <Link href="/programs" className="text-sky-400 hover:text-sky-300 font-semibold text-sm hidden sm:block">
              All {PROGRAMS.length} programs →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🌐', title: 'Digital Nomad Visas', desc: 'Estonia, Latvia, Lithuania & Iceland — stay up to 1 year and work remotely in the EU', href: '/programs?tab=digital_nomad', color: 'from-sky-900/80 to-sky-800/80 border-sky-700/50' },
              { icon: '🪪', title: 'e-Residency', desc: 'Register an EU company online. 100K+ e-residents from 170+ countries already use it', href: '/programs?tab=e_residency', color: 'from-cyan-900/80 to-cyan-800/80 border-cyan-700/50' },
              { icon: '🏦', title: 'Government Loans', desc: 'State-backed startup and SME loans from Finnvera, Innovasjon Norge, Almi and more', href: '/programs?tab=government', color: 'from-purple-900/80 to-purple-800/80 border-purple-700/50' },
              { icon: '🇪🇺', title: 'EU Funds', desc: 'EIB, EIF, Horizon Europe — access billions in EU financing across all 8 countries', href: '/programs?tab=eu', color: 'from-yellow-900/80 to-yellow-800/80 border-yellow-700/50' },
            ].map(({ icon, title, desc, href, color }) => (
              <Link
                key={title}
                href={href}
                className={`bg-gradient-to-br ${color} border rounded-2xl p-5 hover:opacity-90 transition-all hover:scale-[1.02] group`}
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-white mb-2 text-sm group-hover:text-sky-300 transition-colors">{title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <FaqSection />

      {/* ========== DISCLAIMER ========== */}
      <section className="py-5 px-4 bg-amber-50 border-t border-amber-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-amber-800">
            ⚠️ <strong>Disclaimer:</strong> Rates shown are indicative and for comparison purposes only.
            Actual rates depend on individual creditworthiness, loan amount, and term.
            Always verify current rates directly with the financial institution before applying.
            NordicRate is not a financial advisor.
          </p>
        </div>
      </section>

    </div>
  );
}
