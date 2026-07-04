'use client';

import { useState } from 'react';
import { FAQS } from '@/lib/faq-data';

// FAQ verisi lib/faq-data.ts'te — JSON-LD ile paylaşılıyor

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
