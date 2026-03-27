import type { Metadata } from "next";
import HealthContent from "./HealthContent";

export const metadata: Metadata = {
  title: "Health Insurance Estonia | Compare Private Healthcare Plans",
  description:
    "Compare private health insurance plans in Estonia from If, ERGO and Gjensidige. Access private clinics, shorter waiting times, dental and mental health coverage. Free comparison.",
  keywords: [
    "health insurance Estonia",
    "tervisekindlustus",
    "private healthcare Estonia",
    "medical insurance Estonia",
    "If health insurance",
    "ERGO tervisekindlustus",
    "expat health insurance Estonia",
  ],
  alternates: { canonical: "https://balticrate.ee/insurance/health" },
  openGraph: {
    title: "Health Insurance Estonia | Compare Private Plans | BalticRate",
    description:
      "Compare private health insurance from If, ERGO, Gjensidige. Access private clinics, dental and mental health coverage.",
    url: "https://balticrate.ee/insurance/health",
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
      name: "Health Insurance",
      item: "https://balticrate.ee/insurance/health",
    },
  ],
};

export default function HealthInsurancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HealthContent />
    </>
  );
}
