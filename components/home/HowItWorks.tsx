"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";

const stepIcons = ["🔍", "✅", "💶"];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="bg-gradient-to-br from-[#f0f4ff] to-[#fff7f0] py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a3c6e]">
            {t.howItWorks.title}
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#1a3c6e] via-[#f97316] to-[#1a3c6e] opacity-20" />

          {t.howItWorks.steps.map((step, idx) => (
            <div key={idx} className="relative text-center">
              <div className="inline-flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-3xl">
                    {stepIcons[idx]}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#f97316] text-white text-xs font-extrabold rounded-full flex items-center justify-center">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#1a3c6e] mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/loans/personal"
            className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-orange-500/25"
          >
            {t.howItWorks.cta}
          </Link>
          <p className="text-gray-400 text-xs mt-3">{t.howItWorks.note}</p>
        </div>
      </div>
    </section>
  );
}
