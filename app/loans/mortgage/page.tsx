import type { Metadata } from "next";
import MortgageContent from "./MortgageContent";
import DeepContentBlock from "@/components/seo/DeepContentBlock";
import JsonLd from "@/components/seo/JsonLd";
import { buildFaqJsonLd } from "@/lib/seo";
import { DEEP_CONTENT, DEEP_CONTENT_ROUTES } from "@/lib/deep-content";

const content = DEEP_CONTENT.mortgage.en;

// NOT: Meta'da sabit oran YOK (eski "From 1.75%" kaldırıldı) — canlı scrape
// oranı meta'daki sabit rakamın altına düşerse SERP snippet'i yanıltıcı olur (UCPD).
export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  keywords: [
    "mortgage Estonia",
    "home loan Estonia",
    "kodulaen",
    "eluasemelaen",
    "Euribor mortgage Estonia",
    "Euribor 6 month margin",
    "LTV Estonia",
    "KredEx guarantee",
  ],
  alternates: {
    canonical: DEEP_CONTENT_ROUTES.mortgage.en,
    languages: {
      en: DEEP_CONTENT_ROUTES.mortgage.en,
      et: DEEP_CONTENT_ROUTES.mortgage.et,
      fi: DEEP_CONTENT_ROUTES.mortgage.fi,
      "x-default": DEEP_CONTENT_ROUTES.mortgage.en,
    },
  },
  openGraph: {
    title: content.metaTitle,
    description: content.metaDescription,
    url: DEEP_CONTENT_ROUTES.mortgage.en,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://nordicrate.com" },
        { "@type": "ListItem", position: 2, name: "Loans", item: "https://nordicrate.com/loans" },
        { "@type": "ListItem", position: 3, name: "Mortgages", item: DEEP_CONTENT_ROUTES.mortgage.en },
      ],
    },
    {
      "@type": "FinancialProduct",
      name: "Mortgage Loans in Estonia",
      description:
        "Home loans from Estonian banks. Euribor + margin pricing, up to 30 years, up to 85% LTV.",
      url: DEEP_CONTENT_ROUTES.mortgage.en,
      provider: { "@type": "Organization", name: "NordicRate" },
      // interestRate bilinçli olarak YOK — canlı oranlar sayfadaki kartlarda
      loanTerm: "P360M",
      currency: "EUR",
    },
  ],
};

export default function MortgagePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={buildFaqJsonLd(content.faqs)} />
      <MortgageContent />
      <div className="bg-white border-t border-slate-100">
        <DeepContentBlock content={content} />
      </div>
    </>
  );
}
