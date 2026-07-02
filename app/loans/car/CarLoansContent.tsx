"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
import LoanOfferCard from "@/components/loans/LoanOfferCard";
import LoanCalculator from "@/components/loans/LoanCalculator";
import SmartRateWidget from "@/components/SmartRateWidget";
import PersonalizedRecs from "@/components/PersonalizedRecs";
import { carLoans } from "@/data/loans";
import { calculateMonthlyPayment, formatCurrency } from "@/lib/utils";
import SocialProofBar from "@/components/SocialProofBar";

const SS_AMOUNT = 'car-loan-amount';
const SS_TERM   = 'car-loan-term';
const SS_DP     = 'car-loan-dp';

export default function CarLoansContent() {
  const [amount, setAmount] = useState(15000);
  const [termMonths, setTermMonths] = useState(48);
  const [downPayment, setDownPayment] = useState(0);
  const [sortBy, setSortBy] = useState<"rate" | "monthly" | "total">("rate");
  const [liveEuribor, setLiveEuribor] = useState<number | null>(null);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const a = Number(sessionStorage.getItem(SS_AMOUNT));
    const t = Number(sessionStorage.getItem(SS_TERM));
    const d = Number(sessionStorage.getItem(SS_DP));
    if (a) setAmount(a);
    if (t) setTermMonths(t);
    if (d) setDownPayment(d);
  }, []);

  // Persist to sessionStorage on change
  useEffect(() => { sessionStorage.setItem(SS_AMOUNT, String(amount)); }, [amount]);
  useEffect(() => { sessionStorage.setItem(SS_TERM, String(termMonths)); }, [termMonths]);
  useEffect(() => { sessionStorage.setItem(SS_DP, String(downPayment)); }, [downPayment]);

  const netAmount = Math.max(0, amount - downPayment);

  const handleRateChange = useCallback((rates: import("@/components/SmartRateWidget").RateEntry[]) => {
    const e3m = rates.find(r => r.key === 'euribor3m');
    if (e3m) setLiveEuribor(e3m.rate);
  }, []);

  const sortedOffers = useMemo(() => {
    return [...carLoans].sort((a, b) => {
      if (sortBy === "rate") return a.representativeRate - b.representativeRate;
      const aM = calculateMonthlyPayment(netAmount, a.representativeRate, termMonths);
      const bM = calculateMonthlyPayment(netAmount, b.representativeRate, termMonths);
      return sortBy === "monthly" ? aM - bM : aM * termMonths - bM * termMonths;
    });
  }, [sortBy, netAmount, termMonths]);

  const bestRate = Math.min(...carLoans.map((l) => l.representativeRate));
  const bestMonthly = calculateMonthlyPayment(netAmount, bestRate, termMonths);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#7c3aed] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span>Loans</span> <span className="mx-2">/</span>
            <span className="text-white">Car Loans</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Car Loans in Estonia</h1>
          <p className="text-white/80">
            Compare {carLoans.length} offers for new & used vehicles · From {bestRate}% p.a.
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
              minAmount={3000}
              maxAmount={60000}
              minTerm={12}
              maxTerm={84}
              showDownPayment={true}
              downPayment={downPayment}
              setDownPayment={setDownPayment}
            />
            <SmartRateWidget onRateChange={handleRateChange} />
            <PersonalizedRecs
              productType="car"
              amount={netAmount}
              termMonths={termMonths}
              liveEuribor={liveEuribor}
            />
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="font-bold text-[#1a3c6e] text-sm mb-3">Eligibility Requirements</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                {[
                  "Estonian or EU resident",
                  "Age 18+",
                  "Valid driving licence",
                  "Regular income",
                  "Vehicle not older than 15 years",
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
            <SocialProofBar productType="loan" />
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
                amount={netAmount}
                termMonths={termMonths}
              />
            ))}

            <p className="text-xs text-gray-400 text-center py-4 leading-relaxed">
              Car loan rates are indicative APRs. Final rate depends on vehicle age, credit history
              and income. BalticRate is a comparison service — we do not provide loans directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
