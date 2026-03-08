import type { CountryInfo, Institution, LoanProduct } from './types';

export const COUNTRIES: CountryInfo[] = [
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK', region: 'nordic', capital: 'Copenhagen', inEU: true, inEurozone: false, population: '5.9M' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', currency: 'EUR', region: 'nordic', capital: 'Helsinki', inEU: true, inEurozone: true, population: '5.5M' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', currency: 'ISK', region: 'nordic', capital: 'Reykjavik', inEU: false, inEurozone: false, population: '370K' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK', region: 'nordic', capital: 'Oslo', inEU: false, inEurozone: false, population: '5.4M' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', region: 'nordic', capital: 'Stockholm', inEU: true, inEurozone: false, population: '10.4M' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', currency: 'EUR', region: 'baltic', capital: 'Tallinn', inEU: true, inEurozone: true, population: '1.3M' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', currency: 'EUR', region: 'baltic', capital: 'Riga', inEU: true, inEurozone: true, population: '1.8M' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', currency: 'EUR', region: 'baltic', capital: 'Vilnius', inEU: true, inEurozone: true, population: '2.8M' },
];

export const INSTITUTIONS: Institution[] = [
  // DENMARK
  { id: 'nordea-dk', name: 'Nordea Bank Danmark', shortName: 'Nordea', type: 'bank', country: 'DK', description: 'One of the largest Nordic financial services groups', founded: 2000 },
  { id: 'danske-dk', name: 'Danske Bank', shortName: 'Danske Bank', type: 'bank', country: 'DK', description: "Denmark's largest bank", founded: 1871 },
  { id: 'jyske-dk', name: 'Jyske Bank', shortName: 'Jyske Bank', type: 'bank', country: 'DK', description: "Denmark's third largest bank", founded: 1967 },
  { id: 'nykredit-dk', name: 'Nykredit', shortName: 'Nykredit', type: 'bank', country: 'DK', description: 'Leading Danish mortgage institution', founded: 1985 },
  { id: 'tryg-dk', name: 'Tryg Forsikring', shortName: 'Tryg', type: 'insurance', country: 'DK', description: 'Nordic insurance company offering consumer credit', founded: 1731 },
  { id: 'topdanmark-dk', name: 'Topdanmark', shortName: 'Topdanmark', type: 'insurance', country: 'DK', description: 'Danish insurance with financial services', founded: 1898 },

  // FINLAND
  { id: 'op-fi', name: 'OP Financial Group', shortName: 'OP', type: 'bank', country: 'FI', description: "Finland's largest financial services group", founded: 1902 },
  { id: 'nordea-fi', name: 'Nordea Finland', shortName: 'Nordea', type: 'bank', country: 'FI', description: 'Major Nordic bank operating in Finland', founded: 2000 },
  { id: 'danske-fi', name: 'Danske Bank Finland', shortName: 'Danske Bank', type: 'bank', country: 'FI', description: 'Nordic banking group in Finland', founded: 2012 },
  { id: 'tapiola-fi', name: 'LähiTapiola', shortName: 'LähiTapiola', type: 'insurance', country: 'FI', description: 'Finnish insurance group offering consumer credit', founded: 2013 },
  { id: 'mandatum-fi', name: 'Mandatum Life', shortName: 'Mandatum', type: 'insurance', country: 'FI', description: 'Finnish life insurance with investment services', founded: 1990 },

  // ICELAND
  { id: 'islandsbanki-is', name: 'Íslandsbanki', shortName: 'Íslandsbanki', type: 'bank', country: 'IS', description: 'Icelandic commercial bank', founded: 2008 },
  { id: 'arion-is', name: 'Arion banki', shortName: 'Arion banki', type: 'bank', country: 'IS', description: 'Icelandic commercial bank', founded: 2008 },
  { id: 'landsbankinn-is', name: 'Landsbankinn', shortName: 'Landsbankinn', type: 'bank', country: 'IS', description: "Iceland's largest bank", founded: 1886 },
  { id: 'kvika-is', name: 'Kvika banki', shortName: 'Kvika', type: 'bank', country: 'IS', description: 'Icelandic investment and commercial bank', founded: 2006 },

  // NORWAY
  { id: 'dnb-no', name: 'DNB Bank', shortName: 'DNB', type: 'bank', country: 'NO', description: "Norway's largest financial services group", founded: 1822 },
  { id: 'nordea-no', name: 'Nordea Norway', shortName: 'Nordea', type: 'bank', country: 'NO', description: 'Major Nordic bank in Norway', founded: 2000 },
  { id: 'sparebank-no', name: 'SpareBank 1', shortName: 'SpareBank 1', type: 'bank', country: 'NO', description: 'Norwegian savings bank alliance', founded: 1823 },
  { id: 'gjensidige-no', name: 'Gjensidige Bank', shortName: 'Gjensidige', type: 'insurance', country: 'NO', description: 'Nordic insurance group with banking services', founded: 1816 },
  { id: 'if-no', name: 'If Skadeforsikring', shortName: 'If Insurance', type: 'insurance', country: 'NO', description: 'Leading Nordic insurance company', founded: 1999 },

  // SWEDEN
  { id: 'nordea-se', name: 'Nordea Sverige', shortName: 'Nordea', type: 'bank', country: 'SE', description: 'Major Nordic bank in Sweden', founded: 2000 },
  { id: 'seb-se', name: 'SEB', shortName: 'SEB', type: 'bank', country: 'SE', description: 'Swedish banking and financial services group', founded: 1856 },
  { id: 'handelsbanken-se', name: 'Handelsbanken', shortName: 'Handelsbanken', type: 'bank', country: 'SE', description: 'Swedish commercial bank', founded: 1871 },
  { id: 'swedbank-se', name: 'Swedbank', shortName: 'Swedbank', type: 'bank', country: 'SE', description: 'Swedish savings bank', founded: 1820 },
  { id: 'lansforsakringar-se', name: 'Länsförsäkringar Bank', shortName: 'Länsförsäkringar', type: 'insurance', country: 'SE', description: 'Swedish insurance-owned bank', founded: 1996 },

  // ESTONIA
  { id: 'swedbank-ee', name: 'Swedbank Eesti', shortName: 'Swedbank', type: 'bank', country: 'EE', description: 'Leading bank in Estonia', founded: 1992 },
  { id: 'seb-ee', name: 'SEB Pank', shortName: 'SEB', type: 'bank', country: 'EE', description: 'Swedish bank operating in Estonia', founded: 1995 },
  { id: 'lhv-ee', name: 'LHV Pank', shortName: 'LHV', type: 'bank', country: 'EE', description: 'Estonian bank and asset manager', founded: 1999 },
  { id: 'luminor-ee', name: 'Luminor Estonia', shortName: 'Luminor', type: 'bank', country: 'EE', description: 'Baltic banking group', founded: 2017 },
  { id: 'bigbank-ee', name: 'Bigbank', shortName: 'Bigbank', type: 'bank', country: 'EE', description: 'Estonian consumer credit specialist', founded: 1992 },

  // LATVIA
  { id: 'swedbank-lv', name: 'Swedbank Latvija', shortName: 'Swedbank', type: 'bank', country: 'LV', description: 'Leading bank in Latvia', founded: 1992 },
  { id: 'seb-lv', name: 'SEB banka', shortName: 'SEB', type: 'bank', country: 'LV', description: 'Swedish bank in Latvia', founded: 1994 },
  { id: 'luminor-lv', name: 'Luminor Latvia', shortName: 'Luminor', type: 'bank', country: 'LV', description: 'Baltic banking group in Latvia', founded: 2017 },
  { id: 'citadele-lv', name: 'Citadele banka', shortName: 'Citadele', type: 'bank', country: 'LV', description: 'Latvian bank with Baltic presence', founded: 2010 },
  { id: 'industra-lv', name: 'Industra Bank', shortName: 'Industra', type: 'bank', country: 'LV', description: 'Latvian private bank focused on business', founded: 2006 },

  // LITHUANIA
  { id: 'swedbank-lt', name: 'Swedbank Lietuva', shortName: 'Swedbank', type: 'bank', country: 'LT', description: 'Major bank in Lithuania', founded: 1992 },
  { id: 'seb-lt', name: 'SEB Lietuva', shortName: 'SEB', type: 'bank', country: 'LT', description: 'Swedish bank in Lithuania', founded: 1995 },
  { id: 'luminor-lt', name: 'Luminor Lithuania', shortName: 'Luminor', type: 'bank', country: 'LT', description: 'Baltic banking group in Lithuania', founded: 2017 },
  { id: 'siauliu-lt', name: 'Šiaulių bankas', shortName: 'Šiaulių bankas', type: 'bank', country: 'LT', description: 'Lithuanian commercial bank', founded: 1992 },
  { id: 'citadele-lt', name: 'Citadele Lietuva', shortName: 'Citadele', type: 'bank', country: 'LT', description: 'Baltic bank with Lithuanian operations', founded: 2012 },
];

