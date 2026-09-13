import type { Metadata } from "next";
import DepositsContent from "./DepositsContent";
import DeepContentBlock from "@/components/seo/DeepContentBlock";
import JsonLd from "@/components/seo/JsonLd";
import { buildFaqJsonLd } from "@/lib/seo";
import { DEEP_CONTENT } from "@/lib/deep-content";

const deep = DEEP_CONTENT.deposits.en;

export const metadata: Metadata = {
  // SERP tur 2 (2026-08-05): sorgu dili "deposit rates estonia" — "Time Deposits"
  // bankspeak'ti, sorguyla birebir hizalandı
  // 2026-09-13: Basliktaki "up to 4.3%" KALDIRILDI. Dogrulama sonucu statik veri
  // gercegin ~2 kati cikti: LHV gercek 1.00-2.20% (bizde 4.1), Coop max 2.5%
  // (bizde 4.0), SEB 1.65% (bizde 3.9). ECB resmi Estonya mevduat faizi
  // 2026-07 itibariyla %2.18. SERP snippet'inde tutmayan bir oran vaat etmek
  // hem UCPD riski hem de karsilastirma sitesi icin en agir guven kaybi.
  title: "Deposit Rates Estonia — Compare Fixed-Term Savings",
  description:
    "Compare term deposit rates in Estonia from Bigbank, LHV, Swedbank, SEB and Coop Pank. DGSD-protected up to €100,000. Terms from 1 to 60 months.",
  keywords: [
    "deposit rates Estonia",
    "term deposit Estonia",
    "tähtajaline hoius",
    "savings account Estonia",
    "best deposit rates Estonia",
    "Bigbank deposit",
    "LHV hoius",
    "Swedbank deposit Estonia",
    "fixed deposit Estonia",
  ],
  alternates: { canonical: "https://nordicrate.com/deposits" },
  openGraph: {
    title: "Deposit Rates Estonia | NordicRate",
    description:
      "Compare term deposits from Bigbank, LHV, Swedbank, SEB, Coop. DGSD-protected up to €100,000.",
    url: "https://nordicrate.com/deposits",
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Deposits",
          item: "https://nordicrate.com/deposits",
        },
      ],
    },
    {
      "@type": "ItemList",
      name: "Term Deposits in Estonia",
      // "Updated daily" iddiasi da kaldirildi: mevduat oranlari scraper kapsaminda
      // DEGIL, veri statik. Guncellenmeyen bir veri icin gunluk tazelik vaat etmek
      // structured data araciligiyla Google'a yanlis sinyal gonderiyordu.
      description: "Fixed-term deposit offers from Estonian banks.",
      url: "https://nordicrate.com/deposits",
      numberOfItems: 5,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Bigbank Term Deposit",
          url: "https://www.bigbank.ee/savings/term-deposit",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "LHV Term Deposit",
          url: "https://www.lhv.ee/en/savings/term-deposit",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Coop Pank Term Deposit",
          url: "https://www.cooppank.ee/en/savings/term-deposit",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "SEB Term Deposit",
          url: "https://www.seb.ee/en/savings/term-deposit",
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "Swedbank Term Deposit",
          url: "https://www.swedbank.ee/private/savings/deposits",
        },
      ],
    },
    {
      "@type": "FinancialProduct",
      name: "Term Deposits in Estonia",
      description:
        "Fixed-term savings deposits from Estonian banks. DGSD-protected up to €100,000.",
      url: "https://nordicrate.com/deposits",
      provider: { "@type": "Organization", name: "NordicRate" },
      currency: "EUR",
      amount: { "@type": "MonetaryAmount", currency: "EUR", minValue: 100, maxValue: 1000000 },
    },
  ],
};

export default function DepositsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DepositsContent />
      {/* 2026-09-06: sayfa yalnizca filtre + kart listesiydi (ince icerik).
          89 sayfa indeksli ama organik trafik yok — sorun indeksleme degil
          siralama. Semantik govde + FAQ eklendi; FAQPage JSON-LD ayrica basiliyor. */}
      <DeepContentBlock content={deep} />
      <JsonLd data={buildFaqJsonLd(deep.faqs)} />
    </>
  );
}
