'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { upsertUserProfile } from '@/lib/db';
import { COUNTRIES } from '@/lib/data';
import { buildGoLink } from '@/lib/affiliate';
import { calculateEligibility, type EligibilityResult } from '@/lib/profile';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { calculateMonthlyPayment } from '@/lib/utils';
import { track, trackRecommendationClick } from '@/lib/tracker';

type Step = 1 | 2 | 3 | 4 | 5;

const LOAN_TYPES = [
  { value: 'personal', icon: '💳', label: 'Personal loan', desc: 'Cash for any purpose', route: '/loans/personal' },
  { value: 'mortgage', icon: '🏠', label: 'Mortgage', desc: 'Buy or refinance a home', route: '/loans/mortgage' },
  { value: 'auto',     icon: '🚗', label: 'Car loan', desc: 'New or used vehicle', route: '/loans/car' },
  { value: 'business', icon: '🏢', label: 'Business loan', desc: 'Fund your company', route: '/loans/business' },
] as const;

type LoanType = typeof LOAN_TYPES[number]['value'];

const AMOUNT_OPTIONS = [
  { label: 'Under €5,000',        value: 3000 },
  { label: '€5,000 – €15,000',   value: 10000 },
  { label: '€15,000 – €30,000',  value: 22000 },
  { label: '€30,000 – €75,000',  value: 50000 },
  { label: '€75,000 – €200,000', value: 130000 },
  { label: 'Over €200,000',       value: 300000 },
];

const INCOME_OPTIONS = [
  { label: 'Under €1,000',        value: 800 },
  { label: '€1,000 – €2,000',    value: 1500 },
  { label: '€2,000 – €3,500',    value: 2750 },
  { label: '€3,500 – €5,000',    value: 4250 },
  { label: '€5,000 – €7,500',    value: 6000 },
  { label: 'Over €7,500',         value: 10000 },
];

const STEP_LABELS = ['Loan type', 'Country', 'Amount', 'Income'];

// Funnel analytics — adım adları (GA4 nr_onboarding_step + admin dashboard)
const STEP_NAMES = ['loan_type', 'country', 'amount', 'income', 'results'] as const;

// find-rate API ürün tipi + amortisman için varsayılan vade (ay)
const FIND_RATE_TYPE: Record<LoanType, string> = {
  personal: 'personal', mortgage: 'mortgage', auto: 'car', business: 'business',
};
const DEFAULT_TERM_MONTHS: Record<LoanType, number> = {
  personal: 60, mortgage: 300, auto: 60, business: 60,
};

