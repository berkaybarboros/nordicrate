import type { Metadata } from "next";
import CategorySeoBlock from "@/components/seo/CategorySeoBlock";
import MotorInsuranceContent from "./MotorInsuranceContent";

export const metadata: Metadata = {
  title: "Motor Insurance Estonia | Compare Liikluskindlustus Prices",
  description:
    "Compare mandatory motor insurance (liikluskindlustus) in Estonia from If, ERGO, Swedbank P&C, Gjensidige and LHV. Required by law. Save up to 30% by comparing online. Instant quotes.",
  keywords: [
    "motor insurance Estonia",
    "liikluskindlustus",
    "mandatory car insurance Estonia",
    "If insurance Estonia",
    "ERGO motor insurance",
    "cheap motor insurance Estonia",
    "liikluskindlustus võrdlus",
  ],
  alternates: { canonical: "https://nordicrate.com/insurance/motor" },
  openGraph: {
    title: "Motor Insurance Estonia | Compare Liikluskindlustus | NordicRate",
    description:
      "Compare motor insurance prices from If, ERGO, Swedbank, Gjensidige, LHV. Mandatory for all vehicles in Estonia. Save by comparing.",
    url: "https://nordicrate.com/insurance/motor",
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
          name: "Insurance",
          item: "https://nordicrate.com/insurance",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Motor Insurance",
          item: "https://nordicrate.com/insurance/motor",
        },
      ],
    },
    {
      "@type": "ItemList",
      name: "Motor Insurance Estonia — Compare All Insurers",
      description:
        "Mandatory vehicle liability insurance (liikluskindlustus) from all Estonian insurers.",
      url: "https://nordicrate.com/insurance/motor",
      numberOfItems: 5,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "If P&C Insurance — Motor Liability",
          url: "https://www.if.ee/en/car/motor-liability",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "ERGO Insurance — Motor Liability",
          url: "https://www.ergo.ee/en/car-insurance/motor-liability",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Swedbank P&C — Motor Insurance",
          url: "https://www.swedbank.ee/private/insurance/vehicle/motor",
        },
      ],
    },
  ],
};

export default function MotorInsurancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MotorInsuranceContent />
      <CategorySeoBlock slug="motor" />
    </>
  );
}
