export interface Bank {
  id: string;
  name: string;
  logo: string;
  color: string;
  country: string[];
  description: string;
  established: number;
  trustScore: number;
  websiteUrl: string;
  loanUrl: string;
  mortgageUrl?: string;
  carLoanUrl?: string;
  depositUrl?: string;
  insuranceUrl?: string;
}

export const banks: Bank[] = [
  {
    id: "swedbank",
    name: "Swedbank",
    logo: "🏦",
    color: "#FF6600",
    country: ["EE", "LV", "LT", "SE", "FI"],
    description: "One of the largest banks in the Baltics",
    established: 1820,
    trustScore: 4.8,
    websiteUrl: "https://www.swedbank.ee",
    loanUrl: "https://www.swedbank.ee/private/credit/loans/personal",
    mortgageUrl: "https://www.swedbank.ee/private/credit/loans/home",
    carLoanUrl: "https://www.swedbank.ee/private/credit/loans/car",
    depositUrl: "https://www.swedbank.ee/private/savings/deposits",
    insuranceUrl: "https://www.swedbank.ee/private/insurance",
  },
  {
    id: "seb",
    name: "SEB Bank",
    logo: "🏛️",
    color: "#007AC9",
    country: ["EE", "LV", "LT", "SE"],
    description: "Swedish bank with strong Baltic presence",
    established: 1856,
    trustScore: 4.7,
    websiteUrl: "https://www.seb.ee/en",
    loanUrl: "https://www.seb.ee/en/private/loans/personal-loan",
    mortgageUrl: "https://www.seb.ee/en/private/loans/home-loan",
    carLoanUrl: "https://www.seb.ee/en/private/loans/car-loan",
    depositUrl: "https://www.seb.ee/en/private/savings/term-deposit",
  },
  {
    id: "lhv",
    name: "LHV Pank",
    logo: "🇪🇪",
    color: "#000000",
    country: ["EE"],
    description: "Estonia's leading domestic bank",
    established: 1999,
    trustScore: 4.9,
    websiteUrl: "https://www.lhv.ee/en",
    loanUrl: "https://www.lhv.ee/en/loans/consumer-loan",
    mortgageUrl: "https://www.lhv.ee/en/loans/home-loan",
    carLoanUrl: "https://www.lhv.ee/en/loans/car-loan",
    depositUrl: "https://www.lhv.ee/en/savings/term-deposit",
    insuranceUrl: "https://www.lhv.ee/en/insurance",
  },
  {
    id: "luminor",
    name: "Luminor Bank",
    logo: "💡",
    color: "#FF6B00",
    country: ["EE", "LV", "LT"],
    description: "Third-largest bank in the Baltic region",
    established: 2017,
    trustScore: 4.5,
    websiteUrl: "https://www.luminor.ee/en",
    loanUrl: "https://www.luminor.ee/en/personal/loans",
    mortgageUrl: "https://www.luminor.ee/en/personal/home-loan",
    depositUrl: "https://www.luminor.ee/en/personal/savings",
  },
  {
    id: "bigbank",
    name: "Bigbank",
    logo: "💰",
    color: "#E30613",
    country: ["EE", "LV", "LT", "FI", "SE"],
    description: "Specialising in consumer loans & deposits",
    established: 1992,
    trustScore: 4.3,
    websiteUrl: "https://www.bigbank.ee/en",
    loanUrl: "https://www.bigbank.ee/en/loans",
    depositUrl: "https://www.bigbank.ee/en/deposits",
  },
  {
    id: "coop",
    name: "Coop Pank",
    logo: "🤝",
    color: "#00A650",
    country: ["EE"],
    description: "Community bank with 100+ offices in Estonia",
    established: 2018,
    trustScore: 4.4,
    websiteUrl: "https://www.cooppank.ee/en",
    loanUrl: "https://www.cooppank.ee/en/private/loans",
    depositUrl: "https://www.cooppank.ee/en/private/savings",
  },
];
