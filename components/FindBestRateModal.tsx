'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ExternalLink, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { COUNTRIES } from '@/lib/data';
import { track, trackFindRateSubmit, trackRecommendationClick } from '@/lib/tracker';

// ─── Types ─────────────────────────────────────────────────────────────────────
type ProductType =
  | 'personal' | 'mortgage' | 'car' | 'business'
  | 'motor' | 'casco' | 'home' | 'health'
  | 'deposit';

interface Recommendation {
  rank: number;
  productId: string;
  name: string;
  logo: string;
  badge: string | null;
  representativeRate?: number;
  annualPremium?: number;
  excess?: number;
  processingTime?: string;
  features: string[];
  whyThis: string;
  applyUrl: string;
}

interface FindRateResult {
  leadId: string | null;
  recommendations: Recommendation[];
  aiSummary: string;
}

// ─── Product type options ───────────────────────────────────────────────────────
const PRODUCT_OPTIONS: { value: ProductType; icon: string; label: string; sub: string }[] = [
  { value: 'personal', icon: '👤', label: 'Personal Loan',  sub: 'Consumer credit, fast approval' },
  { value: 'mortgage', icon: '🏠', label: 'Mortgage',       sub: 'Home purchase or refinance'    },
  { value: 'car',      icon: '🚗', label: 'Car Loan',       sub: 'Auto financing'                },
  { value: 'motor',    icon: '🛡️', label: 'Motor Insurance', sub: 'Mandatory TPL'               },
  { value: 'health',   icon: '❤️', label: 'Health Insurance', sub: 'Private healthcare cover'    },
  { value: 'home',     icon: '🏡', label: 'Home Insurance',  sub: 'Property & contents'          },
  { value: 'casco',    icon: '🚙', label: 'CASCO',           sub: 'Comprehensive vehicle cover'  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const isInsurance = (t: ProductType) => ['motor', 'casco', 'home', 'health'].includes(t);

// ─── Modal ──────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FindBestRateModal({ open, onClose }: Props) {
  const sessionId = useRef(generateSessionId());

  // Step: 1=type select, 2=details, 3=results
  const [step, setStep]             = useState(1);
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [country, setCountry]       = useState('');
  const [amount, setAmount]         = useState(10_000);
  const [termMonths, setTermMonths] = useState(36);
  const [email, setEmail]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<FindRateResult | null>(null);
  const [error, setError]           = useState('');

  // Track open + reset on close
  useEffect(() => {
    if (open) {
      track('find_rate_open');
    } else {
      setTimeout(() => {
        setStep(1);
        setProductType(null);
        setCountry('');
        setAmount(10_000);
        setTermMonths(36);
        setEmail('');
        setResult(null);
        setError('');
        setLoading(false);
      }, 300);
    }
  }, [open]);

  // Trap Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit() {
    if (!productType) return;
    setLoading(true);
    setError('');
    setStep(3);

    try {
      const res = await fetch('/api/find-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType,
          country: country || undefined,
          amount: !isInsurance(productType) ? amount : undefined,
          termMonths: !isInsurance(productType) ? termMonths : undefined,
          email: email || undefined,
          sessionId: sessionId.current,
        }),
      });
      const data = await res.json() as FindRateResult & { error?: string };
      if (data.error) throw new Error(data.error);
      setResult(data);
      // Track submit + recommendation views
      trackFindRateSubmit(productType!, data.leadId);
      data.recommendations.forEach(rec => {
        track('recommendation_view', {
          product_id: rec.productId,
          product_type: productType!,
          rank: rec.rank,
          lead_id: data.leadId,
        });
      });
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-sky-900 px-6 py-5 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-sky-300" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base">Find Your Best Rate</p>
              <p className="text-white/50 text-xs">AI-powered · Free · No credit check</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle size={14} /> : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-8 rounded transition-all ${step > s ? 'bg-sky-500' : 'bg-gray-100'}`} />}
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-2">
              {step === 1 ? 'Choose product' : step === 2 ? 'Quick details' : 'Your results'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* ── Step 1: Product type ── */}
          {step === 1 && (
            <div className="pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-4">What are you looking for?</p>
              <div className="grid grid-cols-1 gap-2">
                {PRODUCT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setProductType(opt.value);
                      setStep(2);
                    }}
                    className="flex items-center gap-4 w-full p-3.5 rounded-2xl border-2 text-left transition-all hover:border-sky-400 hover:bg-sky-50 border-gray-100 group"
                  >
                    <span className="text-2xl w-8 text-center">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm group-hover:text-sky-700">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-sky-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && productType && (
            <div className="pt-4 space-y-5">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={13} /> Change product type
              </button>

              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 flex items-center gap-3">
                <span className="text-2xl">{PRODUCT_OPTIONS.find(o => o.value === productType)?.icon}</span>
                <div>
                  <p className="font-bold text-sky-900 text-sm">{PRODUCT_OPTIONS.find(o => o.value === productType)?.label}</p>
                  <p className="text-xs text-sky-600">Tell us a bit more to personalise your results</p>
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Country</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="">🌍 Any country</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Loan-specific: amount + term */}
              {!isInsurance(productType) && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex justify-between">
                      <span>{productType === 'mortgage' ? 'Property Value' : 'Loan Amount'}</span>
                      <span className="text-sky-600 font-bold normal-case">€{amount.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min={productType === 'mortgage' ? 50_000 : 1_000}
                      max={productType === 'mortgage' ? 500_000 : 50_000}
                      step={productType === 'mortgage' ? 5_000 : 500}
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      className="w-full h-2 rounded-lg cursor-pointer"
                      style={{ accentColor: '#0ea5e9' }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>€{productType === 'mortgage' ? '50K' : '1K'}</span>
                      <span>€{productType === 'mortgage' ? '500K' : '50K'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Loan Term</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(productType === 'mortgage'
                        ? [60, 120, 180, 240, 300, 360]
                        : [12, 24, 36, 48, 60, 84]
                      ).map(m => (
                        <button
                          key={m}
                          onClick={() => setTermMonths(m)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            termMonths === m
                              ? 'bg-sky-500 text-white border-sky-500'
                              : 'border-gray-200 text-gray-500 hover:border-sky-300'
                          }`}
                        >
                          {m >= 12 ? `${m / 12}y` : `${m}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Email (optional) */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Email <span className="font-normal text-gray-400">(optional — to save your results)</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-sky-500 hover:bg-sky-400 text-white font-extrabold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
              >
                <Sparkles size={16} />
                Get AI Recommendations →
              </button>
              <p className="text-center text-xs text-gray-400">
                Free · Instant · We never share your data
              </p>
            </div>
          )}

          {/* ── Step 3: Loading / Results ── */}
          {step === 3 && (
            <div className="pt-4">
              {loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={28} className="text-sky-500 animate-pulse" />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">AI is analysing the market…</p>
                  <p className="text-sm text-gray-400">Comparing {PRODUCT_OPTIONS.find(o => o.value === productType)?.label} offers</p>
                  <div className="mt-6 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                            <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                          </div>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded w-full mb-1.5" />
                        <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-8">
                  <p className="text-red-500 font-semibold mb-2">⚠️ {error}</p>
                  <button
                    onClick={() => { setStep(2); setError(''); }}
                    className="text-sm text-sky-600 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-4">
                  {/* AI Summary */}
                  <div className="bg-gradient-to-br from-slate-50 to-sky-50 border border-sky-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-sky-500" />
                      <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">AI Analysis</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{result.aiSummary}</p>
                  </div>

                  {/* Recommendation cards */}
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Top {result.recommendations.length} Picks For You</p>

                  {result.recommendations.map((rec, i) => (
                    <div
                      key={rec.productId}
                      className={`bg-white rounded-2xl border p-4 ${i === 0 ? 'border-sky-300 shadow-md shadow-sky-100' : 'border-gray-100'}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border ${i === 0 ? 'border-sky-200 bg-sky-50' : 'border-gray-100 bg-gray-50'}`}>
                            {rec.logo}
                          </div>
                          {i === 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                              #1
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-gray-900 text-sm">{rec.name}</p>
                            {rec.badge && (
                              <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">{rec.badge}</span>
                            )}
                          </div>
                          {rec.representativeRate && (
                            <p className="text-lg font-extrabold text-sky-600">{rec.representativeRate}% <span className="text-xs text-gray-400 font-normal">p.a.</span></p>
                          )}
                          {rec.annualPremium && (
                            <p className="text-lg font-extrabold text-sky-600">€{rec.annualPremium} <span className="text-xs text-gray-400 font-normal">/year</span></p>
                          )}
                        </div>
                      </div>

                      {/* Why */}
                      <div className="bg-slate-50 rounded-xl p-3 mb-3">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          <span className="font-semibold text-slate-700">Why this? </span>
                          {rec.whyThis}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {rec.features.map(f => (
                          <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>

                      <a
                        href={rec.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() => {
                          trackRecommendationClick(rec.rank, rec.productId, result.leadId);
                          track('find_rate_apply', {
                            product_id: rec.productId,
                            product_type: productType!,
                            rank: rec.rank,
                            lead_id: result.leadId,
                          });
                        }}
                        className={`w-full flex items-center justify-center gap-1.5 font-bold py-2.5 rounded-xl text-sm transition-all ${
                          i === 0
                            ? 'bg-sky-500 hover:bg-sky-400 text-white'
                            : 'bg-gray-900 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {isInsurance(productType!) ? 'Get Quote' : 'Apply Now'}
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  ))}

                  <button
                    onClick={() => { setStep(1); setResult(null); setProductType(null); }}
                    className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
                  >
                    ← Search for a different product
                  </button>

                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    AI recommendations are based on representative data and may not reflect your exact quote.
                    Always confirm rates directly with the provider. NordicRate may earn a referral fee.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
