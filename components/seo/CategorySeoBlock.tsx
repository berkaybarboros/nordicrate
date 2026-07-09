/**
 * Insurance alt kategori sayfaları için SEO içerik bloğu (server component).
 * lib/seo-content.ts'ten intro + FAQ render eder ve FAQPage JSON-LD basar.
 */

import { INSURANCE_CONTENT } from '@/lib/seo-content';
import { buildFaqJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export default function CategorySeoBlock({ slug }: { slug: string }) {
  const content = INSURANCE_CONTENT[slug];
  if (!content) return null;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={buildFaqJsonLd(content.faqs)} />

      <h2 className="text-2xl font-extrabold text-slate-900 mb-5">{content.title}</h2>
      <div className="space-y-4 mb-10">
        {content.intro.map((p, i) => (
          <p key={i} className="text-slate-600 leading-relaxed text-[15px]">{p}</p>
        ))}
      </div>

      <h3 className="text-lg font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h3>
      <div className="space-y-2">
        {content.faqs.map((f, i) => (
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
  );
}
