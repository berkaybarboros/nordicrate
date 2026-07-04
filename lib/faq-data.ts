// Homepage FAQ içeriği — hem FaqSection (UI) hem JSON-LD (SEO) buradan okur.
// 'use client' dosyasından value export server component'a import edilemediği için ayrı dosya.

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: 'Is NordicRate free to use?',
    a: 'Yes — 100% free, always. We earn a small referral fee from banks when you apply through our platform. This never affects the rates shown to you; we display all products objectively.',
  },
  {
    q: 'What is APR and why does it matter?',
    a: 'APR (Annual Percentage Rate) is the total yearly cost of a loan including interest and any mandatory fees, expressed as a percentage. It is the fairest way to compare loans across different banks and countries.',
  },
  {
    q: 'Will comparing loans affect my credit score?',
    a: 'No. Browsing and comparing rates on NordicRate uses soft enquiries only — these are invisible to lenders and do not affect your credit score. Only a formal application to a bank triggers a hard credit check.',
  },
  {
    q: 'Can I apply for a loan in a country I do not live in?',
    a: "Eligibility rules vary by country and bank. In general you must be a tax resident to apply for a loan, though some Nordic fintech banks (Revolut, Wise, Inbank) and e-Residency programs allow broader access. We recommend checking each institution's eligibility criteria.",
  },
  {
    q: "What is Estonia's e-Residency and why is it relevant?",
    a: "Estonia's e-Residency is a digital identity that lets anyone worldwide register an EU company and open a business bank account remotely. It is ideal for digital nomads and entrepreneurs who want an EU legal presence without physical relocation.",
  },
  {
    q: 'How are the interest rates calculated?',
    a: 'Rates are sourced directly from bank websites and updated daily. The displayed rate is the minimum advertised rate (best-case APR). Your actual rate depends on your credit history, income, and the specific loan amount and term you choose.',
  },
  {
    q: 'How do I apply for a loan?',
    a: 'Click "Apply Now" on any product card. You will be taken directly to the bank\'s official website where you can complete the full application. NordicRate is a comparison platform — we do not process applications ourselves.',
  },
];
