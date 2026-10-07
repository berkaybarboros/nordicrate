"use client";

import { useState, useCallback } from "react";
import { useFetchJson } from "@/lib/use-fetch-json";
import { ArrowUpDown, CheckCircle, Plane } from "lucide-react";
import InsuranceOfferCard from "@/components/insurance/InsuranceOfferCard";
import InsuranceDisclaimer from "@/components/insurance/InsuranceDisclaimer";
import AIProductSection from "@/components/AIProductSection";
import AIPageBanner from "@/components/AIPageBanner";
import SmartRateWidget from "@/components/SmartRateWidget";
import PersonalizedRecs from "@/components/PersonalizedRecs";
import SocialProofBar from "@/components/SocialProofBar";
import type { InsuranceOffer } from "@/data/insurance";

function SkeletonCard() {
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

export default function TravelInsuranceContent() {
  const [sortBy, setSortBy] = useState<"price" | "name">("price");
  const [liveEuribor, setLiveEuribor] = useState<number | null>(null);

  const handleRateChange = useCallback((rates: import("@/components/SmartRateWidget").RateEntry[]) => {
    const e3m = rates.find(r => r.key === 'euribor3m');
    if (e3m) setLiveEuribor(e3m.rate);
  }, []);

  const { data, loading } = useFetchJson<{ offers?: InsuranceOffer[] }>(`/api/insurance/travel?sort=${sortBy}`);
  const offers = data?.offers ?? [];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#0ea5e9] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span>Insurance</span> <span className="mx-2">/</span>
            <span className="text-white">Travel Insurance</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Travel Insurance Estonia</h1>
          <p className="text-white/80">
            reisikindlustus · {loading ? "Loading..." : `${offers.length} plans`} · example
            premiums, not quotes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar — below on mobile */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Form adımı kaldırıldı (2026-10): seyahat tipi / varış yeri / yolcu girdileri
                sonuçları değiştirmiyordu. Eski "guide" tablosundaki teminat aralıkları da
                kaynaksızdı; yerine poliçede neye bakılacağı kalır. */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="font-bold text-[#1a3c6e] text-sm mb-3 flex items-center gap-1.5">
                <Plane size={13} /> What to check in a policy
              </h4>
              <ul className="space-y-2 text-xs text-gray-600">
                {[
                  "Emergency medical and repatriation limit",
                  "Schengen visa: at least €30,000 medical cover",
                  "Trip cancellation and baggage limits",
                  "Excess per claim",
                  "Sports and activities covered",
                  "Single trip vs. annual multi-trip",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <SmartRateWidget onRateChange={handleRateChange} />
            <PersonalizedRecs productType="travel" liveEuribor={liveEuribor} />
            <AIProductSection
              productType="travel insurance"
              country="Estonia"
              accentGradient="from-[#1a3c6e] to-[#0ea5e9]"
            />
          </div>

          {/* Offers — first on mobile */}
          <div className="space-y-4 order-1 lg:order-2">
            <SocialProofBar productType="insurance" />
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-sm font-medium text-gray-600">
                <span className="font-bold text-[#1a3c6e]">
                  {loading ? "..." : offers.length} plans
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
              productType="travel-insurance"
              context={!loading && offers.length > 0 ? `${offers.length} travel plans · example annual premiums from €${Math.min(...offers.map(o => o.representativePremium))}/year` : undefined}
            />

            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {!loading && offers.map((offer) => <InsuranceOfferCard key={offer.id} offer={offer} />)}

            {!loading && offers.length > 0 && (
              <InsuranceDisclaimer factors="trip length, destination, traveller age and declared activities" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
