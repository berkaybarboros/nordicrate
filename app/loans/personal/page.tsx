import type { Metadata } from "next";
import PersonalLoansContent from "./PersonalLoansContent";

export const metadata: Metadata = {
  title: "Personal Loans Estonia | Compare 6 Offers from 9.9% p.a.",
  description:
    "Compare personal loans in Estonia from LHV, Swedbank, SEB, Luminor and Bigbank. Best rate 9.9% p.a. Borrow €500–€30,000. No setup fee options. Instant online decision. Updated daily.",
  keywords: [
    "personal loan Estonia",
    "tarbimislaen",
    "consumer credit Estonia",
    "best loan rate Estonia",
    "LHV tarbimislaen",
    "Bigbank laen",
    "Swedbank personal loan",
    "SEB tarbimislaen",
  ],
  alternates: { canonical: "https://balticrate.ee/loans/personal" },
  openGraph: {
    title: "Personal Loans Estonia | Best Rates from 9.9% | BalticRate",
    description:
      "Compare 6 personal loan offers in Estonia. Rates from 9.9% p.a. Borrow up to €30,000. LHV, Swedbank, SEB, Luminor & Bigbank.",
    url: "https://balticrate.ee/loans/personal",
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
          name: "Personal Loans",
          item: "https://balticrate.ee/loans/personal",
        },
      ],
    },
    {
      "@type": "ItemList",
      name: "Personal Loans in Estonia — Best Rates 2026",
      description: "Compare personal loan offers from Estonian banks, updated daily.",
      url: "https://balticrate.ee/loans/personal",
      numberOfItems: 6,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "LHV Personal Loan — from 9.9% p.a.",
          url: "https://www.lhv.ee/en/loans/consumer-loan",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Swedbank Personal Loan — from 11.9% p.a.",
          url: "https://www.swedbank.ee/private/credit/loans/personal",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "SEB Personal Loan — from 12.4% p.a.",
          url: "https://www.seb.ee/en/loans/personal-loan",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Bigbank Personal Loan — from 14.9% p.a.",
          url: "https://www.bigbank.ee/loans",
        },
      ],
    },
    {
      "@type": "FinancialProduct",
      name: "Personal Loans in Estonia",
      description:
        "Unsecured personal loans from Estonian banks. Borrow €500–€30,000, repay over 6–84 months.",
      url: "https://balticrate.ee/loans/personal",
      provider: { "@type": "Organization", name: "BalticRate" },
      interestRate: "9.9",
      loanTerm: "P36M",
      currency: "EUR",
      amount: { "@type": "MonetaryAmount", currency: "EUR", minValue: 500, maxValue: 30000 },
    },
  ],
};

export default function PersonalLoansPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PersonalLoansContent />
    </>
  );
}
