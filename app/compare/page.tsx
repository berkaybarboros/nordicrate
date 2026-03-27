"use client";

import { useCompare, CompareItem } from "@/contexts/CompareContext";
import { BarChart2, X, ExternalLink, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

// Return the index of the "best" (min) value among numeric raw values
function bestIndex(items: CompareItem[], key: keyof CompareItem): number {
  const values = items.map((it) => (it[key] as number | undefined) ?? Infinity);
  const min = Math.min(...values);
  return values.indexOf(min);
}

function bestIndexMax(items: CompareItem[], key: keyof CompareItem): number {
  const values = items.map((it) => (it[key] as number | undefined) ?? -Infinity);
  const max = Math.max(...values);
  return values.indexOf(max);
}

export default function ComparePage() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) {
    return (
      <div className="bg-[#f8fafc] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BarChart2 size={64} className="mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-extrabold text-[#1a3c6e] mb-2">
            No items to compare yet
          </h1>
          <p className="text-gray-500 mb-6">
            Browse loans, insurance or deposits and click{" "}
            <span className="font-semibold text-[#1a3c6e]">+ Compare</span> to add up to 3 items.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/loans/personal"
              className="bg-[#1a3c6e] text-white font-bold rounded-xl px-5 py-2.5 hover:bg-[#152e55] transition"
            >
              Personal Loans
            </Link>
            <Link
              href="/insurance/motor"
              className="bg-[#1a3c6e] text-white font-bold rounded-xl px-5 py-2.5 hover:bg-[#152e55] transition"
            >
              Motor Insurance
            </Link>
            <Link
              href="/deposits"
              className="bg-[#1a3c6e] text-white font-bold rounded-xl px-5 py-2.5 hover:bg-[#152e55] transition"
            >
              Deposits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine comparison type from first item
  const type = items[0].type;

  // Build metric rows dynamically from first item's metrics
  const metricLabels = items[0].metrics.map((m) => m.label);

  // Pick "best" column for numeric metrics
  const rateIdx = type === "deposit" ? bestIndexMax(items, "rawRate") : bestIndex(items, "rawRate");
  const monthlyIdx = bestIndex(items, "rawMonthly");
  const premiumIdx = bestIndex(items, "rawPremium");
  const interestIdx = bestIndexMax(items, "rawInterest");
  const totalIdx = bestIndexMax(items, "rawTotal");

  const bestMap: Record<string, number> = {
    "Interest Rate": rateIdx,
    "Rate p.a.": rateIdx,
    "Representative Rate": rateIdx,
    "Annual Rate": rateIdx,
    "Monthly Payment": monthlyIdx,
    "Monthly Premium": premiumIdx,
    "Annual Premium": premiumIdx,
    "You Earn": interestIdx,
    "Total at Maturity": totalIdx,
  };

  const colColors = ["#1a3c6e", "#b45309", "#16a34a"];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#b45309] text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Link
            href={
              type === "loan"
                ? "/loans/personal"
                : type === "insurance"
                ? "/insurance/motor"
                : "/deposits"
            }
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition"
          >
            <ArrowLeft size={14} /> Back to results
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-1 flex items-center gap-2">
                <BarChart2 size={28} />
                Side-by-Side Comparison
              </h1>
              <p className="text-white/80">
                Comparing {items.length} {type}
                {items.length > 1 ? "s" : ""} ·{" "}
                <button
                  onClick={clear}
                  className="underline text-white/60 hover:text-white transition text-sm"
                >
                  Clear all
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Product header row */}
        <div
          className="grid gap-3 mb-1"
          style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}
        >
          <div />
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border p-4 text-center relative"
              style={{ borderColor: colColors[idx] + "33" }}
            >
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition"
                aria-label="Remove"
              >
                <X size={14} />
              </button>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mx-auto mb-2 border"
                style={{ borderColor: colColors[idx] + "44", backgroundColor: colColors[idx] + "0A" }}
              >
                {item.logo}
              </div>
              <p className="font-bold text-gray-900 text-sm">{item.name}</p>
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 capitalize"
                style={{
                  backgroundColor: colColors[idx] + "1A",
                  color: colColors[idx],
                }}
              >
                {item.type}
              </span>
            </div>
          ))}
        </div>

        {/* Metric rows */}
        {metricLabels.map((label, mIdx) => {
          const bestCol = bestMap[label];
          return (
            <div
              key={label}
              className={`grid gap-3 mb-1 items-center ${
                mIdx % 2 === 0 ? "bg-white" : "bg-white/60"
              } rounded-xl`}
              style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}
            >
              {/* Row label */}
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {label}
                </p>
              </div>

              {/* Values */}
              {items.map((item, colIdx) => {
                const metric = item.metrics[mIdx];
                const isBest = bestCol === colIdx && items.length > 1;
                const rawVal = metric?.value ?? "—";
                const isCheck =
                  rawVal === "Yes" ||
                  rawVal === "✓" ||
                  rawVal === "Instant";
                const isCross = rawVal === "No";

                return (
                  <div key={item.id} className="px-4 py-3 text-center">
                    {isCheck ? (
                      <CheckCircle size={18} className="text-green-500 mx-auto" />
                    ) : isCross ? (
                      <XCircle size={18} className="text-red-400 mx-auto" />
                    ) : (
                      <p
                        className={`font-extrabold text-lg ${
                          isBest ? "text-green-600" : "text-gray-900"
                        }`}
                      >
                        {String(rawVal)}
                        {isBest && (
                          <span className="ml-1 text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full align-middle">
                            BEST
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* CTA row */}
        <div
          className="grid gap-3 mt-4 items-center"
          style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}
        >
          <div className="px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Apply</p>
          </div>
          {items.map((item, idx) => (
            <div key={item.id} className="px-2 py-2 text-center">
              <a
                href={item.applyUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 font-bold text-sm text-white rounded-xl px-4 py-2.5 transition w-full justify-center"
                style={{ backgroundColor: colColors[idx] }}
              >
                {item.type === "insurance" ? "Get Quote" : item.type === "deposit" ? "Open Deposit" : "Apply Now"}
                <ExternalLink size={13} />
              </a>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed max-w-2xl mx-auto">
          Rates and premiums shown are representative examples. Final rates depend on your credit
          profile and the provider&apos;s assessment. BalticRate is a comparison service — we do not
          provide financial products directly.
        </p>
      </div>
    </div>
  );
}
