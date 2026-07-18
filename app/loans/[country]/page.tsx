/**
 * /loans/[country] — ülke bazlı SEO landing (task #13).
 * 8 statik slug (estonia…iceland); dynamicParams kapalı → bilinmeyen slug 404.
 * Not: /loans/personal|car|mortgage|business statik segmentleri önceliklidir,
 * bu route yalnızca ülke sluglarını yakalar.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COUNTRIES, INSTITUTIONS, PRODUCTS } from '@/lib/data';
import { getInstitution, getCountry, formatRate } from '@/lib/utils';
import { COUNTRY_LANDINGS, getCountryLanding } from '@/lib/country-content';
import { buildProductsItemList, buildFaqJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import CountryFlag from '@/components/CountryFlag';
import RateCard from '@/components/RateCard';
import { applyScrapedOverrides } from '@/lib/scraped-overrides';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const dynamicParams = false;
export const revalidate = 1800; // canlı oran override'ları taze kalsın

export function generateStaticParams() {
  return COUNTRY_LANDINGS.map((c) => ({ country: c.slug }));
}

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const landing = getCountryLanding(country);
  if (!landing) return {};
  const info = getCountry(landing.code);
  return {
    title: `Loans in ${info?.name} — Compare Bank Rates & Requirements`,
    description: `Compare personal loans, mortgages and business credit in ${info?.name}: current bank offers, ${info?.inEurozone ? 'EURIBOR-based pricing' : `${info?.currency} rates`}, and requirements for residents and expats.`,
    alternates: { canonical: `https://nordicrate.com/loans/${landing.slug}` },
  };
}

export default async function CountryLoansPage({ params }: PageProps) {
  const { country } = await params;
  const landing = getCountryLanding(country);
  if (!landing) notFound();

  const info = getCountry(landing.code);
  if (!info) notFound();

  const institutions = INSTITUTIONS.filter((i) => i.country === landing.code);
  const products = (await applyScrapedOverrides(
    PRODUCTS.filter((p) => institutions.some((i) => i.id === p.institutionId))
  )).sort((a, b) => a.rateMin - b.rateMin);

  const bestPersonal = products.find((p) => p.type === 'personal');
  const bestMortgage = products.find((p) => p.type === 'mortgage');

  return (
    <div>
      <JsonLd data={buildProductsItemList(products, `Loans in ${info.name}`, `/loans/${landing.slug}`)} />
      <JsonLd data={buildFaqJsonLd(landing.faqs)} />

      {/* Hero */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="mb-5 [&_a]:text-slate-500 [&_a:hover]:text-sky-300 [&_span.text-slate-600]:text-slate-300">
            <Breadcrumbs items={[
              { name: 'Home', href: '/' },
              { name: 'Loans', href: '/loans' },
              { name: info.name },
            ]} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <CountryFlag code={info.code} size={40} rounded="md" />
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-300">
              {info.region === 'nordic' ? 'Nordic' : 'Baltic'} · {info.currency}
              {info.inEurozone ? ' · Eurozone' : ''}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
            Loans in {info.name}: compare current bank rates
          </h1>
          <div className="flex flex-wrap gap-6 text-sm mt-6">
            {[
              { value: `${institutions.length}`, label: 'institutions' },
              { value: `${products.length}`, label: 'products' },
              ...(bestPersonal ? [{ value: formatRate(bestPersonal.rateMin), label: 'personal from' }] : []),
              ...(bestMortgage ? [{ value: formatRate(bestMortgage.rateMin), label: 'mortgage from' }] : []),
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-sky-400 leading-none">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-4">
          {landing.intro.map((p, i) => (
            <p key={i} className="text-slate-600 leading-relaxed text-[15px]">{p}</p>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
          Current offers in {info.name}
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-slate-500">No products listed yet for this market.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 12).map((product) => {
              const inst = getInstitution(product.institutionId);
              const c = inst ? getCountry(inst.country) : null;
              if (!inst || !c) return null;
              return <RateCard key={product.id} product={product} institution={inst} country={c} />;
            })}
          </div>
        )}
        {products.length > 12 && (
          <div className="text-center mt-8">
            <Link
              href={`/loans?country=${info.code}`}
              className="inline-block bg-slate-900 hover:bg-slate-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              See all {products.length} products →
            </Link>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">
          Borrowing in {info.name} — FAQ
        </h2>
        <div className="space-y-2">
          {landing.faqs.map((f, i) => (
            <details
              key={i}
              className="group bg-white rounded-xl border border-slate-200 open:border-sky-300 open:bg-sky-50/50 transition-colors"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none text-sm font-semibold text-slate-800">
                {f.q}
                <span className="ml-4 shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 group-open:bg-sky-600 group-open:text-white group-open:rotate-45 flex items-center justify-center text-xs font-bold transition-all">
                  +
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Other countries — iç linkleme */}
      <section className="bg-slate-50 border-t border-slate-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Compare loans in other markets
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNTRY_LANDINGS.filter((c) => c.slug !== landing.slug).map((c) => {
              const ci = COUNTRIES.find((x) => x.code === c.code);
              if (!ci) return null;
              return (
                <Link
                  key={c.slug}
                  href={`/loans/${c.slug}`}
                  className="flex items-center gap-2 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl px-4 py-2 transition-colors text-sm font-medium text-slate-700"
                >
                  <CountryFlag code={ci.code} size={18} rounded="sm" />
                  {ci.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
