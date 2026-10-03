"use client";

import { useState, useCallback } from "react";
import { useFetchJson } from "@/lib/use-fetch-json";
import { ArrowUpDown, AlertCircle, CheckCircle } from "lucide-react";
import AIPageBanner from "@/components/AIPageBanner";
import InsuranceOfferCard from "@/components/insurance/InsuranceOfferCard";
import InsuranceDisclaimer from "@/components/insurance/InsuranceDisclaimer";
import AIProductSection from "@/components/AIProductSection";
import SmartRateWidget from "@/components/SmartRateWidget";
import PersonalizedRecs from "@/components/PersonalizedRecs";
import type { InsuranceOffer } from "@/data/insurance";
import { useTranslation } from "@/contexts/LanguageContext";
import SocialProofBar from "@/components/SocialProofBar";

function SkeletonInsuranceCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex items-center gap-4 md:w-48">
          <div className="w-14 h-14 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 flex-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="md:w-36">
          <div className="h-10 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function MotorInsuranceContent() {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<"price" | "name">("price");
  const [liveEuribor, setLiveEuribor] = useState<number | null>(null);
  const handleRateChange = useCallback((rates: import("@/components/SmartRateWidget").RateEntry[]) => {
    const e3m = rates.find(r => r.key === 'euribor3m');
    if (e3m) setLiveEuribor(e3m.rate);
  }, []);

  const { data, loading } = useFetchJson<{ offers?: InsuranceOffer[] }>(`/api/insurance/motor?sort=${sortBy}`);
  const offers = data?.offers ?? [];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#ea580c] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{t.insurance.motorTitle}</h1>
          <p className="text-white/80">
            {loading ? "Loading..." : `${offers.length} ${t.insurance.plans}`} · Mandatory liability
            insurance (liikluskindlustus) · example premiums, not quotes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar: Calculator + AI — below on mobile */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Form adımı kaldırıldı (2026-10): araç/plaka/doğum tarihi hiçbir hesaba girmiyordu,
                plaka için "ARK registry'den doğrulanır" diyordu. Kişisel fiyat sigortacının
                teklif formunda; burada yalnız ürünü anlatan bilgi kalır. */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">{t.insurance.requiredByLaw}</p>
                <p className="text-red-700 text-xs mt-0.5">
                  All vehicles in Estonia must have valid motor insurance (liikluskindlustus). Driving
                  without it can result in fines.
                </p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 text-sm mb-3">
                {t.insurance.coverageIncluded}
              </h3>
              <div className="space-y-2">
                {[
                  "Third-party property damage (required by law)",
                  "Bodily injury to other parties",
                  "Legal defence costs",
                  "European Green Card included",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <SmartRateWidget onRateChange={handleRateChange} />
            <PersonalizedRecs
              productType="motor"
              liveEuribor={liveEuribor}
            />
            <AIProductSection
              productType="motor insurance"
              country="Estonia"
              accentGradient="from-[#1a3c6e] to-[#ea580c]"
            />
          </div>

          {/* Main: Offers — first on mobile */}
          <div className="space-y-4 order-1 lg:order-2">
            <SocialProofBar productType="insurance" />
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-sm font-medium text-gray-600">
                <span className="font-bold text-[#1a3c6e]">
                  {loading ? "..." : offers.length} insurers
                </span>{" "}
                compared
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "price" | "name")}
                  className="text-sm font-medium text-[#1a3c6e] border-0 bg-transparent cursor-pointer focus:outline-none"
                >
                  <option value="price">Lowest Price</option>
                  <option value="name">Company (A–Z)</option>
                </select>
              </div>
            </div>

            <AIPageBanner
              productType="motor-insurance"
              context={!loading && offers.length > 0 ? `Lowest example premium: €${Math.min(...offers.map(o => o.representativePremium))}/year — ${offers.length} insurers compared` : undefined}
            />

            {loading && (
              <>
                <SkeletonInsuranceCard />
                <SkeletonInsuranceCard />
                <SkeletonInsuranceCard />
              </>
            )}

            {!loading && offers.map((offer) => <InsuranceOfferCard key={offer.id} offer={offer} />)}

            <InsuranceDisclaimer factors="the vehicle, the driver and claims history" />
          </div>
        </div>
      </div>
    </div>
  );
}
