import Link from 'next/link';
import DeepContentBlock from '@/components/seo/DeepContentBlock';
import JsonLd from '@/components/seo/JsonLd';
import SetHtmlLang from '@/components/SetHtmlLang';
import { buildFaqJsonLd } from '@/lib/seo';
import type { DeepContent } from '@/lib/deep-content';

/**
 * ET/FI derin içerik sayfası gövdesi — içerik + CTA + JSON-LD.
 * Karşılaştırma araçları EN rotalarında yaşar; CTA oraya götürür.
 */
export default function LocalizedDeepPage({
  content,
  breadcrumb,
  compareCta,
  compareHref,
}: {
  content: DeepContent;
  breadcrumb: { name: string; item: string }[];
  compareCta: string;
  compareHref: string;
}) {
  const pageUrl = breadcrumb[breadcrumb.length - 1]?.item;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.item,
        })),
      },
      // EN ikizleriyle şema paritesi (audit) — oran bilinçli YOK, canlı kartlar gösterir
      {
        '@type': 'FinancialProduct',
        name: content.h1,
        description: content.metaDescription,
        url: pageUrl,
        provider: { '@type': 'Organization', name: 'NordicRate', url: 'https://nordicrate.com' },
        currency: 'EUR',
        inLanguage: content.locale,
      },
    ],
  };

  return (
    <>
      {content.locale !== 'en' && <SetHtmlLang lang={content.locale} />}
      <JsonLd data={jsonLd} />
      <JsonLd data={buildFaqJsonLd(content.faqs)} />
      <div className="bg-gradient-to-b from-sky-50 to-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-2">
          <Link
            href={compareHref}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-sky-600/20 mb-2"
          >
            {compareCta} →
          </Link>
        </div>
      </div>
      <div className="bg-white">
        <DeepContentBlock content={content} showH1 />
      </div>
    </>
  );
}
