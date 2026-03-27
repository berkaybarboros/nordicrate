"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

const categories = [
  {
    href: "/loans/personal",
    icon: "💳",
    labelKey: "personalLoans" as const,
    desc: "Up to €30,000 · 6–84 months",
    color: "from-blue-500 to-blue-600",
    highlight: "From 7.9% p.a.",
    badge: "Most Popular",
  },
  {
    href: "/loans/mortgage",
    icon: "🏠",
    labelKey: "mortgage" as const,
    desc: "Home financing up to €600,000",
    color: "from-indigo-500 to-indigo-600",
    highlight: "From 3.5% p.a.",
    badge: "Best Value",
  },
  {
    href: "/loans/car",
    icon: "🚗",
    labelKey: "carLoans" as const,
    desc: "New & used vehicles up to €60,000",
    color: "from-violet-500 to-violet-600",
    highlight: "From 6.9% p.a.",
    badge: null,
  },
  {
    href: "/insurance/motor",
    icon: "🛡️",
    labelKey: "motorInsurance" as const,
    desc: "Mandatory liability from €79/year",
    color: "from-orange-500 to-orange-600",
    highlight: "From €79/year",
    badge: "Required",
  },
  {
    href: "/insurance/home",
    icon: "🏡",
    labelKey: "homeInsurance" as const,
    desc: "Protect your property & contents",
    color: "from-green-500 to-green-600",
    highlight: "From €99/year",
    badge: null,
  },
  {
    href: "/insurance/health",
    icon: "❤️",
    labelKey: "healthInsurance" as const,
    desc: "Private healthcare from €150/year",
    color: "from-rose-500 to-rose-600",
    highlight: "From €150/year",
    badge: null,
  },
  {
    href: "/deposits",
    icon: "💰",
    labelKey: "deposits" as const,
    desc: "Save & earn up to 4.3% p.a.",
    color: "from-amber-500 to-amber-600",
    highlight: "Up to 4.3% p.a.",
    badge: "Guaranteed",
  },
  {
    href: "/insurance/casco",
    icon: "🔧",
    labelKey: "casco" as const,
    desc: "Comprehensive vehicle coverage",
    color: "from-teal-500 to-teal-600",
    highlight: "From €240/year",
    badge: null,
  },
];

export default function ProductCategories() {
  const { t } = useTranslation();

  return (
    <section className="py-12 max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a3c6e]">
          {t.categories.title}
        </h2>
        <p className="text-gray-500 mt-2">{t.categories.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const label = t.nav[cat.labelKey] || cat.labelKey;
          return (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#f97316]/30 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Badge */}
              {cat.badge && (
                <span className="absolute top-3 right-3 text-xs font-bold bg-[#f97316] text-white px-2 py-0.5 rounded-full">
                  {cat.badge}
                </span>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>

              <h3 className="font-bold text-gray-900 text-sm mb-1">{label}</h3>
              <p className="text-gray-500 text-xs mb-2 leading-relaxed">{cat.desc}</p>
              <p className="text-[#f97316] font-semibold text-sm">{cat.highlight}</p>

              <div className="flex items-center gap-1 mt-3 text-[#1a3c6e] text-xs font-medium group-hover:gap-2 transition-all">
                Compare <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
