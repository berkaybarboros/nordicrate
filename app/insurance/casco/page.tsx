import type { Metadata } from "next";
import CategorySeoBlock from "@/components/seo/CategorySeoBlock";
import CascoContent from "./CascoContent";

export const metadata: Metadata = {
  title: "CASCO Insurance Estonia | Compare Comprehensive Coverage",
  description:
    "Compare CASCO (kasko) insurance from Estonian insurers — If, ERGO, LHV. Comprehensive vehicle protection against theft, accidents, fire and natural events. Get quotes and apply online.",
  keywords: [
    "CASCO insurance Estonia",
    "kasko kindlustus",
    "comprehensive car insurance Estonia",
    "vehicle insurance Estonia",
    "If CASCO",
    "ERGO kasko",
    "LHV CASCO",
  ],
  alternates: { canonical: "https://nordicrate.com/insurance/casco" },
  openGraph: {
    title: "CASCO Insurance Estonia | Compare Comprehensive Coverage | NordicRate",
    description: "Compare CASCO from If, ERGO, LHV. Comprehensive vehicle protection.",
    url: "https://nordicrate.com/insurance/casco",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nordicrate.com" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Insurance",
      item: "https://nordicrate.com/insurance",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "CASCO Insurance",
      item: "https://nordicrate.com/insurance/casco",
    },
  ],
};

export default function CascoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CascoContent />
      <CategorySeoBlock slug="casco" />
    </>
  );
}
