import type { Metadata } from "next";
import PersonalLoansContent from "./PersonalLoansContent";
import DeepContentBlock from "@/components/seo/DeepContentBlock";
import JsonLd from "@/components/seo/JsonLd";
import { buildFaqJsonLd, buildProductsItemList } from "@/lib/seo";
import { DEEP_CONTENT, DEEP_CONTENT_ROUTES } from "@/lib/deep-content";
import { PRODUCTS } from "@/lib/data";

const content = DEEP_CONTENT.personal.en;

// NOT: Meta'da sabit oran YOK (eski "from 9.9%" kaldırıldı — canlı veriyle
// çelişirse SERP snippet'i yanıltıcı olur). ItemList artık elle yazılmış
// (ve kırık) banka URL'leri yerine gerçek PRODUCTS verisinden üretiliyor.
export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  keywords: [
    "personal loan Estonia",
    "tarbimislaen",
    "consumer credit Estonia",
    "APR KKM Estonia",
    "krediidi kulukuse määr",
    "compare loans Estonia",
  ],
  alternates: {
    canonical: DEEP_CONTENT_ROUTES.personal.en,
    languages: {
      en: DEEP_CONTENT_ROUTES.personal.en,
      et: DEEP_CONTENT_ROUTES.personal.et,
      fi: DEEP_CONTENT_ROUTES.personal.fi,
      "x-default": DEEP_CONTENT_ROUTES.personal.en,
    },
  },
  openGraph: {
    title: content.metaTitle,
    description: content.metaDescription,
    url: DEEP_CONTENT_ROUTES.personal.en,
    type: "website",
  },
};

const estonianPersonal = PRODUCTS.filter((p) => {
  if (p.type !== "personal") return false;
  // Estonya kurumları -ee suffix'li
  return p.institutionId.endsWith("-ee");
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://nordicrate.com" },
        { "@type": "ListItem", position: 2, name: "Loans", item: "https://nordicrate.com/loans" },
        { "@type": "ListItem", position: 3, name: "Personal Loans", item: DEEP_CONTENT_ROUTES.personal.en },
      ],
    },
    {
      "@type": "FinancialProduct",
      name: "Personal Loans in Estonia",
      description: "Unsecured consumer loans from Estonian banks and licensed fintech lenders.",
      url: DEEP_CONTENT_ROUTES.personal.en,
      provider: { "@type": "Organization", name: "NordicRate" },
      currency: "EUR",
    },
  ],
};

export default function PersonalLoansPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd
        data={buildProductsItemList(estonianPersonal, "Personal Loans in Estonia", "/loans/personal")}
      />
      <JsonLd data={buildFaqJsonLd(content.faqs)} />
      {/* SERVER-rendered başlık: client bölge useSearchParams yüzünden Suspense
          içinde CSR — H1 orada kalırsa prerender HTML'inde H1 OLMAZ (SEO audit bulgusu) */}
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#2563eb] text-white pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span>Loans</span> <span className="mx-2">/</span>
            <span className="text-white">Personal Loans</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold">{content.h1}</h1>
        </div>
      </div>
      <PersonalLoansContent />
      <div className="bg-white border-t border-slate-100">
        <DeepContentBlock content={content} />
      </div>
    </>
  );
}
