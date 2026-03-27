"use client";

import { useState, useMemo } from "react";
import { Info, ArrowUpDown } from "lucide-react";
import LoanOfferCard from "@/components/loans/LoanOfferCard";
import LoanCalculator from "@/components/loans/LoanCalculator";
import { mortgageLoans } from "@/data/loans";
import { calculateMonthlyPayment, formatCurrency } from "@/lib/utils";

export default function MortgageContent() {
  const [amount, setAmount] = useState(100000);
  const [termMonths, setTermMonths] = useState(240);
  const [sortBy, setSortBy] = useState<"rate" | "monthly" | "total">("rate");

  const sortedOffers = useMemo(() => {
    return [...mortgageLoans].sort((a, b) => {
      if (sortBy === "rate") return a.representativeRate - b.representativeRate;
      const aM = calculateMonthlyPayment(amount, a.representativeRate, termMonths);
      const bM = calculateMonthlyPayment(amount, b.representativeRate, termMonths);
      return sortBy === "monthly" ? aM - bM : aM * termMonths - bM * termMonths;
    });
  }, [sortBy, amount, termMonths]);

  const bestRate = Math.min(...mortgageLoans.map((l) => l.representativeRate));
  const bestMonthly = calculateMonthlyPayment(amount, bestRate, termMonths);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#4338ca] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span>Loans</span> <span className="mx-2">/</span>
            <span className="text-white">Mortgage</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Mortgage Loans in Estonia</h1>
          <p className="text-white/80">
            Compare {mortgageLoans.length} mortgage offers · Euribor + margin
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="bg-white/15 rounded-lg px-3 py-1.5">
              <span className="text-white/60">Best Rate: </span>
              <span className="font-bold text-green-300">{bestRate}% p.a.</span>
            </div>
            <div className="bg-white/15 rounded-lg px-3 py-1.5">
              <span className="text-white/60">Monthly: </span>
              <span className="font-bold">{formatCurrency(bestMonthly)}/mo</span>
            </div>
            <div className="bg-white/15 rounded-lg px-3 py-1.5">
              <span className="text-white/60">Amount: </span>
              <span className="font-bold">
                {formatCurrency(amount)} · {termMonths / 12} years
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-4">
            <LoanCalculator
              amount={amount}
              setAmount={setAmount}
              termMonths={termMonths}
              setTermMonths={setTermMonths}
              minAmount={20000}
              maxAmount={600000}
              minTerm={60}
              maxTerm={360}
            />
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">Mortgage in Estonia</p>
                  <p>
                    Rates are typically Euribor (6-month) + bank margin. Max LTV is usually 80–85%.
                    Property valuation required.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="font-bold text-[#1a3c6e] text-sm mb-3">Eligibility Requirements</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                {[
                  "Estonian or EU resident",
                  "Stable income history",
                  "Good credit score",
                  "Min. 15–20% down payment",
                  "Property valuation report",
                ].map((req) => (
                  <li key={req} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-600 font-medium">
                <span className="font-bold text-[#1a3c6e]">{sortedOffers.length} offers</span>{" "}
                found
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "rate" | "monthly" | "total")}
                  className="text-sm font-medium text-[#1a3c6e] border-0 bg-transparent cursor-pointer focus:outline-none"
                >
                  <option value="rate">Lowest Rate</option>
                  <option value="monthly">Lowest Monthly</option>
                  <option value="total">Lowest Total</option>
                </select>
              </div>
            </div>

            {sortedOffers.map((offer) => (
              <LoanOfferCard
                key={offer.id}
                offer={offer}
                amount={amount}
                termMonths={termMonths}
              />
            ))}

            <p className="text-xs text-gray-400 text-center py-4 leading-relaxed">
              Mortgage rates are indicative (Euribor 6M + margin). Final rates depend on your
              income, credit history, LTV ratio and property valuation. BalticRate is a comparison
              service — we do not provide loans directly. All banks are supervised by
              Finantsinspektsioon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
