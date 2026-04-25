'use client';

import { useState } from 'react';
import type { UserProfile, EligibilityResult, EligibilityScore } from '@/lib/profile';

interface ScoreConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  bar: string;
}

const SCORE_CONFIG: Record<EligibilityScore, ScoreConfig> = {
  excellent:         { label: 'Excellent',  color: 'text-green-700', bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  bar: 'bg-green-500' },
  good:              { label: 'Good',       color: 'text-sky-700',   bg: 'bg-sky-50',    border: 'border-sky-200',    dot: 'bg-sky-500',    bar: 'bg-sky-500' },
  fair:              { label: 'Fair',       color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500',  bar: 'bg-amber-500' },
  poor:              { label: 'Poor',       color: 'text-red-700',   bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    bar: 'bg-red-500' },
  insufficient_data: { label: 'Incomplete', color: 'text-slate-600', bg: 'bg-slate-50',  border: 'border-slate-200',  dot: 'bg-slate-400',  bar: 'bg-slate-400' },
};

interface Props {
  profile: UserProfile;
  result: EligibilityResult;
}

export default function EligibilityPanel({ profile, result }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SCORE_CONFIG[result.score];

  return (
    <div className={`mx-3 mb-2 rounded-xl border ${cfg.border} overflow-hidden shrink-0`}>
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 gap-2 ${cfg.bg}`}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          <span className={`text-xs font-bold shrink-0 ${cfg.color}`}>
            Eligibility: {cfg.label}
          </span>
          {result.dti !== undefined && (
            <span className="text-xs text-slate-500 shrink-0">· DTI {result.dti}%</span>
          )}
          {result.matchedProducts.length > 0 && (
            <span className="text-xs text-slate-400 truncate">
              · {result.matchedProducts.length} match{result.matchedProducts.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="bg-white px-3 pb-3 pt-2.5 space-y-3 border-t border-slate-100">
          {/* Profile summary */}
          {(profile.monthlyIncome || profile.loanAmount) && (
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {profile.monthlyIncome && (
                <span>Income: <strong className="text-slate-700">€{profile.monthlyIncome.toLocaleString()}/mo</strong></span>
              )}
              {profile.loanAmount && (
                <span>Loan: <strong className="text-slate-700">€{profile.loanAmount.toLocaleString()}</strong></span>
              )}
              {profile.loanTermMonths && (
                <span>Term: <strong className="text-slate-700">{profile.loanTermMonths}mo</strong></span>
              )}
            </div>
          )}

          {/* DTI bar */}
          {result.dti !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Debt-to-Income ratio</span>
                <span className={`font-bold ${cfg.color}`}>{result.dti}%</span>
              </div>
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${cfg.bar}`}
                  style={{ width: `${Math.min(result.dti, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0%</span>
                <span className="text-green-600 font-medium">25% safe</span>
                <span className="text-red-500 font-medium">45% risk</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Max affordable loan */}
          {result.maxLoanDTI !== undefined && (
            <div className={`text-xs rounded-lg px-2.5 py-2 ${cfg.bg} border ${cfg.border}`}>
              <span className="text-slate-500">Max affordable loan </span>
              <span className={`font-bold ${cfg.color}`}>€{result.maxLoanDTI.toLocaleString()}</span>
              <span className="text-slate-400"> at 35% DTI ceiling</span>
            </div>
          )}

          {/* Matched products */}
          {result.matchedProducts.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Top Matches
              </p>
              <div className="space-y-1">
                {result.matchedProducts.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100"
                  >
                    <span className="text-xs text-slate-700 truncate max-w-[180px]">{p.name}</span>
                    <span className={`text-xs font-bold shrink-0 ml-2 ${cfg.color}`}>
                      {p.rateMin}–{p.rateMax}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasons */}
          {result.reasons.length > 0 && (
            <div className="space-y-1">
              {result.reasons.slice(0, 2).map((reason, i) => (
                <div key={i} className="flex gap-2 text-xs text-slate-600">
                  <span className="text-slate-300 shrink-0 mt-0.5">›</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* First recommendation */}
          {result.recommendations.length > 0 && (
            <div className={`flex gap-2 rounded-lg px-2.5 py-2 text-xs ${cfg.bg} border ${cfg.border}`}>
              <span className="shrink-0">💡</span>
              <span className={cfg.color}>{result.recommendations[0]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
