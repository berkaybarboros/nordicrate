import Link from 'next/link';
import type { Metadata } from 'next';
import { Calculator, BarChart3, CheckCircle2 } from 'lucide-react';
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
import HeroSearch from '@/components/HeroSearch';
import TrustBar from '@/components/TrustBar';
import EditorialPicks from '@/components/EditorialPicks';
import FaqSection from '@/components/FaqSection';

export default async function HomePage() {
  const totalInstitutions = INSTITUTIONS.length;
  const totalProducts = PRODUCTS.length;
  const totalCountries = COUNTRIES.length;

  // Canlı oran override'ları — "Today's Best Rates" gerçek scrape verisini yansıtsın
  const liveProducts = await applyScrapedOverrides(PRODUCTS);

  const featuredProducts = liveProducts.filter((p) => p.isPromoted)
    .sort((a, b) => a.rateMin - b.rateMin)
    .slice(0, 6);

  const countryStats = COUNTRIES.map((c) => ({
    country: c,
    ...getCountryStats(c.code),
  }));

  const bestPersonal = [...liveProducts].filter((p) => p.type === 'personal').sort((a, b) => a.rateMin - b.rateMin)[0];
  const bestMortgage = [...liveProducts].filter((p) => p.type === 'mortgage').sort((a, b) => a.rateMin - b.rateMin)[0];
  const bestBusiness = [...liveProducts].filter((p) => p.type === 'business').sort((a, b) => a.rateMin - b.rateMin)[0];

  return (
    <div>
      <JsonLd data={buildFaqJsonLd(FAQS)} />

      {/* ========== HERO — 2-column layout ========== */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {/* Subtle brand glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-sky-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] bg-sky-800/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left column — text */}
            <div>
              {/* Live data badge — gerçek iddia */}
              <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live EURIBOR &amp; central bank data
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.08] mb-5">
                One search.
                <br />
                Every Nordic &amp; Baltic
                <br />
                <span className="text-sky-400">loan rate.</span>
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
                Compare {totalProducts}+ products from {totalInstitutions}+ banks and insurers across{' '}
                {totalCountries} countries — free, independent, and with no impact on your credit score.
              </p>

              {/* Honest trust chips */}
              <div className="flex flex-wrap gap-2 mb-8">
                {['100% free', 'No credit check', 'Independent comparison', 'GDPR compliant'].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
                  >
                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {chip}
                  </span>
                ))}
              </div>

              {/* Hero Search */}
              <div className="mb-8">
                <HeroSearch />
              </div>

              {/* Micro stats */}
              <div className="flex flex-wrap gap-8 text-sm">
                {[
                  { value: `${totalCountries}`, label: 'Countries' },
                  { value: `${totalInstitutions}+`, label: 'Institutions' },
                  { value: `${totalProducts}+`, label: 'Products' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
                    <p className="text-xs text-slate-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — calculator */}
            <div className="lg:pl-4">
              <LoanCalculator />
            </div>
          </div>

          {/* Country flags row */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center mb-4 uppercase tracking-widest font-semibold">Compare rates in</p>
            <div className="flex flex-wrap justify-center gap-2">
              {COUNTRIES.map((c) => (
                <Link
                  key={c.code}
                  href={`/loans/${COUNTRY_SLUG_BY_CODE[c.code]}`}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-1.5 transition-colors text-sm"
                >
                  <CountryFlag code={c.code} size={24} rounded="sm" />
                  <span className="font-medium text-slate-200">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== TRUST BAR ========== */}
      <TrustBar />

      {/* ========== LIVE RATES BANNER ========== */}
      <LiveRatesBanner />

      {/* ========== TODAY'S BEST RATES ========== */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Today&apos;s Best Market Rates</h2>
            <p className="text-slate-500 text-sm mt-1">Live lowest APR from our database — updated daily</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tailwind v4 dinamik class üretmez — accent renkleri statik map'ten gelir */}
            {[
              {
                product: bestPersonal, label: 'Best Personal Loan', href: '/loans', icon: '👤',
                border: 'border-sky-100 hover:border-sky-300', text: 'text-sky-600',
              },
              {
                product: bestMortgage, label: 'Best Mortgage Rate', href: '/mortgage', icon: '🏠',
                border: 'border-emerald-100 hover:border-emerald-300', text: 'text-emerald-600',
              },
              {
                product: bestBusiness, label: 'Best Business Loan', href: '/business', icon: '🏢',
                border: 'border-purple-100 hover:border-purple-300', text: 'text-purple-600',
              },
            ].map(({ product, label, href, icon, border, text }) => {
              if (!product) return null;
              const inst = getInstitution(product.institutionId);
              const country = inst ? getCountry(inst.country) : null;
              return (
                <Link
                  key={label}
                  href={href}
                  className={`bg-white rounded-2xl border-2 ${border} p-5 hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${text}`}>
                      <span>{icon}</span>
                      <span>{label}</span>
                    </div>
                    {country && <CountryFlag code={country.code} size={32} rounded="sm" />}
                  </div>
                  <p className={`text-4xl font-extrabold ${text} mb-1`}>
                    {formatRate(product.rateMin)}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">APR from</p>
                  <p className="text-sm font-bold text-slate-800">{inst?.shortName}</p>
                  <p className="text-xs text-slate-500 mb-4">{product.name}</p>
                  <p className={`text-xs font-semibold ${text} group-hover:underline`}>
                    Compare all rates →
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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

      {/* ========== BROWSE BY TYPE ========== */}
      <section className="py-12 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Browse by Loan Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(
              [
                { type: 'personal', href: '/loans', count: PRODUCTS.filter(p => p.type === 'personal').length, desc: 'Unsecured personal finance' },
                { type: 'mortgage', href: '/mortgage', count: PRODUCTS.filter(p => p.type === 'mortgage').length, desc: 'Home & property loans' },
                { type: 'business', href: '/business', count: PRODUCTS.filter(p => p.type === 'business').length, desc: 'SME & corporate credit' },
                { type: 'auto', href: '/loans?type=auto', count: PRODUCTS.filter(p => p.type === 'auto').length, desc: 'Vehicle financing' },
              ] as const
            ).map(({ type, href, count, desc }) => (
              <Link
                key={type}
                href={href}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-sky-300 transition-all group"
              >
                <div className="text-3xl mb-3">{LOAN_TYPE_ICONS[type]}</div>
                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-sky-700 transition-colors">
                  {LOAN_TYPE_LABELS[type]}
                </h3>
                <p className="text-xs text-slate-500 mb-3">{desc}</p>
                <p className="text-sm font-bold text-sky-600">{count} products →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COUNTRIES ========== */}
      <section className="py-14 px-4 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Browse by Country</h2>
              <p className="text-slate-500 text-sm mt-1">Explore credit markets across 8 Nordic &amp; Baltic countries</p>
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
