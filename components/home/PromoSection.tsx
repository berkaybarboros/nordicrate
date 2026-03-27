"use client";

import { useMemo } from "react";
import { Flame, Zap, Star, Lock, ExternalLink } from "lucide-react";
import { promos, type Promo } from "@/data/promos";
import { useTranslation } from "@/contexts/LanguageContext";

const badgeConfig: Record<Promo["badge"], { label: string; color: string; icon: React.ReactNode }> = {
  HOT: { label: "HOT", color: "bg-red-500 text-white", icon: <Flame size={11} /> },
  NEW: { label: "NEW", color: "bg-green-500 text-white", icon: <Zap size={11} /> },
  LIMITED: { label: "LIMITED", color: "bg-orange-500 text-white", icon: <Lock size={11} /> },
  EXCLUSIVE: { label: "EXCLUSIVE", color: "bg-purple-600 text-white", icon: <Star size={11} /> },
};

function daysUntil(dateStr: string): number {
  const end = new Date(dateStr);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function PromoCard({ promo, large = false }: { promo: Promo; large?: boolean }) {
  const { t } = useTranslation();
  const badge = badgeConfig[promo.badge];
  const days = promo.endsAt ? daysUntil(promo.endsAt) : null;

  const ctaText =
    promo.type === "insurance"
      ? t.promo.getQuote
      : promo.type === "deposit"
      ? t.promo.openDeposit
      : t.promo.applyNow;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br ${promo.bgColor} text-white p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all ${large ? "min-h-[220px]" : "min-h-[180px]"}`}
    >
      {/* Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl">{promo.bankLogo}</span>
          <span className="font-bold text-white/90 text-sm">{promo.bankName}</span>
        </div>
        <span className={`flex items-center gap-1 text-xs font-extrabold px-2 py-1 rounded-full ${badge.color}`}>
          {badge.icon}
          {badge.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className={`font-extrabold text-white leading-tight mb-1 ${large ? "text-xl" : "text-base"}`}>
          {promo.title}
        </h3>
        {large && (
          <p className="text-white/75 text-sm leading-relaxed mb-2">
            {promo.description}
          </p>
        )}
        {promo.saving && (
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">
            💰 {promo.saving}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        {days !== null ? (
          <p className="text-white/70 text-xs">
            ⏳ {t.promo.endsIn} {days} {t.promo.days}
          </p>
        ) : (
          <div />
        )}
        <a
          href={promo.applyUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
        >
          {ctaText}
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

export default function PromoSection() {
  const { t } = useTranslation();

  const highlighted = useMemo(() => promos.filter((p) => p.highlight), []);
  const regular = useMemo(() => promos.filter((p) => !p.highlight), []);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#1a3c6e] flex items-center gap-2">
            <Flame className="text-red-500" size={22} />
            {t.promo.title}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{t.promo.subtitle}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {/* Highlighted promo — spans 2 cols */}
        {highlighted.map((promo) => (
          <div key={promo.id} className="md:col-span-2">
            <PromoCard promo={promo} large />
          </div>
        ))}

        {/* Regular promos */}
        {regular.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </section>
  );
}
