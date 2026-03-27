import type { Currency, LoanType, InstitutionType, CustomerType } from './types';
import { COUNTRIES, INSTITUTIONS, PRODUCTS } from './data';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  DKK: 'kr.',
  EUR: '€',
  ISK: 'kr.',
  NOK: 'kr.',
  SEK: 'kr.',
};

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  personal: 'Personal Loan',
  mortgage: 'Mortgage',
  auto: 'Auto Loan',
  business: 'Business Loan',
  student: 'Student Loan',
  startup: 'Startup Loan',
  microloan: 'Microloan',
};

export const LOAN_TYPE_ICONS: Record<LoanType, string> = {
  personal: '👤',
  mortgage: '🏠',
  auto: '🚗',
  business: '🏢',
  student: '🎓',
  startup: '🚀',
  microloan: '💡',
};

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  bank: 'Bank',
  insurance: 'Insurance',
  credit_union: 'Credit Union',
  government: 'Government',
  fintech: 'Fintech',
  eu_fund: 'EU Fund',
  cooperative: 'Cooperative',
};

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  individual: 'Individual',
  corporate: 'Corporate',
};

export function formatAmount(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(0)}K`;
  }
  return `${symbol}${amount.toLocaleString()}`;
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

export function formatTerm(months: number): string {
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (rem === 0) return `${years} yr${years > 1 ? 's' : ''}`;
    return `${years}y ${rem}m`;
  }
  return `${months} mo`;
}

export function getRateColor(rate: number): string {
  if (rate <= 6) return 'text-emerald-600';
  if (rate <= 12) return 'text-amber-600';
  return 'text-red-500';
}

export function getLoanTypeBadgeClass(type: LoanType): string {
  const map: Record<LoanType, string> = {
    personal: 'bg-blue-100 text-blue-800',
    mortgage: 'bg-emerald-100 text-emerald-800',
    auto: 'bg-orange-100 text-orange-800',
    business: 'bg-purple-100 text-purple-800',
    student: 'bg-yellow-100 text-yellow-800',
    startup: 'bg-amber-100 text-amber-800',
    microloan: 'bg-cyan-100 text-cyan-800',
  };
  return map[type];
}

export function getInstitutionTypeBadgeClass(type: InstitutionType): string {
  const map: Record<InstitutionType, string> = {
    bank: 'bg-slate-100 text-slate-700',
    insurance: 'bg-teal-100 text-teal-700',
    credit_union: 'bg-rose-100 text-rose-700',
    government: 'bg-blue-100 text-blue-700',
    fintech: 'bg-violet-100 text-violet-700',
    eu_fund: 'bg-yellow-100 text-yellow-700',
    cooperative: 'bg-green-100 text-green-700',
  };
  return map[type];
}

export function getInstitution(id: string) {
  return INSTITUTIONS.find((i) => i.id === id);
}

export function getCountry(code: string) {
  return COUNTRIES.find((c) => c.code === code);
}

export function getProductsForPage(
  loanType?: LoanType | LoanType[],
  customerType?: CustomerType,
  countries?: string[],
  institutionTypes?: InstitutionType[]
) {
  return PRODUCTS.filter((p) => {
    if (loanType) {
      const types = Array.isArray(loanType) ? loanType : [loanType];
      if (!types.includes(p.type)) return false;
    }
    if (customerType && p.customerType !== customerType) return false;
    if (countries && countries.length > 0) {
      const inst = getInstitution(p.institutionId);
      if (!inst || !countries.includes(inst.country)) return false;
    }
    if (institutionTypes && institutionTypes.length > 0) {
      const inst = getInstitution(p.institutionId);
      if (!inst || !institutionTypes.includes(inst.type)) return false;
    }
    return true;
  });
}

/**
 * Build an affiliate / UTM link to an institution's official website.
 *
 * UTM parameter conventions:
 *  utm_source   = "nordicrate"          (our site)
 *  utm_medium   = "comparison"          (comparison table / card)
 *  utm_campaign = loan type slug         (e.g. "personal-loan", "mortgage")
 *  utm_content  = institution id         (e.g. "nordea-dk")
 *
 * If baseUrl is missing/undefined a "#" href is returned so the button is
 * still renderable without crashing.
 */
export function buildUTMLink(
  baseUrl: string | undefined,
  institutionId: string,
  loanType?: string
): string {
  if (!baseUrl) return '#';
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'nordicrate');
    url.searchParams.set('utm_medium', 'comparison');
    if (loanType) {
      url.searchParams.set('utm_campaign', loanType.replace(/_/g, '-'));
    }
    url.searchParams.set('utm_content', institutionId);
    return url.toString();
  } catch {
    return baseUrl; // malformed URL — return as-is
  }
}

// Monthly payment using standard amortisation formula
export function calculateMonthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  if (annualRatePercent === 0) return principal / months;
  const r = annualRatePercent / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// Format a number as a currency string (e.g. €1,234.56)
export function formatCurrency(amount: number, currencyCode = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Approximate APR (includes origination fee spread over loan term)
export function calculateAPR(
  principal: number,
  annualRatePercent: number,
  months: number,
  originationFeePercent = 0
): number {
  const fee = principal * (originationFeePercent / 100);
  const netPrincipal = principal - fee;
  if (netPrincipal <= 0 || months <= 0) return annualRatePercent;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRatePercent, months);
  // Newton-Raphson to find monthly rate r such that PV(r, months, monthlyPayment) = netPrincipal
  let r = annualRatePercent / 100 / 12;
  for (let i = 0; i < 100; i++) {
    const pv = monthlyPayment * (1 - Math.pow(1 + r, -months)) / r;
    const dpv = monthlyPayment * (
      Math.pow(1 + r, -months) * months / r - (1 - Math.pow(1 + r, -months)) / (r * r)
    );
    const rNew = r - (pv - netPrincipal) / dpv;
    if (Math.abs(rNew - r) < 1e-8) { r = rNew; break; }
    r = rNew;
  }
  return parseFloat((r * 12 * 100).toFixed(2));
}

export function getCountryStats(countryCode: string) {
  const countryInstitutions = INSTITUTIONS.filter((i) => i.country === countryCode);
  const institutionIds = countryInstitutions.map((i) => i.id);
  const countryProducts = PRODUCTS.filter((p) => institutionIds.includes(p.institutionId));

  const personalLoans = countryProducts.filter((p) => p.type === 'personal');
  const mortgages = countryProducts.filter((p) => p.type === 'mortgage');
  const businessLoans = countryProducts.filter((p) => p.type === 'business');

  const avgPersonalRate =
    personalLoans.length > 0
      ? personalLoans.reduce((s, p) => s + p.rateMin, 0) / personalLoans.length
      : null;
  const avgMortgageRate =
    mortgages.length > 0
      ? mortgages.reduce((s, p) => s + p.rateMin, 0) / mortgages.length
      : null;
  const avgBusinessRate =
    businessLoans.length > 0
      ? businessLoans.reduce((s, p) => s + p.rateMin, 0) / businessLoans.length
      : null;

  return {
    institutions: countryInstitutions.length,
    products: countryProducts.length,
    avgPersonalRate,
    avgMortgageRate,
    avgBusinessRate,
  };
}
