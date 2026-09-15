/**
 * /partners — B2B landing (CPL lead partnership + rate report magnet)
 * Strateji: Estonya beachhead, CPL lead satışı ilk gelir hattı.
 * Tüm iddialar doğrulanabilir (UCPD) — uydurma müşteri/hacim sayısı YOK.
 */

import type { Metadata } from 'next';
import { UserCheck, Target, Globe2, LineChart, ShieldCheck, Zap } from 'lucide-react';
import { INSTITUTIONS, PRODUCTS, COUNTRIES } from '@/lib/data';
import PartnerLeadForm from '@/components/partners/PartnerLeadForm';
import RateReportSignup from '@/components/partners/RateReportSignup';

export const metadata: Metadata = {
  title: 'For Banks, Insurers & Comparison Partners | NordicRate',
  description:
    'Free listing, fast data corrections, rate feeds, referral and lead partnerships for banks, insurers and fintechs across 8 Nordic & Baltic markets.',
  alternates: { canonical: 'https://nordicrate.com/partners' },
};

// 2026-09-15: onceki metin henuz olmayan yetenekleri vaat ediyordu ("webhook ile
// gercek zamanli teslim", "paylasilan dashboard", "her lead AI ile nitelikli").
// Bankalarla ilk temasta bu sayfa aciliyor — erken asamayi saklamayan, ise
// baslamayi kolaylastiran bir metin daha cok kapi acar.
const VALUE_PROPS = [
  {
    Icon: ShieldCheck,
    title: 'Free listing, no contract',
    desc: 'Being listed and having your data corrected costs nothing. Commercial relationships never change the rates we show or the default ordering.',
  },
  {
    Icon: Zap,
    title: 'Corrections within 2 business days',
    desc: 'Send the page URL and your official source to info@nordicrate.com. Logo or listing removal on request within 5 business days.',
  },
  {
    Icon: LineChart,
    title: 'Rates checked daily, with a timestamp',
    desc: 'For selected banks we read the published rate from your own product page every day and show when it was checked, with a link back to you. Prefer to send a feed? Even better.',
  },
  {
    Icon: Target,
    title: 'An audience domestic ads miss',
    desc: 'English-speaking expats, e-residents and people moving to the region, comparing credit, deposits and insurance across borders.',
  },
  {
    Icon: UserCheck,
    title: 'Referral or leads — your choice',
    desc: 'Pay per click, application or approved contract through Awin, Adtraction or directly; or receive consented leads that match your criteria.',
  },
  {
    Icon: Globe2,
    title: 'Start small, leave anytime',
    desc: 'An email is enough to start under our Partner Terms. No exclusivity, 30 days notice to end. A signed agreement or network terms take precedence.',
  },
];

const STEPS = [
  { n: 1, title: 'Check your listing', desc: 'Look up your products on NordicRate. Anything wrong or missing? Tell us — it is fixed within 2 business days.' },
  { n: 2, title: 'Pick a model', desc: 'Free listing only, a rate feed, affiliate referral, or consented leads. We agree the details by email.' },
  { n: 3, title: 'Review together monthly', desc: 'Monthly summary of clicks, leads and conversions. Adjust or stop with 30 days notice.' },
];

export default function PartnersPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-sky-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              For banks, insurers, fintechs &amp; comparison partners
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] mb-5">
              Accurate listings.
              <br />
              <span className="text-sky-400">Easy to work with.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              NordicRate compares {PRODUCTS.length}+ financial products from {INSTITUTIONS.length}+ institutions
              across {COUNTRIES.length} Nordic &amp; Baltic markets. We are a young, independent service: we
              keep your data right, label what is indicative, and make cooperation simple — from a free
              listing to referral and lead partnerships.
            </p>
            <a
              href="#contact"
              className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
            >
              Become a partner →
            </a>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm">
              <a href="/listing-policy" className="text-slate-300 underline hover:text-white">Listing &amp; Data Policy</a>
              <a href="/partner-terms" className="text-slate-300 underline hover:text-white">Partner Terms</a>
              <a href="/corrections" className="text-slate-300 underline hover:text-white">Report a correction</a>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">How we work with institutions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUE_PROPS.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">How to start</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 relative">
                <div className="w-8 h-8 bg-sky-600 text-white rounded-full text-sm font-extrabold flex items-center justify-center mb-4">
                  {n}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate report magnet */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <RateReportSignup />
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="py-14 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Let&apos;s talk</h2>
            <p className="text-slate-500 text-sm mt-2">
              Tell us what you&apos;re looking for — we reply within one business day.
            </p>
          </div>
          <PartnerLeadForm />
        </div>
      </section>
    </div>
  );
}
