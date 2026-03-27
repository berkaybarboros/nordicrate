import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Loans Estonia | SME Financing | BalticRate",
  description:
    "Business loan comparison for Estonian SMEs and entrepreneurs. Working capital, investment and startup financing coming soon. Compare personal loans in the meantime.",
  keywords: [
    "business loan Estonia",
    "SME financing Estonia",
    "ärilaen",
    "startup finance Estonia",
    "working capital loan Estonia",
  ],
  alternates: { canonical: "https://balticrate.ee/loans/business" },
  openGraph: {
    title: "Business Loans Estonia | SME Financing | BalticRate",
    description: "Business loan comparison for Estonian SMEs coming soon.",
    url: "https://balticrate.ee/loans/business",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://balticrate.ee" },
    { "@type": "ListItem", position: 2, name: "Loans", item: "https://balticrate.ee/loans" },
    {
      "@type": "ListItem",
      position: 3,
      name: "Business Loans",
      item: "https://balticrate.ee/loans/business",
    },
  ],
};

export default function BusinessLoansPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-[#f8fafc] min-h-screen">
        <div className="bg-gradient-to-r from-[#1a3c6e] to-[#0d9488] text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
              <span>Home</span> <span className="mx-2">/</span>
              <span>Loans</span> <span className="mx-2">/</span>
              <span className="text-white">Business Loans</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
              Business Loans in Estonia
            </h1>
            <p className="text-white/80">Financing for SMEs and entrepreneurs</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Building2 size={64} className="text-[#1a3c6e]/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1a3c6e] mb-3">Business Loan Comparison</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Business loan comparison is coming soon. In the meantime, compare personal and consumer
            loans — many Estonian banks also offer small business credit through their personal loan
            products.
          </p>
          <Link
            href="/loans/personal"
            className="inline-flex items-center gap-2 bg-[#f97316] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#ea6c0a] transition"
          >
            Compare Personal Loans <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
