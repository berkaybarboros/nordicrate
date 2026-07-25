import Breadcrumbs from '@/components/seo/Breadcrumbs';
import DeepContentBlock from '@/components/seo/DeepContentBlock';
import JsonLd from '@/components/seo/JsonLd';
import SetHtmlLang from '@/components/SetHtmlLang';
import LoanCalcTool from '@/components/calculators/LoanCalcTool';
import { buildFaqJsonLd } from '@/lib/seo';
import type { CalculatorPage } from '@/lib/calculator-content';

/** Hesaplayıcı sayfalarının ortak gövdesi — 3 dil aynı yapıyı paylaşır. */
export default function CalculatorPageBody({
  page,
  breadcrumb,
}: {
  page: CalculatorPage;
  breadcrumb: { name: string; href?: string }[];
}) {
  return (
    <div className="bg-gradient-to-b from-sky-50 via-white to-white min-h-screen">
      {page.locale !== 'en' && <SetHtmlLang lang={page.locale} />}
      <JsonLd data={buildFaqJsonLd(page.content.faqs)} />

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Breadcrumbs items={breadcrumb} />
        <div className="mt-5 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">{page.h1}</h1>
          <p className="text-slate-600 leading-relaxed">{page.lead}</p>
        </div>

        {/* Araç fold üstünde — SERP kazananlarının ortak formülü */}
        <LoanCalcTool dict={page.dict} />
      </div>

      <div className="bg-white mt-10 border-t border-slate-100">
        <DeepContentBlock content={page.content} />
      </div>
    </div>
  );
}
