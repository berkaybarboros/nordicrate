import type { Metadata } from "next";
import DepositsContent from "./DepositsContent";

export const metadata: Metadata = {
  title: "Time Deposits Estonia | Compare Savings Rates up to 4.3% p.a.",
  description:
    "Compare term deposit rates in Estonia from Bigbank, LHV, Swedbank, SEB and Coop Pank. Earn up to 4.3% p.a. DGSD-protected up to €100,000. From 1 to 60 months. Updated daily.",
  keywords: [
    "term deposit Estonia",
    "tähtajaline hoius",
    "savings account Estonia",
    "best deposit rates Estonia",
    "Bigbank deposit",
    "LHV hoius",
    "Swedbank deposit Estonia",
    "fixed deposit Estonia",
  ],
  alternates: { canonical: "https://balticrate.ee/deposits" },
  openGraph: {
    title: "Time Deposits Estonia | Up to 4.3% p.a. | BalticRate",
    description:
      "Compare term deposits from Bigbank, LHV, Swedbank, SEB, Coop. Earn up to 4.3% p.a. DGSD-protected.",
    url: "https://balticrate.ee/deposits",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://balticrate.ee" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Deposits",
          item: "https://balticrate.ee/deposits",
        },
      ],
    },
    {
      "@type": "ItemList",
      name: "Term Deposits in Estonia — Best Rates 2026",
      description: "Compare fixed-term deposit rates from Estonian banks. Updated daily.",
      url: "https://balticrate.ee/deposits",
      numberOfItems: 5,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Bigbank Term Deposit — up to 4.3% p.a.",
          url: "https://www.bigbank.ee/savings/term-deposit",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "LHV Term Deposit — up to 4.1% p.a.",
          url: "https://www.lhv.ee/en/savings/term-deposit",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Coop Pank Term Deposit — up to 4.0% p.a.",
          url: "https://www.cooppank.ee/en/savings/term-deposit",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "SEB Term Deposit — up to 3.9% p.a.",
          url: "https://www.seb.ee/en/savings/term-deposit",
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "Swedbank Term Deposit — up to 3.8% p.a.",
          url: "https://www.swedbank.ee/private/savings/deposits",
        },
      ],
    },
    {
      "@type": "FinancialProduct",
      name: "Term Deposits in Estonia",
      description:
        "Fixed-term savings deposits from Estonian banks. DGSD-protected up to €100,000.",
      url: "https://balticrate.ee/deposits",
      provider: { "@type": "Organization", name: "BalticRate" },
      interestRate: "4.3",
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
    </>
  );
}
