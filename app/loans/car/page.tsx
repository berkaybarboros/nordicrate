import type { Metadata } from "next";
import CarLoansContent from "./CarLoansContent";
import DeepContentBlock from "@/components/seo/DeepContentBlock";
import JsonLd from "@/components/seo/JsonLd";
import { buildFaqJsonLd } from "@/lib/seo";
import { DEEP_CONTENT } from "@/lib/deep-content";

const deep = DEEP_CONTENT.car.en;

// NOT: Meta'da sabit oran YOK — "from 8.9%" yazıyordu, veride Swedbank 6.9% iken.
// Oranlar günlük canlı veriyle değişiyor; rakamı sayfa gövdesi damgasıyla gösterir.
export const metadata: Metadata = {
  title: "Car Loans Estonia | Compare New & Used Vehicle Finance",
  description:
    "Compare car loan offers in Estonia from LHV, Swedbank, SEB, Luminor, Inbank, Bigbank and Citadele. Rates read daily from bank websites; anything else is marked indicative.",
  keywords: [
    "car loan Estonia",
    "autolaen",
    "vehicle finance Estonia",
    "used car loan Estonia",
    "new car financing Estonia",
    "LHV autolaen",
    "Swedbank car loan",
  ],
  alternates: { canonical: "https://nordicrate.com/loans/car" },
  openGraph: {
    title: "Car Loans Estonia | NordicRate",
    description:
      "Compare car finance from Estonian banks — rates read daily from bank websites.",
    url: "https://nordicrate.com/loans/car",
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
        {
          "@type": "ListItem",
          position: 3,
          name: "Car Loans",
          item: "https://nordicrate.com/loans/car",
        },
      ],
    },
    {
      "@type": "FinancialProduct",
      name: "Car Loans in Estonia",
      description: "Vehicle finance from Estonian banks for new and used cars.",
      url: "https://nordicrate.com/loans/car",
      provider: { "@type": "Organization", name: "NordicRate" },
      interestRate: "8.9",
      loanTerm: "P48M",
      currency: "EUR",
      amount: { "@type": "MonetaryAmount", currency: "EUR", minValue: 3000, maxValue: 60000 },
    },
  ],
};

export default function CarLoanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CarLoansContent />
      {/* 2026-09-06: sayfa yalnizca filtre + kart listesiydi (ince icerik).
          GSC'de 89 sayfa indeksli ama organik trafik yok — sorun indeksleme
          degil siralama. Semantik govde + FAQ + FAQPage JSON-LD eklendi. */}
      <DeepContentBlock content={deep} />
      <JsonLd data={buildFaqJsonLd(deep.faqs)} />
    </>
  );
}
