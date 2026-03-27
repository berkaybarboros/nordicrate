import type { Metadata } from "next";
import MortgageContent from "./MortgageContent";

export const metadata: Metadata = {
  title: "Mortgages Estonia | Compare Home Loan Rates — From 1.75%",
  description:
    "Compare mortgage rates in Estonia from LHV, Swedbank, SEB and Luminor. Euribor + margin from 1.75%. Borrow €20,000–€600,000 for up to 30 years. Free comparison, no registration.",
  keywords: [
    "mortgage Estonia",
    "home loan Estonia",
    "kodulaen",
    "eluasemelaen",
    "Euribor mortgage Estonia",
    "LHV mortgage",
    "Swedbank mortgage Estonia",
    "SEB kodulaen",
  ],
  alternates: { canonical: "https://balticrate.ee/loans/mortgage" },
  openGraph: {
    title: "Mortgages Estonia | Compare Rates from 1.75% | BalticRate",
    description:
      "Compare home loans from LHV, Swedbank, SEB, Luminor. Euribor + margin from 1.75%. Borrow up to €600,000.",
    url: "https://balticrate.ee/loans/mortgage",
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
          name: "Mortgages",
          item: "https://balticrate.ee/loans/mortgage",
        },
      ],
    },
    {
      "@type": "FinancialProduct",
      name: "Mortgage Loans in Estonia",
      description:
        "Home loans from Estonian banks. Euribor + margin, up to 30 years, up to 85% LTV.",
      url: "https://balticrate.ee/loans/mortgage",
      provider: { "@type": "Organization", name: "BalticRate" },
      interestRate: "1.75",
      loanTerm: "P240M",
      currency: "EUR",
      amount: { "@type": "MonetaryAmount", currency: "EUR", minValue: 20000, maxValue: 600000 },
    },
  ],
};

export default function MortgagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MortgageContent />
    </>
  );
}
