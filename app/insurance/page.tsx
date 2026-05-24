import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Insurance Estonia | Compare All Types — Motor, CASCO, Home, Health, Travel, Life",
  description:
    "Compare all insurance types in Estonia. Motor (liikluskindlustus), CASCO, home, health, travel (reisikindlustus) and life (elukindlustus) insurance from If, ERGO, Swedbank, LHV, Gjensidige, SEB. Instant quotes.",
  keywords: [
    "insurance Estonia",
    "kindlustus Eesti",
    "compare insurance Estonia",
    "motor insurance Estonia",
    "home insurance Estonia",
    "health insurance Estonia",
    "travel insurance Estonia",
    "life insurance Estonia",
    "CASCO Estonia",
  ],
  alternates: { canonical: "https://balticrate.ee/insurance" },
  openGraph: {
    title: "Insurance Estonia | Compare All Types | BalticRate",
    description:
      "Compare motor, CASCO, home, health, travel and life insurance in Estonia from all major insurers.",
    url: "https://balticrate.ee/insurance",
    type: "website",
  },
};

const insuranceTypes = [
  {
    href: "/insurance/motor",
    icon: "🚗",
    title: "Motor Insurance",
    subtitle: "liikluskindlustus",
    desc: "Mandatory liability for all vehicles",
    price: "From €79/year",
    color: "from-orange-500 to-orange-600",
    badge: "Required by law",
    badgeColor: "bg-red-500",
  },
  {
    href: "/insurance/casco",
    icon: "🛡️",
    title: "CASCO",
    subtitle: "kaskokindlustus",
    desc: "Comprehensive vehicle cover",
    price: "From €240/year",
    color: "from-teal-500 to-teal-600",
    badge: null,
    badgeColor: "",
  },
  {
    href: "/insurance/home",
    icon: "🏠",
    title: "Home Insurance",
    subtitle: "kodukindlustus",
    desc: "Property & contents protection",
    price: "From €99/year",
    color: "from-green-500 to-green-600",
    badge: null,
    badgeColor: "",
  },
  {
    href: "/insurance/health",
    icon: "❤️",
    title: "Health Insurance",
    subtitle: "ravikindlustus",
    desc: "Private healthcare & dental",
    price: "From €150/year",
    color: "from-rose-500 to-rose-600",
    badge: null,
    badgeColor: "",
  },
  {
    href: "/insurance/travel",
    icon: "✈️",
    title: "Travel Insurance",
    subtitle: "reisikindlustus",
    desc: "Medical, cancellation & baggage",
    price: "From €49/year",
    color: "from-sky-500 to-sky-600",
    badge: "Schengen required",
    badgeColor: "bg-sky-500",
  },
  {
    href: "/insurance/life",
    icon: "💜",
    title: "Life Insurance",
    subtitle: "elukindlustus",
    desc: "Term life & death benefit",
    price: "From €11/month",
    color: "from-violet-500 to-violet-600",
    badge: "Mortgage required",
    badgeColor: "bg-violet-500",
  },
];

const insurers = [
  { name: "If P&C", logo: "🔵", types: ["Motor", "CASCO", "Home", "Health", "Travel", "Life"] },
  { name: "ERGO", logo: "🟠", types: ["Motor", "CASCO", "Home", "Health", "Travel", "Life"] },
  { name: "Swedbank P&C", logo: "🟡", types: ["Motor", "CASCO", "Home"] },
  { name: "Gjensidige", logo: "🔴", types: ["Motor", "CASCO", "Travel"] },
  { name: "LHV Kindlustus", logo: "⚫", types: ["Motor", "CASCO", "Travel"] },
  { name: "SEB Life", logo: "🟢", types: ["Life"] },
  { name: "Swedbank Life", logo: "🟡", types: ["Life"] },
];

export default function InsurancePage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#ea580c] text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span className="text-white">Insurance</span>
          </nav>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={32} className="text-white/80" />
            <h1 className="text-2xl md:text-3xl font-extrabold">Insurance in Estonia</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Compare all insurance types from licensed Estonian insurers — motor, home, health,
            travel, CASCO and life. Real prices, instant quotes.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {["If P&C", "ERGO", "Swedbank", "LHV", "Gjensidige", "SEB Life"].map((name) => (
              <span
                key={name}
                className="text-xs bg-white/15 border border-white/20 text-white px-3 py-1 rounded-full font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Category grid */}
        <h2 className="text-lg font-bold text-[#1a3c6e] mb-5">Choose your insurance type</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insuranceTypes.map((ins) => (
            <Link
              key={ins.href}
              href={ins.href}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-[#1a3c6e]/20 transition-all"
            >
              {ins.badge && (
                <span className={`absolute top-4 right-4 text-xs font-bold ${ins.badgeColor} text-white px-2 py-0.5 rounded-full`}>
                  {ins.badge}
                </span>
              )}
              <div
                className={`w-14 h-14 bg-gradient-to-br ${ins.color} rounded-xl flex items-center justify-center text-3xl mb-4`}
              >
                {ins.icon}
              </div>
              <p className="text-xs text-gray-400 mb-0.5 font-medium">{ins.subtitle}</p>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{ins.title}</h2>
              <p className="text-gray-500 text-sm mb-1">{ins.desc}</p>
              <p className="text-[#f97316] font-bold text-sm mb-4">{ins.price}</p>
              <div className="flex items-center gap-1 text-[#1a3c6e] text-sm font-semibold group-hover:gap-2 transition-all">
                Compare quotes <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        {/* Insurer trust bar */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-[#1a3c6e] mb-4 uppercase tracking-wide">
            Licensed insurers we compare
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {insurers.map((ins) => (
              <div key={ins.name} className="flex items-start gap-3">
                <span className="text-2xl">{ins.logo}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{ins.name}</p>
                  <p className="text-xs text-gray-400">{ins.types.join(" · ")}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
            All insurers are regulated by Finantsinspektsioon (Estonian Financial Supervision
            Authority). BalticRate is an independent comparison service.
          </p>
        </div>

        {/* SEO text block */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1a3c6e] mb-3">Insurance in Estonia — What you need to know</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-800 mb-1">Mandatory insurance</p>
              <p>
                Motor insurance (liikluskindlustus) is the only legally required personal insurance
                in Estonia. All registered vehicles must hold valid motor liability cover. Driving
                without it can result in fines of up to €1,200.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Recommended insurance</p>
              <p>
                Home insurance is strongly recommended for property owners and tenants. Life
                insurance is typically required by Estonian banks when taking out a mortgage.
                Travel insurance is required for Schengen visa applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
