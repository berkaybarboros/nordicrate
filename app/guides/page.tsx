import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { GUIDES } from '@/lib/guides-content';

export const metadata: Metadata = {
  title: 'Borrowing Guides & Glossary | EURIBOR, APR, LTV Explained',
  description:
    'Plain-language guides to the concepts behind Nordic & Baltic loans: Euribor, APR/KKM, LTV, the KredEx guarantee, DSTI affordability rules and your 14-day withdrawal right.',
  alternates: { canonical: 'https://nordicrate.com/guides' },
  openGraph: {
    title: 'Borrowing Guides & Glossary | NordicRate',
    description:
      'Euribor, APR/KKM, LTV, KredEx, DSTI and consumer rights — the concepts behind every loan decision, explained without jargon.',
    url: 'https://nordicrate.com/guides',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'NordicRate Borrowing Glossary',
  url: 'https://nordicrate.com/guides',
  hasDefinedTerm: GUIDES.map((g) => ({
    '@type': 'DefinedTerm',
    name: g.cardLabel,
    description: g.definition,
    url: `https://nordicrate.com/guides/${g.slug}`,
  })),
};

export default function GuidesHubPage() {
  return (
    <div className="bg-white min-h-screen">
      <JsonLd data={jsonLd} />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Guides' }]} />

        <div className="mt-6 mb-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            Borrowing guides &amp; glossary
          </h1>
          <p className="text-slate-600 leading-relaxed">
            The concepts every loan page refers to — Euribor, APR, LTV, state guarantees,
            affordability rules and your consumer rights — explained in plain language,
            without jargon and without sales pitch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="bg-white rounded-2xl border-2 border-slate-100 hover:border-sky-300 hover:shadow-lg p-5 transition-all group flex flex-col"
            >
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-sky-600 mb-2">
                {g.cardLabel}
              </span>
              <h2 className="font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors mb-2 leading-snug">
                {g.h1}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">{g.definition}</p>
              <span className="text-sm font-bold text-sky-600 mt-3 group-hover:underline">
                Read the guide →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-slate-900">Ready to put it into practice?</p>
            <p className="text-sm text-slate-500 mt-1">
              Compare live loan offers from 50+ Nordic &amp; Baltic banks — free, no credit check.
            </p>
          </div>
          <Link
            href="/loans"
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            Compare loans →
          </Link>
        </div>
      </div>
    </div>
  );
}
