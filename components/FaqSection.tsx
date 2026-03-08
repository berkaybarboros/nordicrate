'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Is NordicRate free to use?',
    a: 'Yes — 100% free, always. We earn a small referral fee from banks when you apply through our platform. This never affects the rates shown to you; we display all products objectively.',
  },
  {
    q: 'What is APR and why does it matter?',
    a: 'APR (Annual Percentage Rate) is the total yearly cost of a loan including interest and any mandatory fees, expressed as a percentage. It is the fairest way to compare loans across different banks and countries.',
  },
  {
    q: 'Will comparing loans affect my credit score?',
    a: 'No. Browsing and comparing rates on NordicRate uses soft enquiries only — these are invisible to lenders and do not affect your credit score. Only a formal application to a bank triggers a hard credit check.',
  },
  {
    q: 'Can I apply for a loan in a country I do not live in?',
    a: 'Eligibility rules vary by country and bank. In general you must be a tax resident to apply for a loan, though some Nordic fintech banks (Revolut, Wise, Inbank) and e-Residency programs allow broader access. We recommend checking each institution\'s eligibility criteria.',
  },
  {
    q: 'What is Estonia\'s e-Residency and why is it relevant?',
    a: 'Estonia\'s e-Residency is a digital identity that lets anyone worldwide register an EU company and open a business bank account remotely. It is ideal for digital nomads and entrepreneurs who want an EU legal presence without physical relocation.',
  },
  {
    q: 'How are the interest rates calculated?',
    a: 'Rates are sourced directly from bank websites and updated daily. The displayed rate is the minimum advertised rate (best-case APR). Your actual rate depends on your credit history, income, and the specific loan amount and term you choose.',
  },
  {
    q: 'How do I apply for a loan?',
    a: 'Click "Apply Now" on any product card. You will be taken directly to the bank\'s official website where you can complete the full application. NordicRate is a comparison platform — we do not process applications ourselves.',
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-14 px-4 bg-white border-t border-slate-200">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-500 mt-2 text-sm">Everything you need to know about comparing credit rates</p>
        </div>

        <div className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all ${
                open === i ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className={`font-semibold text-sm ${open === i ? 'text-sky-900' : 'text-slate-800'}`}>
                  {q}
                </span>
                <span className={`ml-4 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  open === i ? 'bg-sky-600 text-white rotate-45' : 'bg-slate-200 text-slate-600'
                }`}>
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Still have questions?{' '}
          <a href="mailto:hello@nordicrate.eu" className="text-sky-600 hover:underline">
            Contact us at hello@nordicrate.eu
          </a>
        </p>
      </div>
    </section>
  );
}
