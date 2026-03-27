"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Info, ArrowUpDown, Bell } from "lucide-react";
import LoanOfferCard from "@/components/loans/LoanOfferCard";
import LoanCalculator from "@/components/loans/LoanCalculator";
import RateAlertModal from "@/components/alerts/RateAlertModal";
import { formatCurrency, calculateMonthlyPayment } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import type { LoanOffer } from "@/data/loans";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4 md:w-44">
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
              <div className="h-3 w-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="md:w-36 space-y-2">
          <div className="h-10 bg-gray-200 rounded-xl" />
          <div className="h-3 w-20 bg-gray-100 rounded mx-auto" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50 flex gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-3 w-24 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}

function PersonalLoansInner() {
  const params = useSearchParams();
  const { t } = useTranslation();
  const [amount, setAmount] = useState(Number(params.get("amount")) || 5000);
  const [termMonths, setTermMonths] = useState(Number(params.get("term")) || 36);
  const [sortBy, setSortBy] = useState<"rate" | "monthly" | "total">("rate");
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);

  const fetchOffers = useCallback(() => {
    setLoading(true);
    fetch(`/api/loans/personal?amount=${amount}&term=${termMonths}&sort=${sortBy}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.loans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [amount, termMonths, sortBy]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const bestRate = offers.length > 0 ? Math.min(...offers.map((l) => l.representativeRate)) : 0;
  const bestMonthly = bestRate > 0 ? calculateMonthlyPayment(amount, bestRate, termMonths) : 0;

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#2563eb] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>{t.common.home}</span> <span className="mx-2">/</span>
            <span>{t.nav.loans}</span> <span className="mx-2">/</span>
            <span className="text-white">{t.nav.personalLoans}</span>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{t.loans.personalTitle}</h1>
              <p className="text-white/80">
                {loading ? "Loading..." : `${offers.length} ${t.loans.offersFound}`} · Updated today
              </p>
            </div>
            <button
              onClick={() => setAlertOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition mt-1"
            >
              <Bell size={13} />
              Rate Alert
            </button>
          </div>
          {!loading && bestRate > 0 && (
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="bg-white/15 rounded-lg px-3 py-1.5">
                <span className="text-white/60">{t.loans.bestRate}: </span>
                <span className="font-bold text-green-300">{bestRate}% p.a.</span>
              </div>
              <div className="bg-white/15 rounded-lg px-3 py-1.5">
                <span className="text-white/60">{t.loans.lowestMonthlyLabel}: </span>
                <span className="font-bold">{formatCurrency(bestMonthly)}/mo</span>
              </div>
              <div className="bg-white/15 rounded-lg px-3 py-1.5">
                <span className="text-white/60">Amount: </span>
                <span className="font-bold">
                  {formatCurrency(amount)} · {termMonths} {t.common.months}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <LoanCalculator
              amount={amount}
              setAmount={setAmount}
              termMonths={termMonths}
              setTermMonths={setTermMonths}
            />
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">How rates are calculated</p>
                  <p>
                    Rates shown are representative APRs. Your actual rate depends on your credit
                    score and income.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="font-bold text-[#1a3c6e] text-sm mb-3">{t.loans.eligibility}</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                {[
                  "Estonian or EU resident",
                  "Age 18+",
                  "Regular income",
                  "No active defaults",
                  "Valid ID",
                ].map((req) => (
                  <li key={req} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main: Offers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-600 font-medium">
                <span className="font-bold text-[#1a3c6e]">
                  {loading ? "..." : offers.length} {t.loans.offersFound}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">{t.loans.sortBy}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "rate" | "monthly" | "total")}
                  className="text-sm font-medium text-[#1a3c6e] border-0 bg-transparent cursor-pointer focus:outline-none"
                >
                  <option value="rate">{t.loans.lowestRate}</option>
                  <option value="monthly">{t.loans.lowestMonthly}</option>
                  <option value="total">{t.loans.lowestTotal}</option>
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

            {!loading &&
              offers.map((offer) => (
                <LoanOfferCard
                  key={offer.id}
                  offer={offer}
                  amount={amount}
                  termMonths={termMonths}
                />
              ))}

            {!loading && offers.length > 0 && (
              <p className="text-xs text-gray-400 text-center py-4 leading-relaxed">
                Representative example: Borrowing {formatCurrency(amount)} over {termMonths} months
                at {bestRate}% p.a. gives a monthly payment of {formatCurrency(bestMonthly)}. Total
                repayable: {formatCurrency(bestMonthly * termMonths)}. Rates subject to individual
                creditworthiness assessment. BalticRate is a comparison service — we do not provide
                loans directly.
              </p>
            )}
          </div>
        </div>
      </div>

      <RateAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        defaultProduct="personal-loan"
        defaultRate={bestRate || undefined}
      />
    </div>
  );
}

export default function PersonalLoansContent() {
  return (
    <Suspense>
      <PersonalLoansInner />
    </Suspense>
  );
}
