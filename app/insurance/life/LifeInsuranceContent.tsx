"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, CheckCircle, Heart, ShieldCheck, Info } from "lucide-react";
import InsuranceOfferCard from "@/components/insurance/InsuranceOfferCard";
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

const coverAmounts = [50000, 100000, 150000, 200000, 300000, 500000];
const termOptions = [5, 10, 15, 20, 25, 30];

export default function LifeInsuranceContent() {
  const [sortBy, setSortBy] = useState<"price" | "name">("price");
  const [coverAmount, setCoverAmount] = useState(100000);
  const [termYears, setTermYears] = useState(20);
  const [smoker, setSmoker] = useState(false);
  const [step, setStep] = useState<"form" | "results">("form");
  const [offers, setOffers] = useState<InsuranceOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [liveEuribor, setLiveEuribor] = useState<number | null>(null);

  const handleRateChange = useCallback((rates: import("@/components/SmartRateWidget").RateEntry[]) => {
    const e3m = rates.find(r => r.key === 'euribor3m');
    if (e3m) setLiveEuribor(e3m.rate);
  }, []);

  const fetchOffers = useCallback(() => {
    setLoading(true);
    fetch(`/api/insurance/life?sort=${sortBy}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.offers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sortBy]);

  useEffect(() => {
    if (step === "results") fetchOffers();
  }, [step, fetchOffers]);

  if (step === "form") {
    return (
      <div className="bg-[#f8fafc] min-h-screen">
        <div className="bg-gradient-to-r from-[#1a3c6e] to-[#7c3aed] text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
              <span>Home</span> <span className="mx-2">/</span>
              <span>Insurance</span> <span className="mx-2">/</span>
              <span className="text-white">Life Insurance</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <Heart size={28} className="text-white/80" />
              <h1 className="text-2xl md:text-3xl font-extrabold">Life Insurance Estonia</h1>
            </div>
            <p className="text-white/80">
              elukindlustus — Compare SEB Life, Swedbank Life, ERGO & If · From €11/month
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Mortgage tip */}
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info size={18} className="text-violet-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-violet-800 text-sm">Required for mortgage in Estonia</p>
              <p className="text-violet-700 text-xs mt-0.5">
                Most Estonian banks (SEB, Swedbank, LHV, Coop) require linked life insurance as a
                condition of home loan approval.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#1a3c6e] mb-5">Calculate your cover</h2>
            <div className="space-y-5">
              {/* Cover amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover amount (death benefit)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {coverAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCoverAmount(amt)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                        coverAmount === amt
                          ? "bg-[#1a3c6e] text-white border-[#1a3c6e]"
                          : "border-gray-200 text-gray-600 hover:border-[#1a3c6e] hover:text-[#1a3c6e]"
                      }`}
                    >
                      €{(amt / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Policy term */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Policy term
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {termOptions.map((y) => (
                    <button
                      key={y}
                      onClick={() => setTermYears(y)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                        termYears === y
                          ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                          : "border-gray-200 text-gray-600 hover:border-[#7c3aed] hover:text-[#7c3aed]"
                      }`}
                    >
                      {y}y
                    </button>
                  ))}
                </div>
              </div>

              {/* Age + smoker */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Your age
                  </label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20">
                    {Array.from({ length: 52 }, (_, i) => i + 18).map((age) => (
                      <option key={age}>{age}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Smoking status
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-0.5">
                    {[
                      { id: false, label: "Non-smoker" },
                      { id: true, label: "Smoker" },
                    ].map((opt) => (
                      <button
                        key={String(opt.id)}
                        onClick={() => setSmoker(opt.id)}
                        className={`py-2.5 rounded-xl border text-xs font-medium transition ${
                          smoker === opt.id
                            ? "bg-[#1a3c6e] text-white border-[#1a3c6e]"
                            : "border-gray-200 text-gray-600 hover:border-[#1a3c6e]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimated monthly */}
              <div className="bg-violet-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-violet-600 font-medium">Estimated monthly premium</p>
                  <p className="text-2xl font-extrabold text-violet-800 mt-0.5">
                    ~€{Math.round(
                      ((coverAmount / 100000) * termYears * (smoker ? 1.6 : 1) * 11) / 20
                    )}/mo
                  </p>
                </div>
                <p className="text-xs text-violet-500 max-w-[140px] text-right">
                  Based on €{(coverAmount / 1000).toFixed(0)}K cover for {termYears} years
                </p>
              </div>

              <button
                onClick={() => setStep("results")}
                className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-3.5 rounded-xl transition text-sm"
              >
                Compare Life Insurance Quotes
              </button>
            </div>
          </div>

          {/* Coverage highlights */}
          <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 text-sm mb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-green-500" />
              What life insurance typically covers
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Death benefit (lump sum)",
                "Accidental death (2× benefit)",
                "Total permanent disability",
                "Critical illness riders",
                "Terminal illness advance",
                "Mortgage protection option",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-green-700">
                  <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#7c3aed] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span>Insurance</span> <span className="mx-2">/</span>
            <span className="text-white">Life Insurance</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Life Insurance Estonia</h1>
          <p className="text-white/80">
            {loading ? "Loading..." : `${offers.length} insurers`} · €{(coverAmount / 1000).toFixed(0)}K cover · {termYears} years ·{" "}
            {smoker ? "Smoker" : "Non-smoker"}
          </p>
          <button
            onClick={() => setStep("form")}
            className="mt-3 text-sm text-white/70 hover:text-white underline"
          >
            ← Change search
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar — below on mobile */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Cover summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="font-bold text-[#1a3c6e] text-sm mb-3 flex items-center gap-1.5">
                <Heart size={13} /> Your cover summary
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-600">
                {[
                  { label: "Cover amount", value: `€${coverAmount.toLocaleString()}` },
                  { label: "Policy term", value: `${termYears} years` },
                  { label: "Smoking status", value: smoker ? "Smoker" : "Non-smoker" },
                  { label: "Premium type", value: "Level (fixed)" },
                  { label: "Payout type", value: "Lump sum" },
                ].map((row) => (
                  <li key={row.label} className="flex justify-between">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-semibold text-gray-800">{row.value}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setStep("form")}
                className="mt-3 w-full text-xs text-[#1a3c6e] underline text-center"
              >
                Edit cover
              </button>
            </div>

            <SmartRateWidget onRateChange={handleRateChange} />
            <PersonalizedRecs productType="life" liveEuribor={liveEuribor} />
            <AIProductSection
              productType="life insurance"
              country="Estonia"
              accentGradient="from-[#1a3c6e] to-[#7c3aed]"
            />
          </div>

          {/* Offers — first on mobile */}
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
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

            <AIPageBanner
              productType="life-insurance"
              context={!loading && offers.length > 0 ? `${offers.length} life insurers · From €${Math.min(...offers.map(o => o.representativePremium))}/year` : undefined}
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
              <p className="text-xs text-gray-400 text-center py-4 leading-relaxed">
                Premiums are indicative. Actual premium is subject to medical underwriting, health
                declaration and insurer assessment. All insurers are licensed by Finantsinspektsioon
                (Estonian Financial Supervision Authority). BalticRate is a comparison service — we
                do not sell insurance directly.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
