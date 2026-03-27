"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown } from "lucide-react";
import InsuranceOfferCard from "@/components/insurance/InsuranceOfferCard";
import type { InsuranceOffer } from "@/data/insurance";
import { useTranslation } from "@/contexts/LanguageContext";

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

export default function HomeInsuranceContent() {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");
  const [offers, setOffers] = useState<InsuranceOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(() => {
    setLoading(true);
    fetch(`/api/insurance/home?sort=${sortBy === "price" ? "price" : "name"}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.offers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sortBy]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#16a34a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>{t.common.home}</span> <span className="mx-2">/</span>
            <span>{t.nav.insurance}</span> <span className="mx-2">/</span>
            <span className="text-white">Home Insurance</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Home Insurance in Estonia</h1>
          <p className="text-white/80">
            Protect your property & contents ·{" "}
            {loading ? "Loading..." : `Compare ${offers.length} offers`}
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            {["Fire & flood", "Theft & burglary", "Storm damage", "Contents coverage"].map((f) => (
              <div
                key={f}
                className="bg-white/15 rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"
              >
                ✓ {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
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
              onChange={(e) => setSortBy(e.target.value as "price" | "rating")}
              className="text-sm font-medium text-[#1a3c6e] border-0 bg-transparent cursor-pointer focus:outline-none"
            >
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {loading && (
          <>
            <SkeletonInsuranceCard />
            <SkeletonInsuranceCard />
            <SkeletonInsuranceCard />
          </>
        )}

        {!loading && offers.map((offer) => <InsuranceOfferCard key={offer.id} offer={offer} />)}

        <p className="text-xs text-gray-400 text-center py-4 leading-relaxed">
          Home insurance premiums depend on the property size, location, construction type and
          selected coverage level. All insurers are licensed by Finantsinspektsioon. BalticRate is a
          comparison service — we do not provide insurance directly.
        </p>
      </div>
    </div>
  );
}
