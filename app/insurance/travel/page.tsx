import type { Metadata } from "next";
import TravelInsuranceContent from "./TravelInsuranceContent";

export const metadata: Metadata = {
  title: "Travel Insurance Estonia | Compare reisikindlustus Prices 2026",
  description:
    "Compare travel insurance in Estonia from If, ERGO, LHV, Gjensidige. Single trip from €4.90, annual multi-trip from €49/year. Medical cover, trip cancellation, baggage. Instant quotes.",
  keywords: [
    "travel insurance Estonia",
    "reisikindlustus",
    "reisikindlustus Eesti",
    "annual travel insurance Estonia",
    "single trip insurance Estonia",
    "If travel insurance",
    "ERGO travel insurance Estonia",
    "LHV reisikindlustus",
    "cheap travel insurance Estonia",
    "travel medical cover Europe",
  ],
  alternates: { canonical: "https://balticrate.ee/insurance/travel" },
  openGraph: {
    title: "Travel Insurance Estonia | Compare reisikindlustus | BalticRate",
    description:
      "Compare travel insurance from If, ERGO, LHV, Gjensidige. Annual multi-trip from €49/year. Medical, cancellation, baggage cover included.",
    url: "https://balticrate.ee/insurance/travel",
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
        { "@type": "ListItem", position: 3, name: "Travel Insurance", item: "https://balticrate.ee/insurance/travel" },
      ],
    },
    {
      "@type": "ItemList",
      name: "Travel Insurance Estonia — Compare All Insurers",
      description: "Annual multi-trip and single-trip travel insurance from all major Estonian insurers.",
      url: "https://balticrate.ee/insurance/travel",
      numberOfItems: 4,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "If P&C — Travel Insurance", url: "https://www.if.ee/en/travel/travel-insurance" },
        { "@type": "ListItem", position: 2, name: "ERGO — Travel Insurance", url: "https://www.ergo.ee/en/travel-insurance" },
        { "@type": "ListItem", position: 3, name: "LHV Kindlustus — Travel Insurance", url: "https://www.lhv.ee/en/insurance/travel" },
        { "@type": "ListItem", position: 4, name: "Gjensidige — Travel Insurance", url: "https://www.gjensidige.ee/en/travel" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is travel insurance mandatory in Estonia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Travel insurance is not legally mandatory for Estonian residents travelling abroad, but it is strongly recommended. Many countries require it for visa applications (e.g. Schengen visa requires minimum €30,000 medical cover).",
          },
        },
        {
          "@type": "Question",
          name: "How much does annual travel insurance cost in Estonia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Annual multi-trip travel insurance in Estonia starts from €49/year for Europe cover and €69/year for worldwide cover. Single trip policies from €4.90 per trip.",
          },
        },
        {
          "@type": "Question",
          name: "What does travel insurance cover?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Standard travel insurance in Estonia covers emergency medical expenses, trip cancellation and curtailment, baggage loss/delay, travel delay, and personal accident. Medical cover limits typically range from €500,000 to €1,000,000.",
          },
        },
      ],
    },
  ],
};

export default function TravelInsurancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TravelInsuranceContent />
    </>
  );
}
