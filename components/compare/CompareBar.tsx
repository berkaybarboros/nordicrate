"use client";

import { X, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCompare } from "@/contexts/CompareContext";

export default function CompareBar() {
  const { items, remove, clear, MAX } = useCompare();

  if (items.length === 0) return null;

  const typeLabel = {
    loan: "Loan",
    insurance: "Insurance",
    deposit: "Deposit",
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-5xl mx-auto px-4 pb-4 pointer-events-auto">
        <div className="bg-[#1a3c6e] text-white rounded-2xl shadow-2xl border border-white/10 px-4 py-3 flex items-center gap-3">

          {/* Icon + label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <BarChart2 size={18} className="text-[#f97316]" />
            <span className="text-sm font-bold hidden sm:block">Compare</span>
          </div>

          {/* Slots */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto min-w-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 flex-shrink-0 group"
              >
                <span className="text-lg leading-none">{item.logo}</span>
                <span className="text-xs font-semibold max-w-[80px] truncate">{item.name}</span>
                <span className="text-xs text-white/50 hidden sm:block">
                  · {typeLabel[item.type]}
                </span>
                <button
                  onClick={() => remove(item.id)}
                  className="ml-1 text-white/50 hover:text-white transition"
                  aria-label={`Remove ${item.name} from compare`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: MAX - items.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center w-10 h-8 rounded-xl border border-dashed border-white/20 text-white/30 flex-shrink-0"
              >
                <span className="text-lg">+</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clear}
              className="text-xs text-white/50 hover:text-white transition hidden sm:block"
            >
              Clear
            </button>
            <Link
              href="/compare"
              className={`flex items-center gap-1.5 font-bold text-sm rounded-xl px-4 py-2 transition ${
                items.length >= 2
                  ? "bg-[#f97316] hover:bg-[#ea6c0a] text-white"
                  : "bg-white/20 text-white/50 cursor-not-allowed pointer-events-none"
              }`}
            >
              Compare {items.length}/{MAX}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