interface Recommendation {
  rank: number;
  productId: string;
  name: string;
  logo: string | null;
  mono?: string;
  badge: string | null;
  representativeRate?: number;
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

const ELIGIBILITY_STYLES: Record<EligibilityResult['score'], { label: string; cls: string }> = {
  excellent:         { label: 'Excellent',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  good:              { label: 'Good',           cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  fair:              { label: 'Fair',           cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  poor:              { label: 'Needs review',   cls: 'bg-red-50 text-red-700 border-red-200' },
  insufficient_data: { label: 'Not estimated',  cls: 'bg-slate-50 text-slate-500 border-slate-200' },
};

/** Sonuç kartı logosu — lokal webp, yüklenemezse monograma düşer */
function RecLogo({ logo, mono }: { logo: string | null; mono: string }) {
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- küçük lokal webp
      <img
        src={logo}
        alt=""
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
        onError={() => setFailed(true)}
      />
    );
  }
  return <span className="text-sm font-extrabold text-slate-500">{mono}</span>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { refresh: refreshProfile } = useUserProfile();
  const [step, setStep]           = useState<Step>(1);
  const [loanType, setLoanType]   = useState<LoanType | ''>('');
  const [country, setCountry]     = useState('');
  const [amount, setAmount]       = useState<number | null>(null);
  const [income, setIncome]       = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [authChecked, setAuth]    = useState(false);
  const [firstName, setFirstName] = useState('');
  const [recs, setRecs]           = useState<FindRateResult | null>(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const sessionId = useRef(`${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/register');
      else setAuth(true);
    });
  }, [router]);

  // Funnel: her adım görüntülenmesi bir event — drop-off admin dashboard'da
  // adım başına distinct session sayısıyla ölçülür (Back tekrarları orada elenir)
  useEffect(() => {
    if (!authChecked) return;
    track('onboarding_step', { step, step_name: STEP_NAMES[step - 1] });
  }, [step, authChecked]);

  async function fetchRecommendations(type: LoanType, userEmail?: string) {
    setRecsLoading(true);
    setRecsError(false);
    try {
      const res = await fetch('/api/find-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType:   FIND_RATE_TYPE[type],
          country:       country || undefined,
          amount:        amount ?? undefined,
          termMonths:    DEFAULT_TERM_MONTHS[type],
          monthlyIncome: income && income > 0 ? income : undefined,
          email:         userEmail,
          sessionId:     sessionId.current,
        }),
      });
      const data = await res.json() as FindRateResult & { error?: string };
      if (data.error || !data.recommendations?.length) throw new Error(data.error ?? 'empty');
      setRecs(data);
      data.recommendations.forEach(rec => {
        track('recommendation_view', {
          product_id: rec.productId,
          product_type: FIND_RATE_TYPE[type],
          rank: rec.rank,
          lead_id: data.leadId,
          source: 'onboarding',
        });
      });
    } catch {
      setRecsError(true);
    } finally {
      setRecsLoading(false);
    }
  }

  async function handleFinish() {
    setError('');
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/login'); return; }

    const { error: dbError } = await upsertUserProfile({
      userId:              session.user.id,
      email:               session.user.email,
      name:                session.user.user_metadata?.full_name as string | undefined,
      country:             country || undefined,
      preferredLoanTypes:  loanType ? [loanType] : [],
      preferredMode:       loanType === 'business' ? 'corporate' : 'personal',
      monthlyIncome:       income && income > 0 ? income : undefined,
      preferredAmount:     amount ?? undefined,
      onboardingCompleted: true,
    });

    setSaving(false);
    if (dbError) { setError(dbError); return; }
    refreshProfile(); // WelcomeBack + RateCard rozetleri reload'suz güncellensin

    const fullName = session.user.user_metadata?.full_name as string | undefined;
    setFirstName(fullName?.split(' ')[0] ?? '');
    track('onboarding_complete', {
      product_type: loanType, country: country || null,
      amount, has_income: !!(income && income > 0),
    });

    // Sonuç ekranı: client-side eligibility + AI top-3 (business hariç —
    // find-rate business'ı personal kataloğuna düşürüyor, yanıltıcı olur)
    if (loanType) {
      setEligibility(calculateEligibility({
        monthlyIncome:  income && income > 0 ? income : undefined,
        loanAmount:     amount ?? undefined,
        loanTermMonths: DEFAULT_TERM_MONTHS[loanType],
        loanType,
        country:        country || undefined,
      }));
      if (loanType !== 'business') {
        fetchRecommendations(loanType, session.user.email);
      }
    }
    setStep(5);
  }

  function canAdvance() {
    if (step === 1) return loanType !== '';
    if (step === 2) return true; // country is optional
    if (step === 3) return amount !== null;
    return true;
  }

  function advance() {
    if (step < 4) setStep((step + 1) as Step);
    else handleFinish();
  }

  if (!authChecked) {
    return (
      <div className="min-h-[calc(100vh-130px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Step 5: Your matches ──
  if (step === 5) {
    const catalogRoute = LOAN_TYPES.find(t => t.value === loanType)?.route ?? '/loans';
    const typeLabel = LOAN_TYPES.find(t => t.value === loanType)?.label.toLowerCase() ?? 'loan';
    const findRateType = loanType ? FIND_RATE_TYPE[loanType] : 'personal';
    const termMonths = loanType ? DEFAULT_TERM_MONTHS[loanType] : 60;
    const elig = eligibility;
    const eligStyle = elig ? ELIGIBILITY_STYLES[elig.score] : null;

    return (
      <div className="min-h-[calc(100vh-130px)] flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-5">

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
              ✓ Profile saved
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {firstName ? `Great, ${firstName} — ` : ''}here are your best matches
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 max-w-lg mx-auto">
              {recs?.aiSummary ?? `Based on your profile, we picked the strongest ${typeLabel} offers for you.`}
            </p>
          </div>

          {/* Eligibility panel */}
          {elig && eligStyle && elig.score !== 'insufficient_data' && (
            <div className={`rounded-2xl border px-5 py-4 ${eligStyle.cls}`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Estimated eligibility</p>
                  <p className="text-lg font-extrabold">{eligStyle.label}</p>
                </div>
                {typeof elig.dti === 'number' && (
                  <div className="text-right">
                    <p className="text-xs opacity-70">Debt-to-income</p>
                    <p className="text-lg font-bold">{elig.dti}%</p>
                  </div>
                )}
              </div>
              {elig.recommendations[0] && (
                <p className="text-xs mt-2 opacity-80">{elig.recommendations[0]}</p>
              )}
              <p className="text-[11px] mt-2 opacity-60">
                Estimate only — lenders make the final decision based on a full credit assessment.
              </p>
            </div>
          )}

          {/* Recommendations */}
          {loanType === 'business' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-6 text-center space-y-3">
              <div className="text-3xl">🏢</div>
              <p className="font-semibold text-slate-800">Business financing is best compared side by side</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Browse business loans across 8 markets, or ask NordicAI in corporate mode —
                it knows the government and EU support programs too.
              </p>
            </div>
          ) : recsLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 px-5 py-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-slate-400">Analyzing your profile against live market rates…</p>
            </div>
          ) : recsError || !recs ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-6 text-center space-y-2">
              <p className="font-semibold text-slate-800">We couldn&apos;t build recommendations right now</p>
              <p className="text-sm text-slate-500">
                Your profile is saved — browse the full catalog with your filters instead.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recs.recommendations.map(rec => {
                const monthly = amount && rec.representativeRate
                  ? calculateMonthlyPayment(amount, rec.representativeRate, termMonths)
                  : null;
                return (
                  <div
                    key={rec.productId}
                    className={`bg-white rounded-2xl shadow-sm border px-5 py-5 ${
                      rec.rank === 1 ? 'border-sky-300 ring-1 ring-sky-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                        <RecLogo logo={rec.logo} mono={rec.mono ?? '•'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900">{rec.name}</p>
                          {rec.rank === 1 && (
                            <span className="bg-sky-100 text-sky-700 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5">
                              Best match
                            </span>
                          )}
                          {rec.badge && (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full px-2 py-0.5">
                              {rec.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.whyThis}</p>
                        <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                          {rec.representativeRate !== undefined && (
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide">From</p>
                              <p className="text-base font-extrabold text-slate-900">{rec.representativeRate}%</p>
                            </div>
                          )}
                          {monthly !== null && (
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Est. monthly*</p>
                              <p className="text-base font-extrabold text-slate-900">
                                €{Math.round(monthly).toLocaleString('en-US')}
                              </p>
                            </div>
                          )}
                          {rec.processingTime && (
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Decision</p>
                              <p className="text-sm font-semibold text-slate-700">{rec.processingTime}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <a
                        href={buildGoLink(rec.applyUrl, {
                          inst: rec.productId,
                          pid: rec.productId,
                          pt: findRateType,
                          pl: 'onboarding',
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackRecommendationClick(rec.rank, rec.productId, recs.leadId)}
                        className="flex-shrink-0 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors self-center"
                      >
                        Apply →
                      </a>
                    </div>
                  </div>
                );
              })}
              {amount && (
                <p className="text-[11px] text-slate-400 text-center">
                  *Estimated for €{amount.toLocaleString('en-US')} over {Math.round(termMonths / 12)} years at the
                  representative rate. Actual terms depend on the lender&apos;s assessment.
                </p>
              )}
            </div>
          )}

          {/* Footer CTAs */}
          <div className="flex gap-3">
            <Link
              href={catalogRoute}
              className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
            >
              Browse all {typeLabel}s →
            </Link>
            <button
              onClick={() => { setStep(1); setRecs(null); setRecsError(false); }}
              className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl px-5 py-3 text-sm transition-colors"
            >
              Edit preferences
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Step labels */}
        <div className="flex justify-between mb-2 px-0.5">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={`text-xs font-medium transition-colors ${
              i + 1 === step ? 'text-sky-600' : i + 1 < step ? 'text-slate-400' : 'text-slate-300'
            }`}>
              {label}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-sky-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Step {step} of 4</p>
            <h1 className="text-lg font-bold text-white">
              {step === 1 && 'What are you looking for?'}
              {step === 2 && 'Which country interests you?'}
              {step === 3 && 'How much do you need?'}
              {step === 4 && 'What is your monthly income?'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {step === 1 && 'We\'ll show you the best matching rates.'}
              {step === 2 && 'We\'ll prioritise products from that market.'}
              {step === 3 && 'Helps us filter relevant loan limits.'}
              {step === 4 && 'Used to estimate your eligibility — never shared.'}
            </p>
          </div>

          <div className="px-8 py-7">
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ── Step 1: Loan type ── */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {LOAN_TYPES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLoanType(opt.value)}
                    className={`text-left rounded-xl border-2 px-4 py-4 transition-all ${
                      loanType === opt.value
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <p className="font-semibold text-slate-800 text-sm">{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* ── Step 2: Country ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {COUNTRIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => setCountry(country === c.code ? '' : c.code)}
                      className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm transition-all ${
                        country === c.code
                          ? 'border-sky-500 bg-sky-50 text-sky-800 font-medium'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <img
                        src={`https://flagcdn.com/24x18/${c.code.toLowerCase()}.png`}
                        width={24}
                        height={18}
                        alt={c.name}
                        className="rounded-sm object-cover shadow-sm flex-shrink-0"
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 text-center">Optional — tap again to deselect</p>
              </div>
            )}

            {/* ── Step 3: Amount ── */}
            {step === 3 && (
              <div className="grid grid-cols-2 gap-2">
                {AMOUNT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAmount(opt.value)}
                    className={`rounded-xl border-2 px-3 py-3 text-sm transition-all text-left ${
                      amount === opt.value
                        ? 'border-sky-500 bg-sky-50 text-sky-800 font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Step 4: Income ── */}
            {step === 4 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {INCOME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setIncome(opt.value)}
                      className={`rounded-xl border-2 px-3 py-3 text-sm transition-all text-left ${
                        income === opt.value
                          ? 'border-sky-500 bg-sky-50 text-sky-800 font-medium'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIncome(-1)}
                  className={`w-full rounded-xl border-2 px-3 py-3 text-sm transition-all text-slate-500 ${
                    income === -1
                      ? 'border-slate-400 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Prefer not to say
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep((step - 1) as Step)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl py-2.5 text-sm transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={advance}
                disabled={!canAdvance() || saving}
                className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
              >
                {saving ? 'Saving…' : step === 4 ? 'Show me rates →' : 'Continue →'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          You can update these preferences anytime from your profile.
        </p>
      </div>
    </div>
  );
}
