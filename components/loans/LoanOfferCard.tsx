"use client";

import { CheckCircle, Clock, ExternalLink, BarChart2, X, MessageCircle } from "lucide-react";
import { LoanOffer } from "@/data/loans";
import BankLogo from "@/components/ui/BankLogo";
import { calculateMonthlyPayment, formatCurrency, calculateAPR, buildUTMLink } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { useCompare } from "@/contexts/CompareContext";
import { trackApplyClick, trackCompareAdd, trackCompareRemove } from "@/lib/tracker";

interface Props {
  offer: LoanOffer;
  amount: number;
  termMonths: number;
}

const badgeColors: Record<string, string> = {
  "Best Rate": "bg-green-100 text-green-700 border border-green-200",
  "Most Popular": "bg-blue-100 text-blue-700 border border-blue-200",
  "Fast Approval": "bg-orange-100 text-orange-700 border border-orange-200",
};

export default function LoanOfferCard({ offer, amount, termMonths }: Props) {
  const { t } = useTranslation();
  const { add, remove, has, items, MAX } = useCompare();
  const inCompare = has(offer.id);
  const compareFull = !inCompare && items.length >= MAX;

  const clampedAmount = Math.min(Math.max(amount, offer.minAmount), offer.maxAmount);
  const clampedTerm = Math.min(Math.max(termMonths, offer.minTermMonths), offer.maxTermMonths);

  const monthly = calculateMonthlyPayment(clampedAmount, offer.representativeRate, clampedTerm);
  const apr = calculateAPR(clampedAmount, offer.representativeRate, offer.fee, clampedTerm);
  const totalCost = monthly * clampedTerm;

  const isEligible = amount >= offer.minAmount && amount <= offer.maxAmount &&
    termMonths >= offer.minTermMonths && termMonths <= offer.maxTermMonths;

  const applyUrl = buildUTMLink(offer.applyUrl, offer.bankId, offer.type);

  return (
    <div className={`bg-white rounded-2xl border p-5 md:p-6 transition-all hover:shadow-lg ${!isEligible ? "opacity-60" : "border-gray-100 hover:border-[#1a3c6e]/20"}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Bank Info */}
        <div className="flex items-center gap-4 md:w-44 flex-shrink-0">
          <BankLogo bankId={offer.bankId} name={offer.bankName} size={56} />
          <div>
            <p className="font-bold text-gray-900">{offer.bankName}</p>
            {offer.badge && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColors[offer.badge] || "bg-gray-100 text-gray-600"}`}>
                {offer.badge}
              </span>
            )}
            <div className="flex items-center gap-1 mt-1">
              <Clock size={11} className="text-gray-400" />
              <span className="text-xs text-gray-400">{offer.processingTime}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:flex md:flex-1 gap-3 md:gap-0">
          <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
            <p className="text-xs text-gray-400 mb-0.5">{t.loans.interestRate}</p>
            <p className="text-lg font-extrabold text-[#1a3c6e]">{offer.representativeRate}%</p>
            <p className="text-xs text-gray-400">{t.loans.perYear}</p>
          </div>
          <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
            <p className="text-xs text-gray-400 mb-0.5">{t.loans.monthly}</p>
            <p className="text-lg font-extrabold text-gray-900">{formatCurrency(monthly)}</p>
            <p className="text-xs text-gray-400">{t.loans.perMonth}</p>
          </div>
          <div className="md:flex-1 md:border-l md:border-gray-100 md:pl-5">
            <p className="text-xs text-gray-400 mb-0.5">{t.loans.apr}</p>
            <p className="text-lg font-extrabold text-gray-900">{apr}%</p>
            <p className="text-xs text-gray-400">total cost rate</p>
          </div>
          <div className="hidden md:block md:flex-1 md:border-l md:border-gray-100 md:pl-5">
            <p className="text-xs text-gray-400 mb-0.5">{t.loans.totalCost}</p>
            <p className="text-lg font-extrabold text-gray-900">{formatCurrency(totalCost)}</p>
            <p className="text-xs text-gray-400">over {clampedTerm} mo</p>
          </div>
        </div>

        {/* CTA */}
        <div className="md:w-36 flex-shrink-0 space-y-2">
          {isEligible ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => trackApplyClick(offer.id, offer.type)}
              className="w-full flex items-center justify-center gap-1.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-2.5 rounded-xl transition text-sm"
            >
              {t.loans.applyNow}
              <ExternalLink size={13} />
            </a>
          ) : (
            <div className="text-xs text-gray-400 text-center bg-gray-50 rounded-xl py-2.5 px-2">
              Adjust amount/term
            </div>
          )}
          {/* Compare toggle — secondary style, clearly distinct from Apply */}
          <button
            disabled={compareFull}
            onClick={() => {
              if (inCompare) {
                remove(offer.id);
                trackCompareRemove(offer.id, offer.type);
              } else {
                add({
                  id: offer.id,
                  type: "loan",
                  name: offer.bankName,
                  logo: offer.bankLogo,
                  logoId: offer.bankId,
                  applyUrl: applyUrl,
                  rawRate: offer.representativeRate,
                  rawMonthly: monthly,
                  metrics: [
                    { label: "Interest Rate", value: `${offer.representativeRate}%` },
                    { label: "Monthly Payment", value: formatCurrency(monthly) },
                    { label: "APR", value: `${apr}%` },
                    { label: "Total Cost", value: formatCurrency(totalCost) },
                    { label: "Processing Time", value: offer.processingTime },
                    { label: "Setup Fee", value: offer.fee === 0 ? "None" : formatCurrency(offer.fee) },
                    { label: "Min Amount", value: formatCurrency(offer.minAmount) },
                    { label: "Max Amount", value: formatCurrency(offer.maxAmount) },
                  ],
                });
                trackCompareAdd(offer.id, offer.type);
              }
            }}
            className={`w-full flex items-center justify-center gap-1.5 font-medium py-2 rounded-xl transition text-xs border ${
              inCompare
                ? "bg-slate-700 text-white border-slate-700"
                : compareFull
                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {inCompare ? <><X size={11} /> In Compare</> : <><BarChart2 size={11} /> {compareFull ? "Compare Full" : "Add to Compare"}</>}
          </button>
          {/* Ask AI */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('ask-ai-product', {
                detail: { message: `Tell me about ${offer.bankName} personal loan — ${offer.representativeRate}% APR, monthly €${Math.round(monthly)}. Is it a good deal for my situation?` }
              }));
            }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 py-1.5 rounded-xl hover:bg-violet-50 transition"
          >
            <MessageCircle size={11} /> Ask AI about this
          </button>
          <p className="text-xs text-center text-gray-400">
            {offer.fee > 0 ? `Setup fee: ${formatCurrency(offer.fee)}` : t.loans.noSetupFee}
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-x-4 gap-y-1">
        {offer.features.slice(0, 4).map((feat) => (
          <div key={feat} className="flex items-center gap-1.5 text-xs text-gray-600">
            <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
            {feat}
          </div>
        ))}
      </div>
    </div>
  );
}