export const PRODUCTS: LoanProduct[] = [
  // ==================== DENMARK (DKK) ====================
  { id: 'nordea-dk-p1', institutionId: 'nordea-dk', name: 'Personal Loan', type: 'personal', customerType: 'individual', rateMin: 7.9, rateMax: 19.9, limitMin: 20000, limitMax: 500000, termMin: 12, termMax: 120, currency: 'DKK', features: ['Online application', 'Fast approval', 'Flexible repayment'], collateralRequired: false, updatedAt: '2025-11-15', isPromoted: true },
  { id: 'nordea-dk-m1', institutionId: 'nordea-dk', name: 'Home Mortgage', type: 'mortgage', customerType: 'individual', rateMin: 3.15, rateMax: 5.25, limitMin: 200000, limitMax: 8000000, termMin: 60, termMax: 360, currency: 'DKK', features: ['Variable & fixed rate', 'Up to 80% LTV', 'Green mortgage option'], collateralRequired: true, processingFeePercent: 0.5, updatedAt: '2025-11-18' },
  { id: 'nordea-dk-b1', institutionId: 'nordea-dk', name: 'Business Loan', type: 'business', customerType: 'corporate', rateMin: 5.5, rateMax: 11.5, limitMin: 100000, limitMax: 10000000, termMin: 12, termMax: 120, currency: 'DKK', features: ['Dedicated advisor', 'Flexible terms', 'Working capital'], collateralRequired: false, updatedAt: '2025-11-10' },

  { id: 'danske-dk-p1', institutionId: 'danske-dk', name: 'FlexLoan Personal', type: 'personal', customerType: 'individual', rateMin: 6.99, rateMax: 18.49, limitMin: 15000, limitMax: 600000, termMin: 12, termMax: 144, currency: 'DKK', features: ['No early repayment fee', 'Digital management', '24h approval'], collateralRequired: false, updatedAt: '2025-11-20', isPromoted: true },
  { id: 'danske-dk-m1', institutionId: 'danske-dk', name: 'RealKredit Mortgage', type: 'mortgage', customerType: 'individual', rateMin: 2.99, rateMax: 5.49, limitMin: 300000, limitMax: 12000000, termMin: 60, termMax: 360, currency: 'DKK', features: ['Competitive rates', 'Green mortgage options', 'Up to 80% LTV'], collateralRequired: true, processingFeePercent: 0.4, updatedAt: '2025-11-19' },
  { id: 'danske-dk-b1', institutionId: 'danske-dk', name: 'Business Credit Line', type: 'business', customerType: 'corporate', rateMin: 4.99, rateMax: 9.99, limitMin: 50000, limitMax: 5000000, termMin: 12, termMax: 84, currency: 'DKK', features: ['Revolving credit', 'Online management', 'Quick disbursement'], collateralRequired: false, updatedAt: '2025-11-15' },

  { id: 'jyske-dk-p1', institutionId: 'jyske-dk', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 8.49, rateMax: 21.99, limitMin: 10000, limitMax: 300000, termMin: 12, termMax: 96, currency: 'DKK', features: ['Fast decision', 'Transparent pricing', 'Flexible amounts'], collateralRequired: false, updatedAt: '2025-11-12' },
  { id: 'jyske-dk-m1', institutionId: 'jyske-dk', name: 'JyskeRealkredit', type: 'mortgage', customerType: 'individual', rateMin: 3.25, rateMax: 5.75, limitMin: 250000, limitMax: 10000000, termMin: 60, termMax: 360, currency: 'DKK', features: ['Fixed and variable rates', 'Refinancing options', 'Nordic expertise'], collateralRequired: true, updatedAt: '2025-11-14' },

  { id: 'nykredit-dk-m1', institutionId: 'nykredit-dk', name: 'Home Loan', type: 'mortgage', customerType: 'individual', rateMin: 2.75, rateMax: 4.99, limitMin: 200000, limitMax: 15000000, termMin: 60, termMax: 360, currency: 'DKK', features: ['Market-leading rates', 'Green financing', 'Digital process'], collateralRequired: true, processingFeePercent: 0.3, updatedAt: '2025-11-21', isPromoted: true },
  { id: 'nykredit-dk-cb1', institutionId: 'nykredit-dk', name: 'Commercial Real Estate', type: 'mortgage', customerType: 'corporate', rateMin: 3.5, rateMax: 7.0, limitMin: 1000000, limitMax: 100000000, termMin: 60, termMax: 300, currency: 'DKK', features: ['Commercial property', 'Tailored solutions', 'Large amounts'], collateralRequired: true, updatedAt: '2025-11-17' },

  { id: 'tryg-dk-p1', institutionId: 'tryg-dk', name: 'Personal Finance', type: 'personal', customerType: 'individual', rateMin: 9.99, rateMax: 24.99, limitMin: 10000, limitMax: 200000, termMin: 12, termMax: 84, currency: 'DKK', features: ['Insurance bundled', 'Simple application', 'Customer discounts'], collateralRequired: false, updatedAt: '2025-11-08' },
  { id: 'topdanmark-dk-p1', institutionId: 'topdanmark-dk', name: 'Insurance Customer Credit', type: 'personal', customerType: 'individual', rateMin: 11.5, rateMax: 26.9, limitMin: 5000, limitMax: 150000, termMin: 6, termMax: 72, currency: 'DKK', features: ['Existing customer rate', 'No collateral', 'Bundled services'], collateralRequired: false, updatedAt: '2025-11-07' },

  // ==================== FINLAND (EUR) ====================
  { id: 'op-fi-p1', institutionId: 'op-fi', name: 'OP Consumer Credit', type: 'personal', customerType: 'individual', rateMin: 6.5, rateMax: 17.9, limitMin: 2000, limitMax: 70000, termMin: 12, termMax: 120, currency: 'EUR', features: ['OP bonus', 'Owner-customer benefits', 'Mobile banking'], collateralRequired: false, updatedAt: '2025-11-20', isPromoted: true },
  { id: 'op-fi-m1', institutionId: 'op-fi', name: 'OP Home Loan', type: 'mortgage', customerType: 'individual', rateMin: 3.25, rateMax: 5.5, limitMin: 20000, limitMax: 1500000, termMin: 60, termMax: 300, currency: 'EUR', features: ['Owner-customer rate', 'Green mortgage', 'Up to 75% LTV'], collateralRequired: true, processingFeePercent: 0.4, updatedAt: '2025-11-21' },
  { id: 'op-fi-b1', institutionId: 'op-fi', name: 'OP Business Loan', type: 'business', customerType: 'corporate', rateMin: 4.5, rateMax: 10.5, limitMin: 10000, limitMax: 5000000, termMin: 12, termMax: 120, currency: 'EUR', features: ['SME specialist', 'Quick processing', 'Flexible collateral'], collateralRequired: false, updatedAt: '2025-11-18' },
  { id: 'op-fi-a1', institutionId: 'op-fi', name: 'OP Auto Finance', type: 'auto', customerType: 'individual', rateMin: 4.99, rateMax: 12.99, limitMin: 3000, limitMax: 100000, termMin: 12, termMax: 84, currency: 'EUR', features: ['New & used vehicles', 'Electric car bonus rate', 'Flexible terms'], collateralRequired: true, updatedAt: '2025-11-15' },

  { id: 'nordea-fi-p1', institutionId: 'nordea-fi', name: 'Personal Loan', type: 'personal', customerType: 'individual', rateMin: 7.25, rateMax: 19.5, limitMin: 1000, limitMax: 50000, termMin: 6, termMax: 120, currency: 'EUR', features: ['Online approval', 'No origination fee', 'Flexible payment'], collateralRequired: false, updatedAt: '2025-11-19' },
  { id: 'nordea-fi-m1', institutionId: 'nordea-fi', name: 'Home Loan', type: 'mortgage', customerType: 'individual', rateMin: 3.5, rateMax: 5.75, limitMin: 30000, limitMax: 2000000, termMin: 60, termMax: 300, currency: 'EUR', features: ['EURIBOR + margin', 'Fixed rate option', 'Energy efficiency bonus'], collateralRequired: true, processingFeePercent: 0.5, updatedAt: '2025-11-20' },
  { id: 'nordea-fi-b1', institutionId: 'nordea-fi', name: 'Business Credit', type: 'business', customerType: 'corporate', rateMin: 5.0, rateMax: 11.0, limitMin: 20000, limitMax: 3000000, termMin: 12, termMax: 84, currency: 'EUR', features: ['Nordic expertise', 'Sustainability finance', 'Relationship banking'], collateralRequired: false, updatedAt: '2025-11-16' },

  { id: 'tapiola-fi-p1', institutionId: 'tapiola-fi', name: 'Personal Loan', type: 'personal', customerType: 'individual', rateMin: 8.99, rateMax: 22.99, limitMin: 1000, limitMax: 30000, termMin: 6, termMax: 96, currency: 'EUR', features: ['Insurance customer benefits', 'Simple process', 'Quick decision'], collateralRequired: false, updatedAt: '2025-11-10' },
  { id: 'tapiola-fi-a1', institutionId: 'tapiola-fi', name: 'Auto Finance', type: 'auto', customerType: 'individual', rateMin: 5.99, rateMax: 14.99, limitMin: 5000, limitMax: 80000, termMin: 12, termMax: 72, currency: 'EUR', features: ['Car insurance bundle discount', 'New & used cars', 'Flexible terms'], collateralRequired: true, updatedAt: '2025-11-12' },

  { id: 'mandatum-fi-p1', institutionId: 'mandatum-fi', name: 'Life Insurance Credit', type: 'personal', customerType: 'individual', rateMin: 7.5, rateMax: 18.5, limitMin: 2000, limitMax: 40000, termMin: 12, termMax: 84, currency: 'EUR', features: ['Life policy collateral option', 'Customer rate', 'Flexible schedule'], collateralRequired: false, updatedAt: '2025-11-09' },

  // ==================== ICELAND (ISK) ====================
  { id: 'islandsbanki-is-p1', institutionId: 'islandsbanki-is', name: 'Personal Loan', type: 'personal', customerType: 'individual', rateMin: 9.5, rateMax: 22.0, limitMin: 100000, limitMax: 8000000, termMin: 12, termMax: 96, currency: 'ISK', features: ['Digital banking', 'Flexible terms', 'Indexation options'], collateralRequired: false, updatedAt: '2025-11-15' },
  { id: 'islandsbanki-is-m1', institutionId: 'islandsbanki-is', name: 'Home Loan', type: 'mortgage', customerType: 'individual', rateMin: 5.5, rateMax: 8.5, limitMin: 5000000, limitMax: 200000000, termMin: 60, termMax: 300, currency: 'ISK', features: ['CPI-linked option', 'Non-indexed option', 'Up to 85% LTV'], collateralRequired: true, processingFeePercent: 0.5, updatedAt: '2025-11-18' },
  { id: 'islandsbanki-is-b1', institutionId: 'islandsbanki-is', name: 'Business Financing', type: 'business', customerType: 'corporate', rateMin: 8.0, rateMax: 14.0, limitMin: 500000, limitMax: 500000000, termMin: 12, termMax: 120, currency: 'ISK', features: ['SME support', 'Export financing', 'Working capital'], collateralRequired: false, updatedAt: '2025-11-14' },

  { id: 'arion-is-p1', institutionId: 'arion-is', name: 'Personal Credit', type: 'personal', customerType: 'individual', rateMin: 10.5, rateMax: 24.9, limitMin: 50000, limitMax: 5000000, termMin: 12, termMax: 84, currency: 'ISK', features: ['Quick approval', 'Online process', 'No collateral'], collateralRequired: false, updatedAt: '2025-11-13', isPromoted: true },
  { id: 'arion-is-m1', institutionId: 'arion-is', name: 'Housing Loan', type: 'mortgage', customerType: 'individual', rateMin: 5.75, rateMax: 9.0, limitMin: 3000000, limitMax: 150000000, termMin: 60, termMax: 300, currency: 'ISK', features: ['Young buyer bonus', 'Green housing rate', 'Flexible repayment'], collateralRequired: true, updatedAt: '2025-11-17' },
  { id: 'arion-is-b1', institutionId: 'arion-is', name: 'SME Loan', type: 'business', customerType: 'corporate', rateMin: 8.5, rateMax: 15.5, limitMin: 1000000, limitMax: 300000000, termMin: 12, termMax: 84, currency: 'ISK', features: ['SME-focused', 'Fast decision', 'Flexible security'], collateralRequired: false, updatedAt: '2025-11-11' },

  { id: 'landsbankinn-is-p1', institutionId: 'landsbankinn-is', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 8.9, rateMax: 20.5, limitMin: 100000, limitMax: 10000000, termMin: 6, termMax: 120, currency: 'ISK', features: ['State-backed stability', 'Nationwide branches', 'Digital & in-branch'], collateralRequired: false, updatedAt: '2025-11-16' },
  { id: 'landsbankinn-is-m1', institutionId: 'landsbankinn-is', name: 'Home Loan', type: 'mortgage', customerType: 'individual', rateMin: 5.25, rateMax: 8.0, limitMin: 5000000, limitMax: 250000000, termMin: 60, termMax: 360, currency: 'ISK', features: ['Government scheme eligible', 'CPI and non-CPI', 'Large network'], collateralRequired: true, updatedAt: '2025-11-18' },

  // ==================== NORWAY (NOK) ====================
  { id: 'dnb-no-p1', institutionId: 'dnb-no', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 6.9, rateMax: 18.9, limitMin: 10000, limitMax: 600000, termMin: 12, termMax: 120, currency: 'NOK', features: ['Instant digital approval', 'Vipps integration', 'No security required'], collateralRequired: false, updatedAt: '2025-11-21', isPromoted: true },
  { id: 'dnb-no-m1', institutionId: 'dnb-no', name: 'Boliglån', type: 'mortgage', customerType: 'individual', rateMin: 3.8, rateMax: 6.2, limitMin: 200000, limitMax: 15000000, termMin: 60, termMax: 300, currency: 'NOK', features: ['Market rates', 'Up to 85% LTV', 'First-time buyer support'], collateralRequired: true, processingFeePercent: 0.25, updatedAt: '2025-11-21' },
  { id: 'dnb-no-b1', institutionId: 'dnb-no', name: 'Business Finance', type: 'business', customerType: 'corporate', rateMin: 5.5, rateMax: 12.0, limitMin: 200000, limitMax: 50000000, termMin: 12, termMax: 120, currency: 'NOK', features: ["Norway's largest bank", 'Offshore & maritime expertise', 'Sustainable finance'], collateralRequired: false, updatedAt: '2025-11-20' },

  { id: 'sparebank-no-p1', institutionId: 'sparebank-no', name: 'Forbrukslån', type: 'personal', customerType: 'individual', rateMin: 7.99, rateMax: 21.9, limitMin: 10000, limitMax: 500000, termMin: 12, termMax: 96, currency: 'NOK', features: ['Local bank expertise', 'Competitive rates', 'Savings bank values'], collateralRequired: false, updatedAt: '2025-11-19' },
  { id: 'sparebank-no-m1', institutionId: 'sparebank-no', name: 'Boliglån', type: 'mortgage', customerType: 'individual', rateMin: 4.0, rateMax: 6.5, limitMin: 100000, limitMax: 10000000, termMin: 60, termMax: 360, currency: 'NOK', features: ['Local knowledge', 'First-time buyer programs', 'Union member discounts'], collateralRequired: true, updatedAt: '2025-11-18' },
  { id: 'sparebank-no-b1', institutionId: 'sparebank-no', name: 'Bedriftslån', type: 'business', customerType: 'corporate', rateMin: 5.9, rateMax: 12.5, limitMin: 100000, limitMax: 20000000, termMin: 12, termMax: 96, currency: 'NOK', features: ['Regional expertise', 'Agriculture & fisheries', 'SME-friendly'], collateralRequired: false, updatedAt: '2025-11-16' },

  { id: 'gjensidige-no-p1', institutionId: 'gjensidige-no', name: 'Forbrukslån', type: 'personal', customerType: 'individual', rateMin: 9.5, rateMax: 23.5, limitMin: 20000, limitMax: 400000, termMin: 12, termMax: 84, currency: 'NOK', features: ['Insurance customer discount', 'Online process', 'Bundled services'], collateralRequired: false, updatedAt: '2025-11-11' },
  { id: 'gjensidige-no-a1', institutionId: 'gjensidige-no', name: 'Car Financing', type: 'auto', customerType: 'individual', rateMin: 5.99, rateMax: 13.99, limitMin: 50000, limitMax: 1000000, termMin: 12, termMax: 84, currency: 'NOK', features: ['Auto insurance bundle', 'Electric vehicle rates', 'New & used cars'], collateralRequired: true, updatedAt: '2025-11-10' },

  // ==================== SWEDEN (SEK) ====================
  { id: 'nordea-se-p1', institutionId: 'nordea-se', name: 'Privatlån', type: 'personal', customerType: 'individual', rateMin: 6.49, rateMax: 17.99, limitMin: 10000, limitMax: 600000, termMin: 12, termMax: 120, currency: 'SEK', features: ['BankID application', 'Same-day decision', 'No fees'], collateralRequired: false, updatedAt: '2025-11-20' },
  { id: 'nordea-se-m1', institutionId: 'nordea-se', name: 'Bolån', type: 'mortgage', customerType: 'individual', rateMin: 3.7, rateMax: 6.0, limitMin: 200000, limitMax: 15000000, termMin: 60, termMax: 360, currency: 'SEK', features: ['Competitive rates', 'Green mortgage bonus', 'Up to 85% LTV'], collateralRequired: true, processingFeePercent: 0.3, updatedAt: '2025-11-21' },
  { id: 'nordea-se-b1', institutionId: 'nordea-se', name: 'Företagslån', type: 'business', customerType: 'corporate', rateMin: 5.0, rateMax: 11.5, limitMin: 100000, limitMax: 10000000, termMin: 12, termMax: 120, currency: 'SEK', features: ['Nordic network', 'Sustainability-linked loans', 'International reach'], collateralRequired: false, updatedAt: '2025-11-18' },

  { id: 'seb-se-p1', institutionId: 'seb-se', name: 'Privatlån', type: 'personal', customerType: 'individual', rateMin: 7.0, rateMax: 19.99, limitMin: 10000, limitMax: 500000, termMin: 12, termMax: 120, currency: 'SEK', features: ['BankID', 'Mobile app management', 'Payment holiday options'], collateralRequired: false, updatedAt: '2025-11-19', isPromoted: true },
  { id: 'seb-se-m1', institutionId: 'seb-se', name: 'Bolån', type: 'mortgage', customerType: 'individual', rateMin: 3.85, rateMax: 6.1, limitMin: 200000, limitMax: 20000000, termMin: 60, termMax: 360, currency: 'SEK', features: ['STIBOR-linked', 'Fixed rate 1-10 years', 'Energy efficiency rate'], collateralRequired: true, updatedAt: '2025-11-20' },
  { id: 'seb-se-b1', institutionId: 'seb-se', name: 'Företagskredit', type: 'business', customerType: 'corporate', rateMin: 4.75, rateMax: 10.5, limitMin: 200000, limitMax: 20000000, termMin: 12, termMax: 96, currency: 'SEK', features: ['156+ years experience', 'International business', 'Green finance'], collateralRequired: false, updatedAt: '2025-11-17' },

  { id: 'handelsbanken-se-p1', institutionId: 'handelsbanken-se', name: 'Privatlån', type: 'personal', customerType: 'individual', rateMin: 7.5, rateMax: 18.5, limitMin: 20000, limitMax: 400000, termMin: 12, termMax: 96, currency: 'SEK', features: ['Branch-based service', 'Relationship banking', 'No application fee'], collateralRequired: false, updatedAt: '2025-11-15' },
  { id: 'handelsbanken-se-m1', institutionId: 'handelsbanken-se', name: 'Bolån', type: 'mortgage', customerType: 'individual', rateMin: 3.95, rateMax: 6.25, limitMin: 300000, limitMax: 25000000, termMin: 60, termMax: 360, currency: 'SEK', features: ['Local branch expertise', 'Long-term partnerships', 'Decentralized decisions'], collateralRequired: true, updatedAt: '2025-11-18' },
  { id: 'handelsbanken-se-b1', institutionId: 'handelsbanken-se', name: 'Företagslån', type: 'business', customerType: 'corporate', rateMin: 5.25, rateMax: 11.0, limitMin: 200000, limitMax: 15000000, termMin: 12, termMax: 96, currency: 'SEK', features: ['Relationship model', 'Local decision-making', 'Tailored solutions'], collateralRequired: false, updatedAt: '2025-11-14' },

  { id: 'lansforsakringar-se-p1', institutionId: 'lansforsakringar-se', name: 'Privatlån', type: 'personal', customerType: 'individual', rateMin: 6.9, rateMax: 16.9, limitMin: 10000, limitMax: 350000, termMin: 12, termMax: 96, currency: 'SEK', features: ['Insurance bundling discount', 'Local company', 'Customer-owned'], collateralRequired: false, updatedAt: '2025-11-14', isPromoted: true },
  { id: 'lansforsakringar-se-m1', institutionId: 'lansforsakringar-se', name: 'Bolån', type: 'mortgage', customerType: 'individual', rateMin: 3.6, rateMax: 5.85, limitMin: 200000, limitMax: 12000000, termMin: 60, termMax: 360, currency: 'SEK', features: ['Insurance bundle 0.2% discount', 'Digital process', 'Green mortgage'], collateralRequired: true, updatedAt: '2025-11-16' },

  // ==================== ESTONIA (EUR) ====================
  { id: 'swedbank-ee-p1', institutionId: 'swedbank-ee', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 9.9, rateMax: 24.9, limitMin: 500, limitMax: 30000, termMin: 6, termMax: 120, currency: 'EUR', features: ['Smart-ID application', 'Same-day decision', 'Mobile banking'], collateralRequired: false, updatedAt: '2025-11-20' },
  { id: 'swedbank-ee-m1', institutionId: 'swedbank-ee', name: 'Home Loan', type: 'mortgage', customerType: 'individual', rateMin: 4.5, rateMax: 7.0, limitMin: 10000, limitMax: 500000, termMin: 60, termMax: 300, currency: 'EUR', features: ['EURIBOR + margin', 'Up to 85% LTV', 'Energy-efficient bonus'], collateralRequired: true, processingFeePercent: 0.5, updatedAt: '2025-11-21' },
  { id: 'swedbank-ee-b1', institutionId: 'swedbank-ee', name: 'Business Loan', type: 'business', customerType: 'corporate', rateMin: 6.5, rateMax: 13.0, limitMin: 5000, limitMax: 1000000, termMin: 12, termMax: 84, currency: 'EUR', features: ['SME support', 'EU-funded programs', 'Export financing'], collateralRequired: false, updatedAt: '2025-11-19' },

  { id: 'lhv-ee-p1', institutionId: 'lhv-ee', name: 'Personal Loan', type: 'personal', customerType: 'individual', rateMin: 11.9, rateMax: 27.9, limitMin: 300, limitMax: 20000, termMin: 6, termMax: 84, currency: 'EUR', features: ['Estonian bank', 'Mobile-first', 'Flexible terms'], collateralRequired: false, updatedAt: '2025-11-17' },
  { id: 'lhv-ee-m1', institutionId: 'lhv-ee', name: 'Home Loan', type: 'mortgage', customerType: 'individual', rateMin: 5.0, rateMax: 7.5, limitMin: 15000, limitMax: 400000, termMin: 60, termMax: 360, currency: 'EUR', features: ['First-time buyer program', 'State guarantee option', 'Digital process'], collateralRequired: true, updatedAt: '2025-11-18', isPromoted: true },
  { id: 'lhv-ee-b1', institutionId: 'lhv-ee', name: 'Business Credit', type: 'business', customerType: 'corporate', rateMin: 7.0, rateMax: 14.5, limitMin: 3000, limitMax: 500000, termMin: 6, termMax: 60, currency: 'EUR', features: ['Startup-friendly', 'Fast-growing companies focus', 'Flexible security'], collateralRequired: false, updatedAt: '2025-11-15' },

  { id: 'luminor-ee-p1', institutionId: 'luminor-ee', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 10.5, rateMax: 25.9, limitMin: 500, limitMax: 25000, termMin: 6, termMax: 96, currency: 'EUR', features: ['Baltic expertise', 'Online application', 'Flexible repayment'], collateralRequired: false, updatedAt: '2025-11-16' },
  { id: 'luminor-ee-m1', institutionId: 'luminor-ee', name: 'Housing Loan', type: 'mortgage', customerType: 'individual', rateMin: 4.75, rateMax: 7.25, limitMin: 10000, limitMax: 450000, termMin: 60, termMax: 300, currency: 'EUR', features: ['EURIBOR-linked', 'Energy-efficient homes bonus', 'Baltic-wide'], collateralRequired: true, updatedAt: '2025-11-20' },

  { id: 'bigbank-ee-p1', institutionId: 'bigbank-ee', name: 'Personal Loan', type: 'personal', customerType: 'individual', rateMin: 14.9, rateMax: 29.9, limitMin: 500, limitMax: 15000, termMin: 6, termMax: 96, currency: 'EUR', features: ['No collateral', 'Instant decision', 'Transparent fees'], collateralRequired: false, updatedAt: '2025-11-14' },
  { id: 'bigbank-ee-a1', institutionId: 'bigbank-ee', name: 'Auto Loan', type: 'auto', customerType: 'individual', rateMin: 9.9, rateMax: 19.9, limitMin: 1000, limitMax: 50000, termMin: 12, termMax: 84, currency: 'EUR', features: ['New & used vehicles', 'Fast approval', 'Simple process'], collateralRequired: true, updatedAt: '2025-11-12' },

  // ==================== LATVIA (EUR) ====================
  { id: 'swedbank-lv-p1', institutionId: 'swedbank-lv', name: 'Consumer Credit', type: 'personal', customerType: 'individual', rateMin: 11.9, rateMax: 26.9, limitMin: 500, limitMax: 28000, termMin: 6, termMax: 120, currency: 'EUR', features: ['Smart-ID', 'Online banking', 'Fast decision'], collateralRequired: false, updatedAt: '2025-11-20' },
  { id: 'swedbank-lv-m1', institutionId: 'swedbank-lv', name: 'Mortgage Loan', type: 'mortgage', customerType: 'individual', rateMin: 4.75, rateMax: 7.5, limitMin: 15000, limitMax: 600000, termMin: 60, termMax: 300, currency: 'EUR', features: ['EURIBOR + margin', 'Up to 90% LTV first home', 'Green property bonus'], collateralRequired: true, processingFeePercent: 0.4, updatedAt: '2025-11-21' },
  { id: 'swedbank-lv-b1', institutionId: 'swedbank-lv', name: 'Business Loan', type: 'business', customerType: 'corporate', rateMin: 6.9, rateMax: 13.9, limitMin: 5000, limitMax: 800000, termMin: 12, termMax: 84, currency: 'EUR', features: ['Latvia-focused', 'EU-funded programs', 'Investment support'], collateralRequired: false, updatedAt: '2025-11-19' },

  { id: 'citadele-lv-p1', institutionId: 'citadele-lv', name: 'Personal Loan', type: 'personal', customerType: 'individual', rateMin: 12.9, rateMax: 28.9, limitMin: 300, limitMax: 20000, termMin: 6, termMax: 96, currency: 'EUR', features: ['Baltic coverage', 'Fast processing', 'Digital-first'], collateralRequired: false, updatedAt: '2025-11-15', isPromoted: true },
  { id: 'citadele-lv-m1', institutionId: 'citadele-lv', name: 'Mortgage', type: 'mortgage', customerType: 'individual', rateMin: 5.0, rateMax: 8.0, limitMin: 10000, limitMax: 400000, termMin: 60, termMax: 300, currency: 'EUR', features: ['Innovative digital mortgage', 'Green building support', 'Baltic expertise'], collateralRequired: true, updatedAt: '2025-11-17' },
  { id: 'citadele-lv-b1', institutionId: 'citadele-lv', name: 'Business Credit', type: 'business', customerType: 'corporate', rateMin: 7.5, rateMax: 14.9, limitMin: 5000, limitMax: 500000, termMin: 12, termMax: 60, currency: 'EUR', features: ['Baltic business network', 'Factoring options', 'Leasing'], collateralRequired: false, updatedAt: '2025-11-13' },

  { id: 'luminor-lv-p1', institutionId: 'luminor-lv', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 11.0, rateMax: 25.0, limitMin: 500, limitMax: 25000, termMin: 6, termMax: 96, currency: 'EUR', features: ['Pan-Baltic presence', 'Online application', 'Quick disbursement'], collateralRequired: false, updatedAt: '2025-11-16' },
  { id: 'luminor-lv-b1', institutionId: 'luminor-lv', name: 'Business Finance', type: 'business', customerType: 'corporate', rateMin: 6.75, rateMax: 13.5, limitMin: 10000, limitMax: 1000000, termMin: 12, termMax: 84, currency: 'EUR', features: ['Regional expertise', 'Trade finance', 'Working capital solutions'], collateralRequired: false, updatedAt: '2025-11-14' },

  { id: 'industra-lv-b1', institutionId: 'industra-lv', name: 'Corporate Loan', type: 'business', customerType: 'corporate', rateMin: 7.0, rateMax: 13.0, limitMin: 20000, limitMax: 2000000, termMin: 12, termMax: 60, currency: 'EUR', features: ['Private banking approach', 'Tailored solutions', 'Real estate financing'], collateralRequired: true, updatedAt: '2025-11-10' },

  // ==================== LITHUANIA (EUR) ====================
  { id: 'swedbank-lt-p1', institutionId: 'swedbank-lt', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 10.9, rateMax: 24.9, limitMin: 500, limitMax: 30000, termMin: 6, termMax: 120, currency: 'EUR', features: ['Mobile banking', 'Smart-ID', 'Quick approval'], collateralRequired: false, updatedAt: '2025-11-20' },
  { id: 'swedbank-lt-m1', institutionId: 'swedbank-lt', name: 'Housing Loan', type: 'mortgage', customerType: 'individual', rateMin: 4.5, rateMax: 7.0, limitMin: 10000, limitMax: 600000, termMin: 60, termMax: 300, currency: 'EUR', features: ['EURIBOR + margin', 'Up to 85% LTV', 'Green property discount'], collateralRequired: true, processingFeePercent: 0.4, updatedAt: '2025-11-21' },
  { id: 'swedbank-lt-b1', institutionId: 'swedbank-lt', name: 'Business Loan', type: 'business', customerType: 'corporate', rateMin: 6.5, rateMax: 13.0, limitMin: 5000, limitMax: 1000000, termMin: 12, termMax: 84, currency: 'EUR', features: ['Lithuania market expertise', 'EU grants support', 'Investment advisory'], collateralRequired: false, updatedAt: '2025-11-19' },

  { id: 'siauliu-lt-p1', institutionId: 'siauliu-lt', name: 'Personal Credit', type: 'personal', customerType: 'individual', rateMin: 13.9, rateMax: 29.9, limitMin: 300, limitMax: 15000, termMin: 3, termMax: 84, currency: 'EUR', features: ['Lithuanian bank', 'Nationwide branches', 'Personalized service'], collateralRequired: false, updatedAt: '2025-11-14' },
  { id: 'siauliu-lt-m1', institutionId: 'siauliu-lt', name: 'Real Estate Loan', type: 'mortgage', customerType: 'individual', rateMin: 5.25, rateMax: 8.5, limitMin: 10000, limitMax: 350000, termMin: 60, termMax: 300, currency: 'EUR', features: ['Local expertise', 'Family home programs', 'Long-term relationships'], collateralRequired: true, updatedAt: '2025-11-15' },
  { id: 'siauliu-lt-b1', institutionId: 'siauliu-lt', name: 'Business Finance', type: 'business', customerType: 'corporate', rateMin: 7.9, rateMax: 15.9, limitMin: 3000, limitMax: 300000, termMin: 12, termMax: 60, currency: 'EUR', features: ['Lithuania-focused', 'Agricultural sector expertise', 'Leasing options'], collateralRequired: false, updatedAt: '2025-11-13' },

  { id: 'luminor-lt-p1', institutionId: 'luminor-lt', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 10.5, rateMax: 24.5, limitMin: 500, limitMax: 25000, termMin: 6, termMax: 96, currency: 'EUR', features: ['Pan-Baltic bank', 'Digital process', 'Competitive rates'], collateralRequired: false, updatedAt: '2025-11-17' },
  { id: 'luminor-lt-m1', institutionId: 'luminor-lt', name: 'Housing Loan', type: 'mortgage', customerType: 'individual', rateMin: 4.75, rateMax: 7.25, limitMin: 10000, limitMax: 500000, termMin: 60, termMax: 300, currency: 'EUR', features: ['Baltic coverage', 'Green building bonus', 'EURIBOR-linked'], collateralRequired: true, updatedAt: '2025-11-18' },
  { id: 'luminor-lt-b1', institutionId: 'luminor-lt', name: 'Business Loan', type: 'business', customerType: 'corporate', rateMin: 6.5, rateMax: 13.0, limitMin: 10000, limitMax: 800000, termMin: 12, termMax: 84, currency: 'EUR', features: ['Baltic-wide', 'Supply chain finance', 'Trade finance'], collateralRequired: false, updatedAt: '2025-11-19' },

  { id: 'citadele-lt-p1', institutionId: 'citadele-lt', name: 'Consumer Loan', type: 'personal', customerType: 'individual', rateMin: 12.9, rateMax: 27.9, limitMin: 300, limitMax: 18000, termMin: 6, termMax: 84, currency: 'EUR', features: ['Digital banking', 'Baltic network', 'Personalized approach'], collateralRequired: false, updatedAt: '2025-11-12' },
  { id: 'citadele-lt-b1', institutionId: 'citadele-lt', name: 'Business Loan', type: 'business', customerType: 'corporate', rateMin: 7.5, rateMax: 15.0, limitMin: 5000, limitMax: 400000, termMin: 12, termMax: 60, currency: 'EUR', features: ['SME specialist', 'Factoring', 'Invoice finance'], collateralRequired: false, updatedAt: '2025-11-11' },
];
