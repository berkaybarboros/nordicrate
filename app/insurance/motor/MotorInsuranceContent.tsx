"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, AlertCircle, CheckCircle } from "lucide-react";
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

export default function MotorInsuranceContent() {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");
  const [carYear, setCarYear] = useState("2019");
  const [step, setStep] = useState<"form" | "results">("form");
  const [offers, setOffers] = useState<InsuranceOffer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = useCallback(() => {
    setLoading(true);
    fetch(`/api/insurance/motor?sort=${sortBy === "price" ? "price" : "name"}`)
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
        <div className="bg-gradient-to-r from-[#1a3c6e] to-[#ea580c] text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
              <span>{t.common.home}</span> <span className="mx-2">/</span>
              <span>{t.nav.insurance}</span> <span className="mx-2">/</span>
              <span className="text-white">{t.nav.motorInsurance}</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{t.insurance.motorTitle}</h1>
            <p className="text-white/80">
              Mandatory liability insurance · Compare all Estonian insurers
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">{t.insurance.requiredByLaw}</p>
              <p className="text-red-700 text-xs mt-0.5">
                All vehicles in Estonia must have valid motor insurance (liikluskindlustus). Driving
                without it can result in fines.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#1a3c6e] mb-5">{t.insurance.enterVehicle}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t.insurance.vehicleMake}
                  </label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20">
                    <option>Toyota</option>
                    <option>Volkswagen</option>
                    <option>BMW</option>
                    <option>Mercedes</option>
                    <option>Audi</option>
                    <option>Ford</option>
                    <option>Opel</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t.insurance.yearOfManufacture}
                  </label>
                  <select
                    value={carYear}
                    onChange={(e) => setCarYear(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20"
                  >
                    {Array.from({ length: 25 }, (_, i) => 2024 - i).map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.insurance.regNumber}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123 ABC"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Used to verify vehicle details from ARK register
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.insurance.dob}
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.insurance.period}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["3 months", "6 months", "12 months"].map((period) => (
                    <button
                      key={period}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                        period === "12 months"
                          ? "bg-[#1a3c6e] text-white border-[#1a3c6e]"
                          : "border-gray-200 text-gray-600 hover:border-[#1a3c6e] hover:text-[#1a3c6e]"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep("results")}
                className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-3.5 rounded-xl transition text-sm mt-2"
              >
                {t.insurance.compare}
              </button>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4">
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#ea580c] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{t.insurance.motorTitle}</h1>
          <p className="text-white/80">
            {loading ? "Loading..." : `${offers.length} ${t.insurance.plans}`} ·{" "}
            {t.insurance.comparingFor} {carYear}
          </p>
          <button
            onClick={() => setStep("form")}
            className="mt-3 text-sm text-white/70 hover:text-white underline"
          >
            {t.insurance.back}
          </button>
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

        <p className="text-xs text-gray-400 text-center py-4">
          Premiums are indicative based on provided vehicle details. Final price confirmed upon
          application. All insurers are licensed by Finantsinspektsioon (Estonian Financial
          Supervision Authority). BalticRate is a comparison service.
        </p>
      </div>
    </div>
  );
}
