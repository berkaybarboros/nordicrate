import type { Metadata } from "next";
import { Suspense } from "react";
import BusinessLoansContent from "./BusinessLoansContent";
import DeepContentBlock from "@/components/seo/DeepContentBlock";
import JsonLd from "@/components/seo/JsonLd";
import { buildFaqJsonLd } from "@/lib/seo";
import { DEEP_CONTENT } from "@/lib/deep-content";

const deep = DEEP_CONTENT.business.en;

export const metadata: Metadata = {
  title: "Business Loans Estonia | SME Financing | NordicRate",
  description:
    "Business loan comparison for Estonian SMEs and entrepreneurs. Working capital, investment and startup financing coming soon. Compare personal loans in the meantime.",
  keywords: [
    "business loan Estonia",
    "SME financing Estonia",
    "ärilaen",
    "startup finance Estonia",
    "working capital loan Estonia",
  ],
  alternates: { canonical: "https://nordicrate.com/loans/business" },
  openGraph: {
    title: "Business Loans Estonia | SME Financing | NordicRate",
    description: "Business loan comparison for Estonian SMEs coming soon.",
    url: "https://nordicrate.com/loans/business",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nordicrate.com" },
    { "@type": "ListItem", position: 2, name: "Loans", item: "https://nordicrate.com/loans" },
    {
      "@type": "ListItem",
      position: 3,
      name: "Business Loans",
      item: "https://nordicrate.com/loans/business",
    },
  ],
};

export default function BusinessLoansPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <BusinessLoansContent />
      </Suspense>
      {/* 2026-09-06: sayfa yalnizca filtre + kart listesiydi (ince icerik).
          GSC'de 89 sayfa indeksli ama organik trafik yok — sorun indeksleme
          degil siralama. Semantik govde + FAQ + FAQPage JSON-LD eklendi. */}
      <DeepContentBlock content={deep} />
      <JsonLd data={buildFaqJsonLd(deep.faqs)} />
    </>
  );
}
