"use client";

/**
 * EligibilityPanel
 * AI konuşmasından çıkarılan UserProfile → calculateEligibility() sonuçlarını gösterir.
 * AIAssistant 'ai-messages-updated' custom event'i fırlatınca /api/profile'ı çağırır.
 * Personal + Corporate loan sidebar'ına eklenir.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles, TrendingDown, CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { calculateEligibility } from "@/lib/profile";
import type { UserProfile, EligibilityResult } from "@/lib/profile";

const SCORE_CONFIG = {
  excellent: {
    label: "Excellent",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    bar: "bg-emerald-500",
    pct: 95,
    icon: <CheckCircle size={14} className="text-emerald-500" />,
  },
  good: {
    label: "Good",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    bar: "bg-blue-500",
    pct: 72,
    icon: <CheckCircle size={14} className="text-blue-500" />,
  },
  fair: {
    label: "Fair",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    bar: "bg-amber-400",
    pct: 48,
    icon: <AlertCircle size={14} className="text-amber-500" />,
  },
  poor: {
    label: "Poor",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    bar: "bg-red-500",
    pct: 22,
    icon: <XCircle size={14} className="text-red-500" />,
  },
  insufficient_data: {
    label: "Share more info",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    bar: "bg-gray-300",
    pct: 0,
    icon: <Sparkles size={14} className="text-gray-400" />,
  },
};

interface Props {
  mode?: "personal" | "corporate";
  className?: string;
  /** Optional: pass profile + result directly (used by AIAssistant chat widget) */
  profile?: UserProfile;
  result?: EligibilityResult;
}

export default function EligibilityPanel({ mode = "personal", className = "", profile: propProfile, result: propResult }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(propProfile ?? null);
  const [result, setResult] = useState<EligibilityResult | null>(propResult ?? null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [hasMessages, setHasMessages] = useState(!!propProfile);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If passed as props (AIAssistant mode), sync on changes
  useEffect(() => {
    if (propProfile !== undefined) setProfile(propProfile);
    if (propResult !== undefined) setResult(propResult);
  }, [propProfile, propResult]);

  const fetchProfile = useCallback(
    async (messages: { role: string; content: string }[]) => {
      if (messages.length < 2) return;
      setLoading(true);
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, mode }),
        });
        if (!res.ok) return;
        const extracted: UserProfile = await res.json();
        if (Object.keys(extracted).length === 0) return;
        setProfile(extracted);
        setResult(calculateEligibility(extracted));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [mode]
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const { messages } = (e as CustomEvent<{ messages: { role: string; content: string }[] }>).detail;
      setHasMessages(messages.length > 1);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchProfile(messages), 800);
    };
    window.addEventListener("ai-messages-updated", handler);
    return () => {
      window.removeEventListener("ai-messages-updated", handler);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchProfile]);

  if (!hasMessages && !profile) return null;

  const cfg = result ? SCORE_CONFIG[result.score] : SCORE_CONFIG.insufficient_data;

  return (
    <div className={`bg-white rounded-xl border ${cfg.border} overflow-hidden transition-all ${className}`}>
      {/* Header */}
      <button
        className={`w-full flex items-center justify-between px-4 py-3 ${cfg.bg} transition`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
            <Sparkles size={12} className="text-violet-600" />
          </div>
          <span className="text-sm font-bold text-gray-800">AI Eligibility Check</span>
          {loading && (
            <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full animate-pulse">
              Analysing…
            </span>
          )}
          {!loading && result && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
              {cfg.label}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 py-3 space-y-3">
          {!result && !loading && (
            <p className="text-xs text-gray-500 leading-relaxed">
              Tell the AI your <strong>income</strong>, <strong>loan amount</strong>, and{" "}
              <strong>employment status</strong> to get an instant eligibility estimate.
            </p>
          )}

          {loading && !result && (
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          )}

          {result && (
            <>
              {/* Score bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Eligibility score</span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                    style={{ width: `${cfg.pct}%` }}
                  />
                </div>
              </div>

              {/* DTI */}
              {result.dti !== undefined && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={13} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Debt-to-Income (DTI)</span>
                  </div>
                  <span className={`text-sm font-extrabold ${
                    result.dti < 25 ? "text-emerald-600" :
                    result.dti < 35 ? "text-blue-600" :
                    result.dti < 45 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {result.dti}%
                  </span>
                </div>
              )}

              {/* Max loan */}
              {result.maxLoanDTI != null && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500">Max recommended loan</span>
                  <span className="text-sm font-extrabold text-[#1a3c6e]">
                    €{result.maxLoanDTI.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Profile extracted */}
              {profile && (
                <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-50">
                  {profile.monthlyIncome && (
                    <div className="flex justify-between">
                      <span>Monthly income</span>
                      <span className="font-semibold text-gray-700">€{profile.monthlyIncome.toLocaleString()}</span>
                    </div>
                  )}
                  {profile.loanAmount && (
                    <div className="flex justify-between">
                      <span>Loan requested</span>
                      <span className="font-semibold text-gray-700">€{profile.loanAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {profile.employmentType && (
                    <div className="flex justify-between">
                      <span>Employment</span>
                      <span className="font-semibold text-gray-700 capitalize">
                        {profile.employmentType.replace("_", " ")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Reasons */}
              {result.reasons.length > 0 && (
                <ul className="space-y-1">
                  {result.reasons.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      {cfg.icon}
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-amber-800 mb-1">💡 Recommendations</p>
                  <ul className="space-y-1">
                    {result.recommendations.slice(0, 2).map((r, i) => (
                      <li key={i} className="text-xs text-amber-700">• {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[10px] text-gray-400 text-center pt-1">
                Based on your conversation · Not a credit decision · For guidance only
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
