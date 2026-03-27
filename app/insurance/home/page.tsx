import type { Metadata } from "next";
import HomeInsuranceContent from "./HomeInsuranceContent";

export const metadata: Metadata = {
  title: "Home Insurance Estonia | Compare Property Coverage from €99/yr",
  description:
    "Compare home and property insurance in Estonia from If, ERGO and Gjensidige. Protect your home against fire, theft, flood and storm. Contents coverage included. From €99/year.",
  keywords: [
    "home insurance Estonia",
    "kodukindlustus",
    "property insurance Estonia",
    "contents insurance Estonia",
    "apartment insurance Estonia",
    "If home insurance",
    "ERGO kodukindlustus",
  ],
  alternates: { canonical: "https://balticrate.ee/insurance/home" },
  openGraph: {
    title: "Home Insurance Estonia | From €99/yr | BalticRate",
    description: "Compare home insurance from If, ERGO, Gjensidige. From €99/year.",
    url: "https://balticrate.ee/insurance/home",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://balticrate.ee" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Insurance",
      item: "https://balticrate.ee/insurance",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Home Insurance",
      item: "https://balticrate.ee/insurance/home",
    },
  ],
};

export default function HomeInsurancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeInsuranceContent />
    </>
  );
}
