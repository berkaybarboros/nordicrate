import Link from 'next/link';
import type { DeepContent } from '@/lib/deep-content';

/**
 * Derin SEO içerik bloğu — server component.
 * Body paragraflarındaki [metin](/route) inline linklerini Next <Link>'e çevirir.
 * FAQ'lar görsel olarak burada; FAQPage JSON-LD'yi sayfa buildFaqJsonLd ile ekler.
 */

function InlineLinks({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (m) {
          return (
            <Link key={i} href={m[2]} className="text-sky-700 font-semibold underline decoration-sky-300 underline-offset-2 hover:decoration-sky-600">
              {m[1]}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function DeepContentBlock({ content, showH1 = false }: { content: DeepContent; showH1?: boolean }) {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      {showH1 ? (
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">{content.h1}</h1>
      ) : (
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">{content.h1}</h2>
      )}

      {/* Featured-snippet cevabı */}
      <p className="text-lg text-slate-700 leading-relaxed border-l-4 border-sky-500 bg-sky-50 rounded-r-xl px-4 py-3 mb-10">
        {content.intro}
      </p>

      {content.sections.map((s) => (
        <div key={s.h2} className="mb-9">
          {/* İçerik H1'in altında yaşıyorsa bölümler h2/h3 hiyerarşisini korur */}
          {showH1 ? (
            <h2 className="text-xl font-extrabold text-slate-900 mb-3">{s.h2}</h2>
          ) : (
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">{s.h2}</h3>
          )}
          {s.body.map((p, i) => (
            <p key={i} className="text-[15px] text-slate-600 leading-relaxed mb-3">
              <InlineLinks text={p} />
            </p>
          ))}
        </div>
      ))}

      {/* FAQ — görünür bölüm (JSON-LD sayfa seviyesinde eklenir) */}
      <div className="mt-12">
        <h2 className="text-xl font-extrabold text-slate-900 mb-5">
          {content.locale === 'et' ? 'Korduma kippuvad küsimused' : content.locale === 'fi' ? 'Usein kysytyt kysymykset' : 'Frequently asked questions'}
        </h2>
        <div className="space-y-3">
          {content.faqs.map((f) => (
            <details key={f.q} className="group bg-white border border-slate-200 rounded-xl px-4 py-3">
              <summary className="font-semibold text-slate-800 text-sm cursor-pointer list-none flex justify-between items-center gap-3">
                {f.q}
                <span className="text-slate-400 group-open:rotate-45 transition-transform text-lg leading-none shrink-0">+</span>
              </summary>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* İç link ağı */}
      <div className="mt-10 flex flex-wrap gap-2">
        {content.related.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-full px-3.5 py-1.5 transition-colors"
          >
            {r.label} →
          </Link>
        ))}
      </div>
    </section>
  );
}
