'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { upsertUserProfile } from '@/lib/db';
import { COUNTRIES } from '@/lib/data';

type Step = 1 | 2 | 3 | 4;

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>(1);
  const [loanType, setLoanType]   = useState<LoanType | ''>('');
  const [country, setCountry]     = useState('');
  const [amount, setAmount]       = useState<number | null>(null);
  const [income, setIncome]       = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [authChecked, setAuth]    = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/register');
      else setAuth(true);
    });
  }, [router]);

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
      monthlyIncome:       income ?? undefined,
      onboardingCompleted: true,
    });

    setSaving(false);
    if (dbError) { setError(dbError); return; }

    const route = LOAN_TYPES.find(t => t.value === loanType)?.route ?? '/loans';
    router.push(route);
    router.refresh();
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
                      <span className="text-xl leading-none">{c.flag}</span>
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
