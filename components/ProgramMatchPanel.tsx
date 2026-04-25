'use client';

import { useState } from 'react';
import type { ProgramMatch } from '@/lib/corporate-profile';
import { PROGRAM_TYPE_LABELS, PROGRAM_TYPE_ICONS } from '@/lib/programs-data';

function scoreBadge(score: number): string {
  if (score >= 70) return 'bg-green-100 text-green-700';
  if (score >= 50) return 'bg-sky-100 text-sky-700';
  if (score >= 30) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-500';
}

function formatAmount(amount: number, currency?: string): string {
  if (!currency || currency === 'EUR') return `€${(amount / 1000).toFixed(0)}K`;
  return `${(amount / 1000).toFixed(0)}K ${currency}`;
}

interface Props {
  matches: ProgramMatch[];
}

export default function ProgramMatchPanel({ matches }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (matches.length === 0) return null;

  const topIcons = matches.slice(0, 3).map(m => PROGRAM_TYPE_ICONS[m.program.type] ?? '📋');

  return (
    <div className="mx-3 mb-2 rounded-xl border border-violet-200 overflow-hidden shrink-0">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 gap-2 bg-violet-50"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0 bg-violet-500" />
          <span className="text-xs font-bold text-violet-700 shrink-0">
            {matches.length} program{matches.length !== 1 ? 's' : ''} matched
          </span>
          <span className="text-xs text-slate-400 shrink-0 tracking-wide">
            {topIcons.join(' ')}
          </span>
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
        <div className="bg-white px-3 pb-3 pt-2.5 space-y-2.5 border-t border-slate-100">
          {matches.map((m, i) => {
            const typeIcon = PROGRAM_TYPE_ICONS[m.program.type] ?? '📋';
            const typeLabel = PROGRAM_TYPE_LABELS[m.program.type] ?? m.program.type;
            return (
              <div
                key={m.program.id}
                className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 space-y-1.5"
              >
                {/* Program header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base leading-none">{m.program.flag}</span>
                      <span className="text-xs font-bold text-slate-800 leading-snug">{m.program.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {typeIcon} {typeLabel} · [{m.program.country}]
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${scoreBadge(m.score)}`}>
                    {m.score}
                  </span>
                </div>

                {/* Match reasons */}
                {m.matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.matchReasons.map((r, j) => (
                      <span
                        key={j}
                        className="text-[10px] bg-white border border-slate-200 text-slate-600 rounded-full px-2 py-0.5 leading-tight"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Amount + rate */}
                {(m.program.maxAmount || m.program.rateMin != null) && (
                  <div className="flex gap-3 text-xs text-slate-500">
                    {m.program.maxAmount && (
                      <span>Max: <strong className="text-slate-700">{formatAmount(m.program.maxAmount, m.program.currency)}</strong></span>
                    )}
                    {m.program.rateMin != null && (
                      <span>Rate: <strong className="text-slate-700">{m.program.rateMin}{m.program.rateMax ? `–${m.program.rateMax}` : ''}%</strong></span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-[10px] text-slate-400 text-center pt-0.5">
            Ranked by relevance to your business profile
          </p>
        </div>
      )}
    </div>
  );
}
