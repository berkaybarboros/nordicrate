"use client";

import { CheckCircle, Tag, ExternalLink, BarChart2, X } from "lucide-react";
import { InsuranceOffer } from "@/data/insurance";
import { useTranslation } from "@/contexts/LanguageContext";
import { useCompare } from "@/contexts/CompareContext";

interface Props {
  offer: InsuranceOffer;
}

const badgeColors: Record<string, string> = {
  "Most Popular": "bg-blue-100 text-blue-700 border border-blue-200",
  "Best Price": "bg-green-100 text-green-700 border border-green-200",
  "Estonian Choice": "bg-orange-100 text-orange-700 border border-orange-200",
  "Best Value": "bg-purple-100 text-purple-700 border border-purple-200",
};

export default function InsuranceOfferCard({ offer }: Props) {
  const { t } = useTranslation();
  const { add, remove, has, items, MAX } = useCompare();
  const inCompare = has(offer.id);
  const compareFull = !inCompare && items.length >= MAX;

  const monthly = Math.round(offer.representativePremium / 12);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 hover:shadow-lg hover:border-[#1a3c6e]/20 transition-all">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Company Info */}
        <div className="flex items-center gap-4 md:w-48 flex-shrink-0">
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-3xl border border-gray-100">
            {offer.companyLogo}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{offer.companyName}</p>
            {offer.badge && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColors[offer.badge] || "bg-gray-100 text-gray-600"}`}>
                {offer.badge}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:flex md:flex-1 gap-3 md:gap-0">
          <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
            <p className="text-xs text-gray-400 mb-0.5">{t.insurance.annualPremium}</p>
            <p className="text-xl font-extrabold text-[#1a3c6e]">
              €{offer.representativePremium}
            </p>
            <p className="text-xs text-gray-400">{t.insurance.perYear}</p>
          </div>
          <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
            <p className="text-xs text-gray-400 mb-0.5">{t.insurance.monthly}</p>
            <p className="text-xl font-extrabold text-gray-900">
              €{monthly}
            </p>
            <p className="text-xs text-gray-400">{t.insurance.perMonth}</p>
          </div>
          <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
            <p className="text-xs text-gray-400 mb-0.5">{t.insurance.excess}</p>
            <p className="text-xl font-extrabold text-gray-900">
              {offer.excess === 0 ? "None" : `€${offer.excess}`}
            </p>
            <p className="text-xs text-gray-400">deductible</p>
          </div>
          {offer.onlineDiscount && (
            <div className="hidden md:block md:flex-1 md:border-l md:border-gray-100 md:pl-5">
              <p className="text-xs text-gray-400 mb-0.5">{t.insurance.onlineDiscount}</p>
              <p className="text-xl font-extrabold text-green-600">-{offer.onlineDiscount}%</p>
              <p className="text-xs text-gray-400">if bought online</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="md:w-36 flex-shrink-0 space-y-2">
          <a
            href={offer.applyUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="w-full flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-2.5 rounded-xl transition text-sm"
          >
            {t.insurance.getQuote}
            <ExternalLink size={13} />
          </a>
          {/* Compare toggle */}
          <button
            disabled={compareFull}
            onClick={() =>
              inCompare
                ? remove(offer.id)
                : add({
                    id: offer.id,
                    type: "insurance",
                    name: offer.companyName,
                    logo: offer.companyLogo,
                    applyUrl: offer.applyUrl,
                    rawPremium: offer.representativePremium,
                    metrics: [
                      { label: "Annual Premium", value: `€${offer.representativePremium}` },
                      { label: "Monthly Premium", value: `€${monthly}` },
                      { label: "Excess / Deductible", value: offer.excess === 0 ? "None" : `€${offer.excess}` },
                      { label: "Online Discount", value: offer.onlineDiscount ? `-${offer.onlineDiscount}%` : "—" },
                      { label: "Payment Options", value: offer.paymentOptions.join(", ") },
                    ],
                  })
            }
            className={`w-full flex items-center justify-center gap-1.5 font-semibold py-2 rounded-xl transition text-xs border ${
              inCompare
                ? "bg-[#1a3c6e] text-white border-[#1a3c6e]"
                : compareFull
                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                : "bg-white text-[#1a3c6e] border-[#1a3c6e]/30 hover:bg-blue-50"
            }`}
          >
            {inCompare ? (
              <>
                <X size={11} /> Remove
              </>
            ) : (
              <>
                <BarChart2 size={11} /> {compareFull ? "Compare Full" : "+ Compare"}
              </>
            )}
          </button>
          <p className="text-xs text-center text-gray-400">{t.insurance.opensInsurer}</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {offer.paymentOptions.map((opt) => (
              <span key={opt} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                {opt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1">
          <CheckCircle size={11} className="text-green-500" /> {t.insurance.coverageIncluded}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {offer.coverage.slice(0, 4).map((cov) => (
            <div key={cov} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
              {cov}
            </div>
          ))}
        </div>
        {offer.onlineDiscount && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full md:hidden">
            <Tag size={11} />
            Save {offer.onlineDiscount}% by applying online
          </div>
        )}
      </div>
    </div>
  );
}
