import type { Metadata } from "next";
import CarLoansContent from "./CarLoansContent";

export const metadata: Metadata = {
  title: "Car Loans Estonia | Finance New & Used Vehicles from 8.9%",
  description:
    "Compare car loan offers in Estonia. Finance new or used vehicles €3,000–€60,000. Rates from 8.9% p.a., repay over up to 84 months. LHV, Swedbank, SEB, Luminor. No hidden fees.",
  keywords: [
    "car loan Estonia",
    "autolaen",
    "vehicle finance Estonia",
    "used car loan Estonia",
    "new car financing Estonia",
    "LHV autolaen",
    "Swedbank car loan",
  ],
  alternates: { canonical: "https://balticrate.ee/loans/car" },
  openGraph: {
    title: "Car Loans Estonia | From 8.9% p.a. | BalticRate",
    description:
      "Compare car finance from Estonian banks. €3,000–€60,000, up to 84 months. Rates from 8.9%.",
    url: "https://balticrate.ee/loans/car",
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
        { "@type": "ListItem", position: 2, name: "Loans", item: "https://balticrate.ee/loans" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Car Loans",
          item: "https://balticrate.ee/loans/car",
        },
      ],
    },
    {
      "@type": "FinancialProduct",
      name: "Car Loans in Estonia",
      description: "Vehicle finance from Estonian banks for new and used cars.",
      url: "https://balticrate.ee/loans/car",
      provider: { "@type": "Organization", name: "BalticRate" },
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
    </>
  );
}
