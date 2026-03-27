export interface Promo {
  id: string;
  bankId: string;
  bankName: string;
  bankLogo: string;
  type: "loan" | "insurance" | "deposit";
  title: string;
  description: string;
  saving?: string;
  endsAt?: string; // ISO date string "2026-03-31"
  applyUrl: string;
  badge: "HOT" | "NEW" | "LIMITED" | "EXCLUSIVE";
  highlight: boolean; // true → larger card (md:col-span-2)
  bgColor: string;    // Tailwind gradient classes
}

export const promos: Promo[] = [
  {
    id: "lhv-0fee-loan",
    bankId: "lhv",
    bankName: "LHV Pank",
    bankLogo: "🇪🇪",
    type: "loan",
    title: "0% Setup Fee Personal Loan",
    description: "Get a personal loan with zero setup fee — save up to €150 upfront. Available for all new LHV customers until end of March.",
    saving: "Save up to €150",
    endsAt: "2026-03-31",
    applyUrl: "https://www.lhv.ee/en/loans/consumer-loan",
    badge: "HOT",
    highlight: true,
    bgColor: "from-[#1a3c6e] to-[#2563eb]",
  },
  {
    id: "ergo-casco-discount",
    bankId: "ergo",
    bankName: "ERGO Insurance",
    bankLogo: "🟢",
    type: "insurance",
    title: "10% Online CASCO Discount",
    description: "Buy your CASCO insurance online and save 10% instantly. Full vehicle protection at the best price.",
    saving: "Save 10%",
    endsAt: "2026-04-30",
    applyUrl: "https://www.ergo.ee/en/car-insurance/casco",
    badge: "NEW",
    highlight: false,
    bgColor: "from-teal-500 to-teal-600",
  },
  {
    id: "bigbank-43-deposit",
    bankId: "bigbank",
    bankName: "Bigbank",
    bankLogo: "💰",
    type: "deposit",
    title: "4.3% p.a. Term Deposit",
    description: "Estonia's highest deposit rate — 4.3% per year for 12-month term. DGSD protected up to €100,000.",
    saving: "€430 on €10k",
    applyUrl: "https://www.bigbank.ee/en/deposits",
    badge: "EXCLUSIVE",
    highlight: false,
    bgColor: "from-amber-500 to-amber-600",
  },
  {
    id: "swedbank-free-valuation",
    bankId: "swedbank",
    bankName: "Swedbank",
    bankLogo: "🏦",
    type: "loan",
    title: "Free Property Valuation",
    description: "Apply for a Swedbank mortgage and get a free property valuation (worth €150). Limited offer for new mortgage applications.",
    saving: "Free valuation €150",
    endsAt: "2026-03-15",
    applyUrl: "https://www.swedbank.ee/private/credit/loans/mortgage",
    badge: "LIMITED",
    highlight: false,
    bgColor: "from-indigo-500 to-indigo-600",
  },
  {
    id: "if-first-month-free",
    bankId: "if",
    bankName: "If P&C Insurance",
    bankLogo: "🔵",
    type: "insurance",
    title: "First Month Free Motor Insurance",
    description: "Switch to If P&C and get your first month of motor insurance absolutely free. Online purchase only.",
    saving: "1 month free",
    endsAt: "2026-03-31",
    applyUrl: "https://www.if.ee/en/car/motor-liability",
    badge: "HOT",
    highlight: false,
    bgColor: "from-orange-500 to-orange-600",
  },
];
