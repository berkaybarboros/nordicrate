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
  title: 'Partner with NordicRate — Qualified Borrower Leads in Nordic & Baltic Markets',
  description:
    'CPL partnerships for banks, brokers and fintechs. AI-qualified loan leads (income, DTI, country, amount) from expats, e-residents and locals across 8 Nordic & Baltic markets.',
  alternates: { canonical: 'https://nordicrate.com/partners' },
};

const VALUE_PROPS = [
  {
    Icon: UserCheck,
    title: 'AI-qualified, not just clicks',
    desc: 'Every lead passes our NordicAI eligibility check before reaching you: net income, debt-to-income ratio, residency status, requested amount and term. You receive applicants, not traffic.',
  },
  {
    Icon: Target,
    title: 'A niche you cannot reach with ads',
    desc: 'English-speaking expats, digital nomads and Estonian e-residents actively comparing credit. High intent, underserved by domestic marketing channels.',
  },
  {
    Icon: Globe2,
    title: '8 markets, one integration',
    desc: 'Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia and Lithuania — filter leads by country, product type and loan size.',
  },
  {
    Icon: LineChart,
    title: 'Backed by live market data',
    desc: 'Our platform runs on daily ECB EURIBOR and central bank feeds plus a bank-rate monitoring pipeline — borrowers arrive informed and decision-ready.',
  },
  {
    Icon: ShieldCheck,
    title: 'GDPR-clean consent chain',
    desc: 'Leads are collected with explicit consent and transparent data use. Full audit trail from first touch to handover.',
  },
  {
    Icon: Zap,
    title: 'Pay per lead — nothing upfront',
    desc: 'Pure CPL model: you define the qualification criteria, you pay only for leads that match them. Monthly invoicing, cancel anytime.',
  },
];

const STEPS = [
  { n: 1, title: 'Define your criteria', desc: 'Country, product type, loan amount range, minimum income — we configure qualification to your underwriting profile.' },
  { n: 2, title: 'Receive qualified leads', desc: 'Real-time delivery via email or webhook. Each lead includes the full eligibility snapshot our AI collected.' },
  { n: 3, title: 'Pay per result', desc: 'Monthly invoice for delivered leads only. Transparent reporting in a shared dashboard.' },
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
              For banks, brokers &amp; fintechs
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] mb-5">
              Qualified borrowers.
              <br />
              <span className="text-sky-400">Delivered, not promised.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              NordicRate compares {PRODUCTS.length}+ credit products from {INSTITUTIONS.length}+ institutions
              across {COUNTRIES.length} Nordic &amp; Baltic markets. Our AI assistant qualifies every borrower
              before they reach a lender — partner with us and receive only the leads that fit your criteria.
            </p>
            <a
              href="#contact"
              className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
            >
              Become a partner →
            </a>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">Why lenders work with us</h2>
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
            <h2 className="text-2xl font-extrabold text-slate-900">How the CPL partnership works</h2>
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
