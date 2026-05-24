"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, CheckCircle, Globe, Plane, ShieldCheck } from "lucide-react";
import InsuranceOfferCard from "@/components/insurance/InsuranceOfferCard";
import AIProductSection from "@/components/AIProductSection";
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

const tripTypes = [
  { id: "annual", label: "Annual Multi-trip", desc: "Unlimited trips/year" },
  { id: "single", label: "Single Trip", desc: "One journey" },
  { id: "longstay", label: "Long Stay", desc: "90+ days abroad" },
];

const destinations = [
  { id: "europe", label: "Europe" },
  { id: "worldwide", label: "Worldwide" },
  { id: "worldwide_us", label: "Worldwide incl. USA/Canada" },
];

export default function TravelInsuranceContent() {
  const [sortBy, setSortBy] = useState<"price" | "name">("price");
  const [tripType, setTripType] = useState("annual");
  const [destination, setDestination] = useState("europe");
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
    fetch(`/api/insurance/travel?sort=${sortBy}`)
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
        <div className="bg-gradient-to-r from-[#1a3c6e] to-[#0ea5e9] text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
              <span>Home</span> <span className="mx-2">/</span>
              <span>Insurance</span> <span className="mx-2">/</span>
              <span className="text-white">Travel Insurance</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <Plane size={28} className="text-white/80" />
              <h1 className="text-2xl md:text-3xl font-extrabold">Travel Insurance Estonia</h1>
            </div>
            <p className="text-white/80">
              reisikindlustus — Compare all major Estonian insurers · Annual from €49/year
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Info banner */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Globe size={18} className="text-sky-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sky-800 text-sm">Schengen visa requirement</p>
              <p className="text-sky-700 text-xs mt-0.5">
                If applying for a Schengen visa, you need minimum €30,000 medical cover. All plans
                shown exceed this limit.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#1a3c6e] mb-5">Find your travel cover</h2>
            <div className="space-y-5">
              {/* Trip type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type of cover
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {tripTypes.map((tt) => (
                    <button
                      key={tt.id}
                      onClick={() => setTripType(tt.id)}
                      className={`py-3 px-2 rounded-xl border text-xs font-medium transition text-center ${
                        tripType === tt.id
                          ? "bg-[#1a3c6e] text-white border-[#1a3c6e]"
                          : "border-gray-200 text-gray-600 hover:border-[#1a3c6e] hover:text-[#1a3c6e]"
                      }`}
                    >
                      <span className="block font-semibold">{tt.label}</span>
                      <span className="block text-[10px] opacity-70 mt-0.5">{tt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {destinations.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDestination(d.id)}
                      className={`py-2.5 rounded-xl border text-xs font-medium transition ${
                        destination === d.id
                          ? "bg-[#0ea5e9] text-white border-[#0ea5e9]"
                          : "border-gray-200 text-gray-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travellers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Number of travellers
                  </label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20">
                    <option>1 — Solo</option>
                    <option>2 — Couple</option>
                    <option>Family (2 adults + children)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Oldest traveller age
                  </label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20">
                    {["18–30", "31–40", "41–50", "51–60", "61–70", "71+"].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep("results")}
                className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-3.5 rounded-xl transition text-sm mt-2"
              >
                Compare Travel Insurance Plans
              </button>
            </div>
          </div>

          {/* What's covered */}
          <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 text-sm mb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-green-500" />
              Standard cover included in all plans
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Emergency medical up to €1M",
                "Medical evacuation & repatriation",
                "Trip cancellation & curtailment",
                "Baggage loss/damage/delay",
                "Travel delay compensation",
                "24/7 emergency assistance",
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
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#0ea5e9] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span>Insurance</span> <span className="mx-2">/</span>
            <span className="text-white">Travel Insurance</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Travel Insurance Estonia</h1>
          <p className="text-white/80">
            {loading ? "Loading..." : `${offers.length} plans`} ·{" "}
            {tripTypes.find((t) => t.id === tripType)?.label} ·{" "}
            {destinations.find((d) => d.id === destination)?.label}
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
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick facts */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="font-bold text-[#1a3c6e] text-sm mb-3 flex items-center gap-1.5">
                <Plane size={13} /> Travel Insurance Guide
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-600">
                {[
                  { label: "Medical cover", value: "€500K–€1M" },
                  { label: "Cancellation limit", value: "Up to €3,000" },
                  { label: "Baggage cover", value: "Up to €2,000" },
                  { label: "Delay compensation", value: "From 4 hours" },
                  { label: "Schengen minimum", value: "€30,000 ✓" },
                ].map((row) => (
                  <li key={row.label} className="flex justify-between">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-semibold text-gray-800">{row.value}</span>
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

          {/* Offers */}
          <div className="space-y-4">
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
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

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
                Premiums shown are indicative annual prices. Exact premium depends on trip duration,
                age, destination and declared activities. All insurers are licensed by
                Finantsinspektsioon. BalticRate is a comparison service — we do not sell insurance
                directly.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
