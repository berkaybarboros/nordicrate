"use client";

import { useState, useEffect, useCallback } from "react";
import { PiggyBank, Lock, TrendingUp, ExternalLink, BarChart2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { useCompare } from "@/contexts/CompareContext";

interface DepositOffer {
  id: string;
  bankId: string;
  bankName: string;
  bankLogo: string;
  minAmount: number;
  maxAmount: number;
  termOptions: number[];
  rates: Record<number, number>;
  features: string[];
  badge?: string;
  applyUrl: string;
  websiteUrl: string;
  rate: number;
  interest: number;
  totalAtMaturity: number;
}

function SkeletonDepositCard() {
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
              <div className="h-8 w-24 bg-gray-200 rounded" />
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

export default function DepositsContent() {
  const { t } = useTranslation();
  const { add, remove, has, items, MAX } = useCompare();
  const [amount, setAmount] = useState(10000);
  const [selectedTerm, setSelectedTerm] = useState(12);
  const [offers, setOffers] = useState<DepositOffer[]>([]);
  const [allTerms, setAllTerms] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const amountPercent = ((amount - 500) / (1000000 - 500)) * 100;

  const fetchDeposits = useCallback(() => {
    setLoading(true);
    fetch(`/api/deposits?amount=${amount}&term=${selectedTerm}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.deposits || []);
        if (data.allTerms) setAllTerms(data.allTerms);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [amount, selectedTerm]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#b45309] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-sm text-white/60 mb-3">
            <span>{t.common.home}</span> <span className="mx-2">/</span>
            <span className="text-white">{t.nav.deposits}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{t.deposits.title}</h1>
          <p className="text-white/80">{t.deposits.subtitle}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { icon: Lock, text: "€100k DGSD protection" },
              { icon: TrendingUp, text: "Up to 4.3% p.a." },
              { icon: PiggyBank, text: "Guaranteed returns" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-sm"
              >
                <Icon size={13} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Calculator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-bold text-[#1a3c6e] mb-5">{t.deposits.calculate}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  {t.deposits.depositAmount}
                </label>
                <span className="text-[#f97316] font-bold text-lg">{formatCurrency(amount)}</span>
              </div>
              <input
                type="range"
                min={500}
                max={1000000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ "--value": `${amountPercent}%` } as React.CSSProperties}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>€500</span>
                <span>€1,000,000</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-3">
                {[5000, 10000, 25000, 50000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`text-xs py-1.5 rounded-lg font-medium transition ${
                      amount === val
                        ? "bg-[#1a3c6e] text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-blue-50"
                    }`}
                  >
                    {formatCurrency(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Term */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t.deposits.depositTerm}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(allTerms.length > 0 ? allTerms : [1, 3, 6, 12, 18, 24, 36, 48, 60]).map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setSelectedTerm(term)}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                        selectedTerm === term
                          ? "bg-[#1a3c6e] text-white shadow-md"
                          : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-[#1a3c6e]"
                      }`}
                    >
                      {term}m
                    </button>
                  )
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {t.deposits.selected}:{" "}
                <span className="font-semibold text-gray-600">
                  {selectedTerm} {t.deposits.months} ({(selectedTerm / 12).toFixed(1)} years)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1a3c6e]">
              {loading ? "..." : offers.length} {t.deposits.banksOffer}{" "}
              {selectedTerm}-{t.deposits.monthDeposits}
            </h3>
            <span className="text-sm text-gray-500">{t.deposits.sortedBy}</span>
          </div>

          {loading && (
            <>
              <SkeletonDepositCard />
              <SkeletonDepositCard />
              <SkeletonDepositCard />
            </>
          )}

          {!loading &&
            offers.map((offer, idx) => (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl border p-5 md:p-6 hover:shadow-lg transition-all ${
                  idx === 0 ? "border-amber-200 ring-1 ring-amber-200" : "border-gray-100"
                }`}
              >
                {idx === 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-3">
                    <TrendingUp size={12} />
                    {t.deposits.highestRateFor} {selectedTerm} {t.deposits.months.toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Bank */}
                  <div className="flex items-center gap-4 md:w-44 flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-3xl border border-gray-100">
                      {offer.bankLogo}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{offer.bankName}</p>
                      {offer.badge && (
                        <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          {offer.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 md:flex md:flex-1 gap-3 md:gap-0">
                    <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
                      <p className="text-xs text-gray-400 mb-0.5">{t.deposits.interestRate}</p>
                      <p className="text-2xl font-extrabold text-[#1a3c6e]">{offer.rate}%</p>
                      <p className="text-xs text-gray-400">{t.deposits.perYear}</p>
                    </div>
                    <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
                      <p className="text-xs text-gray-400 mb-0.5">{t.deposits.youEarn}</p>
                      <p className="text-2xl font-extrabold text-green-600">
                        +{formatCurrency(offer.interest)}
                      </p>
                      <p className="text-xs text-gray-400">
                        in {selectedTerm} {t.deposits.months}
                      </p>
                    </div>
                    <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
                      <p className="text-xs text-gray-400 mb-0.5">{t.deposits.totalAtMaturity}</p>
                      <p className="text-2xl font-extrabold text-gray-900">
                        {formatCurrency(offer.totalAtMaturity)}
                      </p>
                      <p className="text-xs text-gray-400">{t.deposits.guaranteed}</p>
                    </div>
                  </div>

                  {/* CTA — <a> with real link */}
                  <div className="md:w-36 flex-shrink-0 space-y-1">
                    <a
                      href={offer.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="w-full flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-2.5 rounded-xl transition text-sm"
                    >
                      {t.deposits.openDeposit}
                      <ExternalLink size={13} />
                    </a>
                    {/* Compare toggle */}
                    {(() => {
                      const inCompare = has(offer.id);
                      const compareFull = !inCompare && items.length >= MAX;
                      return (
                        <button
                          disabled={compareFull}
                          onClick={() =>
                            inCompare
                              ? remove(offer.id)
                              : add({
                                  id: offer.id,
                                  type: "deposit",
                                  name: offer.bankName,
                                  logo: offer.bankLogo,
                                  applyUrl: offer.applyUrl,
                                  rawRate: offer.rate,
                                  rawInterest: offer.interest,
                                  rawTotal: offer.totalAtMaturity,
                                  metrics: [
                                    { label: "Rate p.a.", value: `${offer.rate}%` },
                                    { label: "You Earn", value: formatCurrency(offer.interest) },
                                    { label: "Total at Maturity", value: formatCurrency(offer.totalAtMaturity) },
                                    { label: "Min. Amount", value: formatCurrency(offer.minAmount) },
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
                            <><X size={11} /> Remove</>
                          ) : (
                            <><BarChart2 size={11} /> {compareFull ? "Compare Full" : "+ Compare"}</>
                          )}
                        </button>
                      );
                    })()}
                    <p className="text-xs text-center text-gray-400">
                      ↗ Opens bank&apos;s website
                    </p>
                    <p className="text-xs text-center text-gray-400">
                      {t.deposits.min} {formatCurrency(offer.minAmount)}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-x-4 gap-y-1">
                  {offer.features.map((f: string) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {!loading && offers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <PiggyBank size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No banks offer {selectedTerm}-month deposits. Try a different term.</p>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center py-4 leading-relaxed">
            All deposits are covered by the Estonian Guarantee Fund (DGSD) up to €100,000 per
            depositor per bank. Interest rates are annual gross rates before tax (20% income tax
            applies to interest income in Estonia). BalticRate is a comparison service — we do not
            accept deposits directly.
          </p>
        </div>
      </div>
    </div>
  );
}
