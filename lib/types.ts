export type CountryCode = 'DK' | 'FI' | 'IS' | 'NO' | 'SE' | 'EE' | 'LV' | 'LT';
export type InstitutionType =
  | 'bank'
  | 'insurance'
  | 'credit_union'
  | 'government'
  | 'fintech'
  | 'eu_fund'
  | 'cooperative';
export type LoanType = 'personal' | 'mortgage' | 'auto' | 'business' | 'student' | 'startup' | 'microloan';
export type CustomerType = 'individual' | 'corporate';
export type Currency = 'DKK' | 'EUR' | 'ISK' | 'NOK' | 'SEK';
export type Region = 'nordic' | 'baltic';

export type ProgramType =
  | 'government_loan'
  | 'grant'
  | 'guarantee'
  | 'e_residency'
  | 'digital_nomad_visa'
  | 'startup_visa'
  | 'eu_fund'
  | 'startup_loan'
  | 'microloan'
  | 'innovation_fund'
  | 'export_credit';

export type ProgramAudience =
  | 'digital_nomad'
  | 'e_resident'
  | 'startup'
  | 'sme'
  | 'individual'
  | 'corporate'
  | 'innovator'
  | 'exporter'
  | 'freelancer';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  currency: Currency;
  region: Region;
  capital: string;
  inEU: boolean;
  inEurozone: boolean;
  population: string;
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: InstitutionType;
  country: CountryCode;
  description: string;
  founded?: number;
  website?: string;
  isDigitalFriendly?: boolean;
  isEResidentFriendly?: boolean;
}

export interface LoanProduct {
  id: string;
  institutionId: string;
  name: string;
  type: LoanType;
  customerType: CustomerType;
  rateMin: number;
  rateMax: number;
  limitMin: number;
  limitMax: number;
  termMin: number;
  termMax: number;
  currency: Currency;
  features: string[];
  collateralRequired: boolean;
  processingFeePercent?: number;
  updatedAt: string;
  isPromoted?: boolean;
}

export interface GovernmentProgram {
  id: string;
  name: string;
  institution: string;
  country: CountryCode | 'EU';
  flag: string;
  type: ProgramType;
  audience: ProgramAudience[];
  description: string;
  maxAmount?: number;
  currency?: string;
  rateMin?: number;
  rateMax?: number;
  termMaxMonths?: number;
  features: string[];
  requirements: string[];
  link: string;
  isDigitalNomadFriendly?: boolean;
  isEResidentFriendly?: boolean;
  tags?: string[];
}

export interface LiveRate {
  label: string;
  rate: number;
  period?: string;
  currency?: string;
}

export interface LiveRatesData {
  euribor: {
    euribor3m: LiveRate;
    euribor6m: LiveRate;
    euribor12m: LiveRate;
  };
  centralBankRates: Record<string, LiveRate & { currency: string }>;
  fetchedAt: string;
  success: boolean;
  note?: string;
}
