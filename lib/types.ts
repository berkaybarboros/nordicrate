export type CountryCode = 'DK' | 'FI' | 'IS' | 'NO' | 'SE' | 'EE' | 'LV' | 'LT';
export type InstitutionType = 'bank' | 'insurance' | 'credit_union';
export type LoanType = 'personal' | 'mortgage' | 'auto' | 'business' | 'student';
export type CustomerType = 'individual' | 'corporate';
export type Currency = 'DKK' | 'EUR' | 'ISK' | 'NOK' | 'SEK';
export type Region = 'nordic' | 'baltic';

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
