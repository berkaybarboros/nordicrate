"use client";

import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

interface Props {
  amount: number;
  setAmount: (v: number) => void;
  termMonths: number;
  setTermMonths: (v: number) => void;
  minAmount?: number;
  maxAmount?: number;
  minTerm?: number;
  maxTerm?: number;
}

export default function LoanCalculator({
  amount, setAmount, termMonths, setTermMonths,
  minAmount = 500, maxAmount = 30000, minTerm = 6, maxTerm = 84,
}: Props) {
  const { t } = useTranslation();
  const amountPercent = ((amount - minAmount) / (maxAmount - minAmount)) * 100;
  const termPercent = ((termMonths - minTerm) / (maxTerm - minTerm)) * 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="font-bold text-[#1a3c6e] mb-4 text-sm uppercase tracking-wide">
        {t.loans.adjustLoan}
      </h3>

      {/* Amount */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-gray-700">{t.loans.loanAmount}</label>
          <span className="text-[#f97316] font-bold">{formatCurrency(amount)}</span>
        </div>
        <input
          type="range"
          min={minAmount}
          max={maxAmount}
          step={500}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ "--value": `${amountPercent}%` } as React.CSSProperties}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatCurrency(minAmount)}</span>
          <span>{formatCurrency(maxAmount)}</span>
        </div>
      </div>

      {/* Term */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-gray-700">{t.loans.loanTerm}</label>
          <span className="text-[#f97316] font-bold">{termMonths} {t.common.months}</span>
        </div>
        <input
          type="range"
          min={minTerm}
          max={maxTerm}
          step={6}
          value={termMonths}
          onChange={(e) => setTermMonths(Number(e.target.value))}
          style={{ "--value": `${termPercent}%` } as React.CSSProperties}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{minTerm} mo</span>
          <span>{maxTerm} mo</span>
        </div>
      </div>

      {/* Quick select buttons */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Quick select amount:</p>
        <div className="grid grid-cols-4 gap-1.5">
          {[1000, 3000, 5000, 10000, 15000, 20000, 25000, 30000].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={`text-xs py-1.5 rounded-lg font-medium transition ${
                amount === val
                  ? "bg-[#1a3c6e] text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-[#1a3c6e]"
              }`}
            >
              {formatCurrency(val)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
