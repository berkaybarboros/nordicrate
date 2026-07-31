'use client';

/**
 * WelcomeBack — onboarding'i tamamlamış kullanıcıya ana sayfada kişisel şerit.
 * Anonim/onboarding'siz kullanıcıda null döner (statik sayfa bozulmaz, CLS yok:
 * kendi section'ı olduğu için içerik altına itilir, üstüne binmez).
 */

import Link from 'next/link';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { getCountry, LOAN_TYPE_ICONS, LOAN_TYPE_LABELS } from '@/lib/utils';
import type { LoanType } from '@/lib/types';
import CountryFlag from '@/components/CountryFlag';

const TYPE_ROUTES: Record<string, string> = {
  personal: '/loans/personal',
  mortgage: '/loans/mortgage',
  auto:     '/loans/car',
  business: '/loans/business',
};

export default function WelcomeBack() {
  const { profile } = useUserProfile();
  if (!profile?.onboardingCompleted) return null;

  const loanType = (profile.preferredLoanTypes?.[0] ?? 'personal') as LoanType;
  const route = TYPE_ROUTES[loanType] ?? '/loans';
  const countryInfo = profile.country ? getCountry(profile.country) : null;
  const firstName = profile.name?.split(' ')[0];

  return (
    <section className="bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <p className="text-white font-bold text-sm">
              Welcome back{firstName ? `, ${firstName}` : ''} 👋
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-medium rounded-full px-2.5 py-1">
                {LOAN_TYPE_ICONS[loanType]} {LOAN_TYPE_LABELS[loanType]}
              </span>
              {countryInfo && (
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-medium rounded-full px-2.5 py-1">
                  <CountryFlag code={countryInfo.code} size={14} rounded="sm" />
                  {countryInfo.name}
                </span>
              )}
              {profile.preferredAmount != null && (
                <span className="inline-flex items-center bg-white/10 text-white/90 text-xs font-medium rounded-full px-2.5 py-1">
                  ~€{profile.preferredAmount.toLocaleString('en-US')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={route}
              className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg px-4 py-2 transition-colors"
            >
              Your top rates →
            </Link>
            <Link
              href="/onboarding"
              className="text-white/60 hover:text-white text-xs font-medium transition-colors"
            >
              Update preferences
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
