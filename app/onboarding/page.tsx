'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { upsertUserProfile } from '@/lib/db';
import { COUNTRIES } from '@/lib/data';

type Mode = 'personal' | 'corporate';
type Step = 1 | 2;

const EMPLOYMENT_TYPES = [
  { value: 'employed',     label: 'Employed (salary)' },
  { value: 'self_employed',label: 'Self-employed' },
  { value: 'freelancer',   label: 'Freelancer / contractor' },
  { value: 'student',      label: 'Student' },
];

const BUSINESS_STAGES = [
  { value: 'idea',        label: 'Idea stage' },
  { value: 'startup',     label: 'Startup (< 2 yrs)' },
  { value: 'growth',      label: 'Growth (2–7 yrs)' },
  { value: 'established', label: 'Established (7+ yrs)' },
];

const SECTORS = [
  { value: 'tech',           label: 'Tech / Software' },
  { value: 'fintech',        label: 'Fintech' },
  { value: 'saas',           label: 'SaaS' },
  { value: 'ecommerce',      label: 'E-commerce' },
  { value: 'manufacturing',  label: 'Manufacturing' },
  { value: 'services',       label: 'Professional services' },
  { value: 'agriculture',    label: 'Agriculture' },
  { value: 'tourism',        label: 'Tourism & hospitality' },
  { value: 'other',          label: 'Other' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]               = useState<Step>(1);
  const [mode, setMode]               = useState<Mode>('personal');
  const [country, setCountry]         = useState('');
  const [employmentType, setEmplType] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [businessStage, setBizStage]  = useState('');
  const [sector, setSector]           = useState('');
  const [fundingNeeded, setFunding]   = useState('');
  const [isEResident, setEResident]   = useState(false);
  const [isNomad, setNomad]           = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/register');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  async function handleFinish() {
    setError('');
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/login'); return; }

    const incomeNum = incomeRange ? parseInt(incomeRange) : undefined;
    const fundingNum = fundingNeeded ? parseInt(fundingNeeded) : undefined;

    const { error: dbError } = await upsertUserProfile({
      userId:             session.user.id,
      email:              session.user.email,
      name:               session.user.user_metadata?.full_name as string | undefined,
      country:            country || undefined,
      employmentType:     mode === 'personal' ? employmentType || undefined : undefined,
      monthlyIncome:      mode === 'personal' ? incomeNum : undefined,
      businessStage:      mode === 'corporate' ? businessStage || undefined : undefined,
      sector:             mode === 'corporate' ? sector || undefined : undefined,
      fundingNeeded:      mode === 'corporate' ? fundingNum : undefined,
      isEResident,
      isDigitalNomad:     isNomad,
      preferredMode:      mode,
      onboardingCompleted: true,
    });
    setSaving(false);
    if (dbError) { setError(dbError); return; }
    router.push('/');
    router.refresh();
  }

  if (!authChecked) {
    return (
      <div className="min-h-[calc(100vh-130px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-3 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                step >= n ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {n}
              </div>
              {n < 2 && <div className={`flex-1 h-0.5 transition-colors ${step > n ? 'bg-sky-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
          <span className="text-xs text-slate-400 shrink-0">Step {step} of 2</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
            <h1 className="text-lg font-bold text-white">
              {step === 1 ? 'How will you use NordicRate?' : 'A few more details'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {step === 1
                ? 'We personalise your experience based on your goal.'
                : 'Help us find your best matches.'}
            </p>
          </div>

          <div className="px-8 py-7">
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ── Step 1: mode selection ───────────────────────── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {(
                    [
                      {
                        value: 'personal',
                        icon: '👤',
                        title: 'Personal',
                        desc: 'Personal loans, mortgages, auto finance',
                      },
                      {
                        value: 'corporate',
                        icon: '🏢',
                        title: 'Business',
                        desc: 'Startup loans, SME credit, EU programs',
                      },
                    ] as const
                  ).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setMode(opt.value)}
                      className={`text-left rounded-xl border-2 px-4 py-5 transition-all ${
                        mode === opt.value
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{opt.icon}</div>
                      <p className="font-bold text-slate-800 text-sm">{opt.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 mt-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Country of interest{' '}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Any country</option>
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── Step 2: details ──────────────────────────────── */}
            {step === 2 && mode === 'personal' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Employment type
                  </label>
                  <select
                    value={employmentType}
                    onChange={e => setEmplType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Select…</option>
                    {EMPLOYMENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Monthly net income (EUR)
                  </label>
                  <select
                    value={incomeRange}
                    onChange={e => setIncomeRange(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="1000">Under €1,000</option>
                    <option value="2000">€1,000 – €2,000</option>
                    <option value="3500">€2,000 – €3,500</option>
                    <option value="5000">€3,500 – €5,000</option>
                    <option value="7500">€5,000 – €7,500</option>
                    <option value="10000">Over €7,500</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="e-res"
                    type="checkbox"
                    checked={isEResident}
                    onChange={e => setEResident(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="e-res" className="text-sm text-slate-700">
                    I have (or want) Estonian e-Residency
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="nomad"
                    type="checkbox"
                    checked={isNomad}
                    onChange={e => setNomad(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="nomad" className="text-sm text-slate-700">
                    I work remotely / digital nomad lifestyle
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl py-2.5 text-sm transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                  >
                    {saving ? 'Saving…' : 'Finish setup'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && mode === 'corporate' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Business stage
                  </label>
                  <select
                    value={businessStage}
                    onChange={e => setBizStage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Select…</option>
                    {BUSINESS_STAGES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Sector
                  </label>
                  <select
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Select…</option>
                    {SECTORS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Funding needed (EUR){' '}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <select
                    value={fundingNeeded}
                    onChange={e => setFunding(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Not sure yet</option>
                    <option value="25000">Under €25,000</option>
                    <option value="75000">€25,000 – €75,000</option>
                    <option value="200000">€75,000 – €200,000</option>
                    <option value="500000">€200,000 – €500,000</option>
                    <option value="1000000">€500,000 – €1M</option>
                    <option value="5000000">Over €1M</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="e-res-biz"
                    type="checkbox"
                    checked={isEResident}
                    onChange={e => setEResident(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="e-res-biz" className="text-sm text-slate-700">
                    I have (or want) Estonian e-Residency
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="nomad-biz"
                    type="checkbox"
                    checked={isNomad}
                    onChange={e => setNomad(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="nomad-biz" className="text-sm text-slate-700">
                    Location-independent / digital-first business
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl py-2.5 text-sm transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                  >
                    {saving ? 'Saving…' : 'Finish setup'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
