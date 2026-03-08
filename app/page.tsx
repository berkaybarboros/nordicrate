import Link from 'next/link';
import { COUNTRIES, INSTITUTIONS, PRODUCTS } from '@/lib/data';
import { getCountryStats, getInstitution, getCountry, formatAmount, formatRate, LOAN_TYPE_LABELS, LOAN_TYPE_ICONS } from '@/lib/utils';
import RateCard from '@/components/RateCard';
import CountryCard from '@/components/CountryCard';

export default function HomePage() {
  // Stats
  const totalInstitutions = INSTITUTIONS.length;
  const totalProducts = PRODUCTS.length;
  const totalCountries = COUNTRIES.length;

  // Featured products (promoted, sorted by rate)
  const featuredProducts = PRODUCTS.filter((p) => p.isPromoted)
    .sort((a, b) => a.rateMin - b.rateMin)
    .slice(0, 6);

  // Country stats
  const countryStats = COUNTRIES.map((c) => ({
    country: c,
    ...getCountryStats(c.code),
  }));

  // Best rates by category
  const bestPersonal = [...PRODUCTS]
    .filter((p) => p.type === 'personal')
    .sort((a, b) => a.rateMin - b.rateMin)[0];
  const bestMortgage = [...PRODUCTS]
    .filter((p) => p.type === 'mortgage')
    .sort((a, b) => a.rateMin - b.rateMin)[0];
  const bestBusiness = [...PRODUCTS]
    .filter((p) => p.type === 'business')
    .sort((a, b) => a.rateMin - b.rateMin)[0];

  return (
    <div>
      {/* ========== HERO ========== */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-600/20 border border-sky-500/30 text-sky-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            Rates updated daily — {totalProducts} products from {totalInstitutions} institutions
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
            Compare Credit Rates
            <br />
            <span className="text-sky-400">Across 8 Countries</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Find the best personal loans, mortgages, and business credit from leading banks and insurers
            in Nordic & Baltic markets — all in one place.
          </p>

          {/* Country flags */}
          <div className="flex justify-center flex-wrap gap-3 mb-10">
            {COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/loans?country=${c.code}`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 transition-colors"
              >
                <span className="text-2xl">{c.flag}</span>
                <span className="text-sm font-medium">{c.name}</span>
              </Link>
            ))}
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/loans" className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              👤 Personal Loans
            </Link>
            <Link href="/mortgage" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              🏠 Mortgage Rates
            </Link>
            <Link href="/business" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              🏢 Business Loans
            </Link>
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: totalCountries, label: 'Countries', icon: '🌍' },
              { value: `${totalInstitutions}+`, label: 'Banks & Insurers', icon: '🏦' },
              { value: `${totalProducts}+`, label: 'Credit Products', icon: '📊' },
              { value: 'Daily', label: 'Rate Updates', icon: '🔄' },
            ].map(({ value, label, icon }) => (
              <div key={label}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-extrabold text-slate-900">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BEST RATES SNAPSHOT ========== */}
      <section className="py-10 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-5 text-center">
            Today&apos;s Best Market Rates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { product: bestPersonal, label: 'Best Personal Loan Rate', href: '/loans', color: 'sky' },
              { product: bestMortgage, label: 'Best Mortgage Rate', href: '/mortgage', color: 'emerald' },
              { product: bestBusiness, label: 'Best Business Rate', href: '/business', color: 'purple' },
            ].map(({ product, label, href, color }) => {
              if (!product) return null;
              const inst = getInstitution(product.institutionId);
              const country = inst ? getCountry(inst.country) : null;
              return (
                <Link key={label} href={href} className={`bg-white rounded-2xl border border-${color}-200 p-5 hover:shadow-md transition-shadow group`}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{label}</p>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className={`text-3xl font-extrabold text-${color}-600`}>
                        {formatRate(product.rateMin)}
                      </p>
                      <p className="text-sm text-slate-500">APR from</p>
                    </div>
                    {country && <span className="text-3xl">{country.flag}</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{inst?.shortName}</p>
                  <p className="text-xs text-slate-500">{product.name}</p>
                  <p className="text-xs text-sky-600 mt-2 group-hover:underline">Compare all →</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS ========== */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Offers</h2>
              <p className="text-slate-500 text-sm mt-1">Highlighted credit products from leading institutions</p>
            </div>
            <Link href="/loans" className="text-sky-600 hover:text-sky-800 font-medium text-sm">
              View all →
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
        </div>
      </section>

      {/* ========== COUNTRIES GRID ========== */}
      <section className="py-12 px-4 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Browse by Country</h2>
              <p className="text-slate-500 text-sm mt-1">Explore credit markets across 8 Nordic & Baltic countries</p>
            </div>
            <Link href="/countries" className="text-sky-600 hover:text-sky-800 font-medium text-sm">
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

      {/* ========== PRODUCT CATEGORIES ========== */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Browse by Loan Type</h2>
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
                <p className="text-sm font-semibold text-sky-600">{count} products →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-12 px-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">How NordicRate Works</h2>
          <p className="text-slate-500 mb-10">Finding the best credit rate across Nordic & Baltic markets has never been easier.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose Your Category', desc: 'Select personal loan, mortgage, auto, or business credit. Filter by country, institution type, or customer segment.', icon: '🔍' },
              { step: '2', title: 'Compare Rates', desc: 'View interest rates, loan limits, terms, and features side-by-side from banks and insurance companies.', icon: '📊' },
              { step: '3', title: 'Apply Directly', desc: 'Click through to the institution\'s website to apply directly. No intermediary, no hidden fees from us.', icon: '✅' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="relative">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-sky-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                  {step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DISCLAIMER ========== */}
      <section className="py-6 px-4 bg-amber-50 border-t border-amber-200">
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
