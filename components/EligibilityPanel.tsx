"use client";

/**
 * EligibilityPanel
 * - Personal mode  → DTI gauge + product matching (calculateEligibility)
 * - Corporate mode → Program matching via matchPrograms() from lib/corporate-profile
 *
 * Listens for 'ai-messages-updated' custom event fired by AIAssistant.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Sparkles, TrendingDown, CheckCircle, AlertCircle, XCircle,
  ChevronDown, ChevronUp, Building2, ExternalLink, Zap,
} from "lucide-react";
import { calculateEligibility } from "@/lib/profile";
import { matchPrograms } from "@/lib/corporate-profile";
import type { UserProfile, EligibilityResult } from "@/lib/profile";
import type { CorporateProfile, ProgramMatch } from "@/lib/corporate-profile";

// ── Personal score config ────────────────────────────────────────────────────
const SCORE_CONFIG = {
  excellent: {
    label: "Excellent", color: "text-emerald-700", bg: "bg-emerald-50",
    border: "border-emerald-200", bar: "bg-emerald-500", pct: 95,
    icon: <CheckCircle size={14} className="text-emerald-500" />,
  },
  good: {
    label: "Good", color: "text-blue-700", bg: "bg-blue-50",
    border: "border-blue-200", bar: "bg-blue-500", pct: 72,
    icon: <CheckCircle size={14} className="text-blue-500" />,
  },
  fair: {
    label: "Fair", color: "text-amber-700", bg: "bg-amber-50",
    border: "border-amber-200", bar: "bg-amber-400", pct: 48,
    icon: <AlertCircle size={14} className="text-amber-500" />,
  },
  poor: {
    label: "Poor", color: "text-red-700", bg: "bg-red-50",
    border: "border-red-200", bar: "bg-red-500", pct: 22,
    icon: <XCircle size={14} className="text-red-500" />,
  },
  insufficient_data: {
    label: "Share more info", color: "text-gray-500", bg: "bg-gray-50",
    border: "border-gray-200", bar: "bg-gray-300", pct: 0,
    icon: <Sparkles size={14} className="text-gray-400" />,
  },
};

const PROGRAM_TYPE_LABEL: Record<string, string> = {
  government_loan: "Gov Loan", startup_loan: "Startup Loan",
  grant: "Grant", guarantee: "Guarantee",
  eu_fund: "EU Fund", innovation_fund: "Innovation",
  export_credit: "Export", digital_nomad_visa: "Nomad Visa",
  startup_visa: "Startup Visa", e_residency: "e-Residency",
};

const PROGRAM_TYPE_COLOR: Record<string, string> = {
  government_loan: "bg-blue-100 text-blue-700",
  startup_loan: "bg-violet-100 text-violet-700",
  grant: "bg-emerald-100 text-emerald-700",
  guarantee: "bg-sky-100 text-sky-700",
  eu_fund: "bg-indigo-100 text-indigo-700",
  innovation_fund: "bg-fuchsia-100 text-fuchsia-700",
  export_credit: "bg-orange-100 text-orange-700",
  digital_nomad_visa: "bg-teal-100 text-teal-700",
  startup_visa: "bg-rose-100 text-rose-700",
  e_residency: "bg-amber-100 text-amber-700",
};

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  mode?: "personal" | "corporate";
  className?: string;
  /** Passed directly from AIAssistant (personal mode only) */
  profile?: UserProfile;
  result?: EligibilityResult;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function EligibilityPanel({
  mode = "personal",
  className = "",
  profile: propProfile,
  result: propResult,
}: Props) {
  // Personal mode state
  const [profile, setProfile] = useState<UserProfile | null>(propProfile ?? null);
  const [result, setResult] = useState<EligibilityResult | null>(propResult ?? null);

  // Corporate mode state
  const [corpProfile, setCorpProfile] = useState<CorporateProfile | null>(null);
  const [programMatches, setProgramMatches] = useState<ProgramMatch[]>([]);

  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [hasMessages, setHasMessages] = useState(!!propProfile);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync prop-passed profile/result (AIAssistant personal mode)
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
        const extracted = await res.json();
        if (Object.keys(extracted).length === 0) return;

        if (mode === "corporate") {
          const cp = extracted as CorporateProfile;
          setCorpProfile(cp);
          setProgramMatches(matchPrograms(cp, 5));
        } else {
          const up = extracted as UserProfile;
          setProfile(up);
          setResult(calculateEligibility(up));
        }
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

  if (!hasMessages && !profile && !corpProfile) return null;

  // ── Render: Corporate mode ─────────────────────────────────────────────────
  if (mode === "corporate") {
    return (
      <div className={`bg-white rounded-xl border border-violet-200 overflow-hidden transition-all ${className}`}>
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 transition"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
              <Building2 size={12} className="text-violet-600" />
            </div>
            <span className="text-sm font-bold text-gray-800">Program Matcher</span>
            {loading && (
              <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full animate-pulse">
                Matching…
              </span>
            )}
            {!loading && programMatches.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                {programMatches.length} matches
              </span>
            )}
          </div>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </button>

        {expanded && (
          <div className="px-4 py-3 space-y-3">
            {/* Prompt when no data yet */}
            {!corpProfile && !loading && (
              <p className="text-xs text-gray-500 leading-relaxed">
                Tell the AI about your <strong>business stage</strong>, <strong>country</strong>,{" "}
                <strong>sector</strong>, and <strong>funding needed</strong> to get matched with
                government programs, EU funds, and startup support.
              </p>
            )}

            {loading && programMatches.length === 0 && (
              <div className="space-y-2">
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            )}

            {/* Extracted company profile summary */}
            {corpProfile && Object.keys(corpProfile).length > 0 && (
              <div className="text-xs text-gray-500 space-y-1 bg-gray-50 rounded-lg px-3 py-2">
                {corpProfile.businessStage && (
                  <div className="flex justify-between">
                    <span>Stage</span>
                    <span className="font-semibold text-gray-700 capitalize">{corpProfile.businessStage}</span>
                  </div>
                )}
                {corpProfile.country && (
                  <div className="flex justify-between">
                    <span>Country</span>
                    <span className="font-semibold text-gray-700">{corpProfile.country}</span>
                  </div>
                )}
                {corpProfile.sector && (
                  <div className="flex justify-between">
                    <span>Sector</span>
                    <span className="font-semibold text-gray-700 capitalize">{corpProfile.sector}</span>
                  </div>
                )}
                {corpProfile.employeeCount !== undefined && (
                  <div className="flex justify-between">
                    <span>Team size</span>
                    <span className="font-semibold text-gray-700">{corpProfile.employeeCount} people</span>
                  </div>
                )}
                {corpProfile.fundingNeeded && (
                  <div className="flex justify-between">
                    <span>Funding needed</span>
                    <span className="font-semibold text-gray-700">€{corpProfile.fundingNeeded.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Program matches */}
            {programMatches.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                  Best matching programs
                </p>
                {programMatches.map(({ program, score, matchReasons }) => (
                  <div
                    key={program.id}
                    className="border border-gray-100 rounded-xl p-3 hover:border-violet-200 hover:bg-violet-50/40 transition group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base leading-none flex-shrink-0">{program.flag}</span>
                        <span className="text-xs font-bold text-gray-800 leading-tight truncate">
                          {program.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PROGRAM_TYPE_COLOR[program.type] ?? "bg-gray-100 text-gray-600"}`}>
                          {PROGRAM_TYPE_LABEL[program.type] ?? program.type}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
                      {program.description.slice(0, 100)}…
                    </p>

                    {/* Match reasons (top 2) */}
                    {matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {matchReasons.slice(0, 2).map((r, i) => (
                          <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                            <Zap size={8} /> {r}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Score bar */}
                      <div className="flex items-center gap-1.5 flex-1 mr-3">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-400 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{score}%</span>
                      </div>
                      <Link
                        href={program.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-0.5 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Apply <ExternalLink size={9} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No matches */}
            {corpProfile && programMatches.length === 0 && !loading && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                No programs matched yet. Share more about your business — sector, country, and funding needs help us find the right programs.
              </p>
            )}

            <p className="text-[10px] text-gray-400 text-center pt-1">
              Based on your conversation · Match scores are indicative only
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Render: Personal mode ──────────────────────────────────────────────────
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
