import type { Metadata } from "next";
import LifeInsuranceContent from "./LifeInsuranceContent";

export const metadata: Metadata = {
  title: "Life Insurance Estonia | Compare elukindlustus Prices 2026",
  description:
    "Compare life insurance in Estonia from SEB Life, Swedbank Life, ERGO Life, If Life. Term life from €11/month. Death benefit, critical illness, total disability cover. Compare quotes.",
  keywords: [
    "life insurance Estonia",
    "elukindlustus Eesti",
    "elukindlustus",
    "term life insurance Estonia",
    "SEB elukindlustus",
    "Swedbank elukindlustus",
    "ERGO life insurance Estonia",
    "If life insurance",
    "cheap life insurance Estonia",
    "life cover Baltic",
  ],
  alternates: { canonical: "https://balticrate.ee/insurance/life" },
  openGraph: {
    title: "Life Insurance Estonia | Compare elukindlustus | BalticRate",
    description:
      "Compare life insurance from SEB Life, Swedbank Life, ERGO, If. Term life from €11/month. Death benefit up to €500,000 + critical illness cover.",
    url: "https://balticrate.ee/insurance/life",
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
        { "@type": "ListItem", position: 2, name: "Insurance", item: "https://balticrate.ee/insurance" },
        { "@type": "ListItem", position: 3, name: "Life Insurance", item: "https://balticrate.ee/insurance/life" },
      ],
    },
    {
      "@type": "ItemList",
      name: "Life Insurance Estonia — Compare All Insurers",
      description: "Term life insurance and whole life cover from all major Estonian life insurers.",
      url: "https://balticrate.ee/insurance/life",
      numberOfItems: 4,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "SEB Life — elukindlustus", url: "https://www.seb.ee/en/insurance/life-insurance" },
        { "@type": "ListItem", position: 2, name: "Swedbank Life — elukindlustus", url: "https://www.swedbank.ee/private/insurance/life" },
        { "@type": "ListItem", position: 3, name: "ERGO Life Insurance Estonia", url: "https://www.ergo.ee/en/life-insurance" },
        { "@type": "ListItem", position: 4, name: "If Life Insurance Estonia", url: "https://www.if.ee/en/life/life-insurance" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How much life insurance do I need in Estonia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A common rule of thumb is 10× your annual income. For a mortgage, at minimum insure the outstanding loan balance. Many Estonian banks require life insurance as a condition of mortgage approval.",
          },
        },
        {
          "@type": "Question",
          name: "How much does life insurance cost in Estonia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Term life insurance in Estonia starts from approximately €11/month (€132/year) for a healthy non-smoker aged 30–40 with €100,000 cover. Premiums depend on age, health, smoking status, and cover amount.",
          },
        },
        {
          "@type": "Question",
          name: "Is critical illness cover included?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most Estonian life insurers offer critical illness as an add-on or bundled rider covering 30–50 major conditions. Stand-alone critical illness policies are also available from ERGO and If.",
          },
        },
      ],
    },
  ],
};

export default function LifeInsurancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LifeInsuranceContent />
    </>
  );
}
