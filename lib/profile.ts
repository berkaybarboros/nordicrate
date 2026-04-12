import { PRODUCTS, INSTITUTIONS, COUNTRIES } from '@/lib/data';
import type { LoanProduct, LoanType } from '@/lib/types';

export interface UserProfile {
  monthlyIncome?: number;       // EUR/month net
  loanAmount?: number;          // EUR
  loanTermMonths?: number;      // months
  loanType?: LoanType;
  country?: string;             // ISO code e.g. 'EE'
  employmentType?: 'employed' | 'self_employed' | 'freelancer' | 'student' | 'unemployed';
  isResident?: boolean;
  hasCollateral?: boolean;
  existingMonthlyDebt?: number; // EUR existing debt payments/month
  currency?: string;
}

export type EligibilityScore = 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient_data';

export interface EligibilityResult {
  score: EligibilityScore;
  dti?: number;           // Debt-to-Income ratio %
  maxLoanDTI?: number;    // Max loan amount based on DTI
  matchedProducts: LoanProduct[];
  reasons: string[];
  recommendations: string[];
}

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function calculateEligibility(profile: UserProfile): EligibilityResult {
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // Not enough data
  if (!profile.monthlyIncome && !profile.loanAmount) {
    return { score: 'insufficient_data', matchedProducts: [], reasons: ['Provide income and loan amount for eligibility check'], recommendations: [] };
  }

  // Match products
  let products = [...PRODUCTS];

  if (profile.loanType) {
    products = products.filter(p => p.type === profile.loanType);
  }

  if (profile.country) {
    products = products.filter(p => {
      const inst = INSTITUTIONS.find(i => i.id === p.institutionId);
      return inst?.country === profile.country;
    });
  }

  if (profile.loanAmount) {
    products = products.filter(p => p.limitMin <= profile.loanAmount! && p.limitMax >= profile.loanAmount!);
  }

  if (profile.isResident === false) {
    // Prefer e-resident friendly
    const eResidentProducts = products.filter(p => {
      const inst = INSTITUTIONS.find(i => i.id === p.institutionId);
      return inst?.isEResidentFriendly || inst?.isDigitalFriendly;
    });
    if (eResidentProducts.length > 0) products = eResidentProducts;
    reasons.push('Non-resident: showing e-Resident & digital-friendly banks only');
    recommendations.push('Consider Estonian e-Residency for full banking access');
  }

  if (profile.hasCollateral === false) {
    products = products.filter(p => !p.collateralRequired);
  }

  products = products.sort((a, b) => a.rateMin - b.rateMin).slice(0, 5);

  // DTI Calculation
  let dti: number | undefined;
  let maxLoanDTI: number | undefined;
  let score: EligibilityScore = 'good';

  if (profile.monthlyIncome && profile.loanAmount) {
    const termMonths = profile.loanTermMonths ?? 60;
    const representativeRate = products[0]?.rateMin ?? 8;
    const monthlyPayment = calculateMonthlyPayment(profile.loanAmount, representativeRate, termMonths);
    const existingDebt = profile.existingMonthlyDebt ?? 0;
    const totalDebt = monthlyPayment + existingDebt;
    dti = Math.round((totalDebt / profile.monthlyIncome) * 100);

    // Max affordable loan (35% DTI ceiling)
    const maxMonthly = profile.monthlyIncome * 0.35 - existingDebt;
    if (maxMonthly > 0) {
      const r = representativeRate / 100 / 12;
      maxLoanDTI = Math.round(maxMonthly * (Math.pow(1 + r, termMonths) - 1) / (r * Math.pow(1 + r, termMonths)));
    }

    if (dti < 25) {
      score = 'excellent';
      reasons.push(`DTI ${dti}% — well within safe range (<25%)`);
    } else if (dti < 35) {
      score = 'good';
      reasons.push(`DTI ${dti}% — acceptable range (25–35%)`);
    } else if (dti < 45) {
      score = 'fair';
      reasons.push(`DTI ${dti}% — higher risk zone (35–45%)`);
      recommendations.push(`Consider reducing loan to ~€${maxLoanDTI?.toLocaleString() ?? '—'} to stay under 35% DTI`);
    } else {
      score = 'poor';
      reasons.push(`DTI ${dti}% — exceeds safe limit (>45%)`);
      recommendations.push(`Max recommended loan: ~€${maxLoanDTI?.toLocaleString() ?? '—'} based on your income`);
    }
  }

  // Employment adjustments
  if (profile.employmentType === 'employed') {
    reasons.push('Stable employment — positive signal');
  } else if (profile.employmentType === 'self_employed' || profile.employmentType === 'freelancer') {
    if (score === 'excellent') score = 'good';
    reasons.push('Self-employed/freelancer — banks require 2+ years tax returns');
    recommendations.push('Prepare 2 years of tax declarations for application');
  } else if (profile.employmentType === 'unemployed') {
    score = 'poor';
    reasons.push('No current income — most banks will decline');
    recommendations.push('Consider government social loan programs or guarantors');
  }

  // Country context
  if (profile.country) {
    const countryInfo = COUNTRIES.find(c => c.code === profile.country);
    if (countryInfo) {
      reasons.push(`${countryInfo.flag} ${countryInfo.name} — ${products.length} matching products found`);
    }
  }

  return {
    score,
    dti,
    maxLoanDTI,
    matchedProducts: products.slice(0, 3),
    reasons,
    recommendations,
  };
}
