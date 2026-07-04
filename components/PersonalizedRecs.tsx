'use client';

/**
 * PersonalizedRecs
 * /api/recommend'ı çağırır. Collaborative filtering + live rates + Groq.
 * Loan ve insurance sayfalarında "For You" bölümü olarak gösterilir.
 *
 * Props:
 *  productType: 'personal' | 'mortgage' | 'car' | 'motor' | 'health' | 'home' | 'casco'
 *  country?: string
 *  amount?: number
 *  termMonths?: number
 *  liveEuribor?: number   — SmartRateWidget'ten gelen, değişince re-fetch
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { Sparkles, TrendingDown, TrendingUp, ExternalLink, RefreshCw, Users } from 'lucide-react';
import { buildGoLink } from '@/lib/affiliate';
import { trackRecommendationClick } from '@/lib/tracker';

interface Recommendation {
  rank: number;
  productId: string;
  name: string;
  logo: string;
  badge: string | null;
  representativeRate?: number;
  annualPremium?: number;
  features: string[];
  applyUrl: string;
  score: number;
  collabScore: number;
  reasons: string[];
  why: string;
}

interface RecommendResult {
  recommendations: Recommendation[];
  marketSummary: string;
  liveRates: {
    euribor3m: number | null;
    euriborDelta: number | null;
    trend: 'falling' | 'rising' | 'stable';
  };
  dataSource: {
    collaborative:    boolean;
    liveRates:        boolean;
    aiExplained:      boolean;
    vectorSimilarity: boolean;
  };
}

interface Props {
  productType: string;
  country?: string;
  amount?: number;
  termMonths?: number;
  liveEuribor?: number | null;   // değişince re-fetch tetiklenir
  className?: string;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let sid = sessionStorage.getItem('nr_sid');
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('nr_sid', sid);
  }
  return sid;
}

const INSURANCE_TYPES = new Set(['motor', 'casco', 'home', 'health']);

export default function PersonalizedRecs({ productType, country, amount, termMonths, liveEuribor, className = '' }: Props) {
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prevEuribor = useRef<number | null>(null);
  const fetchCount = useRef(0);
  const isInsurance = INSURANCE_TYPES.has(productType);

  const fetchRecs = useCallback(async (triggeredBy?: string) => {
    setLoading(true);
    setError('');
    fetchCount.current++;

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          productType,
          country:    country || undefined,
          amount:     amount || undefined,
          termMonths: termMonths || undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as RecommendResult;
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [productType, country, amount, termMonths]);

  // İlk yükleme
  useEffect(() => {
    fetchRecs('initial');
  }, [fetchRecs]);

  // EURIBOR değişince re-fetch (sadece anlamlı değişiklik: ±0.05%)
  useEffect(() => {
    if (liveEuribor === null || liveEuribor === undefined) return;
    if (prevEuribor.current === null) { prevEuribor.current = liveEuribor; return; }
    const diff = Math.abs(liveEuribor - prevEuribor.current);
    if (diff >= 0.05) {
      prevEuribor.current = liveEuribor;
      fetchRecs('euribor_change');
    }
  }, [liveEuribor, fetchRecs]);

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (loading && !result) {
    return (
      <div className={`bg-gradient-to-br from-sky-50 to-slate-50 border border-sky-100 rounded-2xl p-5 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-sky-500" />
          <span className="text-sm font-bold text-sky-700">Personalising for you…</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-50 rounded w-1/3" />
                </div>
              </div>
              <div className="h-2 bg-gray-50 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !result) return null;
  if (result.recommendations.length === 0) return null;

  const { recommendations, marketSummary, liveRates, dataSource } = result;

  return (
    <div className={`bg-gradient-to-br from-sky-50 to-slate-50 border border-sky-100 rounded-2xl p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sky-500/10 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-sky-500" />
          </div>
          <span className="font-extrabold text-sm text-slate-800">Recommended For You</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Live rate indicator */}
          {liveRates.euribor3m && (
            <div className={`flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
              liveRates.trend === 'falling' ? 'bg-green-100 text-green-700' :
              liveRates.trend === 'rising'  ? 'bg-red-100 text-red-700' :
                                              'bg-slate-100 text-slate-600'
            }`}>
              {liveRates.trend === 'falling' ? <TrendingDown size={9} /> : liveRates.trend === 'rising' ? <TrendingUp size={9} /> : null}
              EURIBOR {liveRates.euribor3m}%
            </div>
          )}
          <button
            onClick={() => fetchRecs('manual')}
            disabled={loading}
            className="text-sky-500 hover:text-sky-700 transition"
            title="Refresh recommendations"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Data source badges */}
      <div className="flex gap-1.5 mb-4">
        {dataSource.collaborative && (
          <span className="flex items-center gap-1 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
            <Users size={8} /> User data
          </span>
        )}
        {dataSource.liveRates && (
          <span className="flex items-center gap-1 text-[9px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" /> Live rates
          </span>
        )}
        {dataSource.aiExplained && (
          <span className="flex items-center gap-1 text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-semibold">
            <Sparkles size={8} /> AI
          </span>
        )}
        {dataSource.vectorSimilarity && (
          <span className="flex items-center gap-1 text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">
            ⚡ Similar profiles
          </span>
        )}
      </div>

      {/* Market summary */}
      {marketSummary && (
        <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-white/60 rounded-xl px-3 py-2">
          {marketSummary}
        </p>
      )}

      {/* Recommendation cards */}
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const utmUrl = buildGoLink(rec.applyUrl, { inst: rec.productId, pid: rec.productId, pt: `${productType}-personalized-rank${rec.rank}` });
          return (
            <div
              key={rec.productId}
              className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                i === 0 ? 'border-sky-200 shadow-sm shadow-sky-100' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Rank + logo */}
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${
                    i === 0 ? 'border-sky-200 bg-sky-50' : 'border-gray-100 bg-gray-50'
                  }`}>
                    {rec.logo}
                  </div>
                  <span className={`absolute -top-1.5 -left-1.5 w-4.5 h-4.5 flex items-center justify-center text-[9px] font-extrabold rounded-full border border-white ${
                    i === 0 ? 'bg-sky-500 text-white' : 'bg-slate-600 text-white'
                  }`} style={{ width: 18, height: 18 }}>
                    #{rec.rank}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <p className="font-bold text-slate-900 text-sm">{rec.name}</p>
                    {rec.badge && (
                      <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full font-bold">{rec.badge}</span>
                    )}
                  </div>
                  {rec.representativeRate !== undefined && (
                    <p className="text-base font-extrabold text-sky-600">
                      {rec.representativeRate}% <span className="text-xs text-slate-400 font-normal">p.a.</span>
                    </p>
                  )}
                  {rec.annualPremium !== undefined && (
                    <p className="text-base font-extrabold text-sky-600">
                      €{rec.annualPremium} <span className="text-xs text-slate-400 font-normal">/year</span>
                    </p>
                  )}

                  {/* AI why */}
                  {rec.why && (
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rec.why}</p>
                  )}

                  {/* Reason tags */}
                  {rec.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.reasons.map(r => (
                        <span key={r} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <a
                  href={utmUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => trackRecommendationClick(rec.rank, rec.productId, null)}
                  className={`flex-shrink-0 flex items-center gap-1 font-bold text-xs py-2 px-3 rounded-xl transition-all ${
                    i === 0
                      ? 'bg-sky-500 hover:bg-sky-400 text-white'
                      : 'bg-slate-900 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isInsurance ? 'Quote' : 'Apply'}
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] text-slate-400 text-center mt-3 leading-relaxed">
        Rankings update with live market data · NordicRate may earn a referral fee
      </p>
    </div>
  );
}
