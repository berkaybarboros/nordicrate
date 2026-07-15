/**
 * Country landing page içerikleri (/loans/[country]).
 * Kural: yalnızca doğrulanabilir gerçekler — banka fiyatı/istatistik uydurma yok (UCPD).
 */

import type { CountryCode } from '@/lib/types';

export interface CountryLanding {
  slug: string;
  code: CountryCode;
  intro: string[];   // 2 paragraf
  faqs: { q: string; a: string }[];  // 3 soru
}

export const COUNTRY_LANDINGS: CountryLanding[] = [
  {
    slug: 'estonia',
    code: 'EE',
    intro: [
      'Estonia is the most digital-friendly lending market in the Baltics. Most banks accept fully online applications, contracts are signed with ID-card or Smart-ID, and decisions on consumer loans often arrive the same day. As a eurozone member, variable-rate loans are priced as EURIBOR plus the bank’s margin.',
      'For expats and e-residents the picture is nuanced: e-Residency gives you a digital identity and company access, but consumer credit generally still requires Estonian tax residency and local income. Banks like LHV and fintech lenders such as Inbank are known for the most accessible digital processes.',
    ],
    faqs: [
      { q: 'Can I get a loan in Estonia as an e-resident?', a: 'e-Residency alone does not qualify you for consumer credit — banks generally require Estonian tax residency and verifiable local income. Business financing through an Estonian company is more accessible; several banks and government programs serve e-resident-founded companies.' },
      { q: 'How are Estonian loan rates set?', a: 'Estonia uses the euro, so variable-rate loans are typically priced as 6-month EURIBOR plus a fixed bank margin. The margin varies by bank and applicant profile, which is why comparing several offers matters.' },
      { q: 'How fast is loan approval in Estonia?', a: 'Consumer loan decisions are often same-day thanks to fully digital applications with ID-card, Mobile-ID or Smart-ID signing. Mortgages take longer — typically one to a few weeks including property valuation.' },
    ],
  },
  {
    slug: 'finland',
    code: 'FI',
    intro: [
      'Finland has one of Europe’s most competitive consumer credit markets, with a strong culture of comparing offers before committing. As a eurozone country, variable-rate mortgages are overwhelmingly tied to EURIBOR — most commonly the 12-month rate — plus a negotiated bank margin.',
      'Major banks such as OP Financial Group, Nordea and Aktia coexist with a broad field of digital lenders. Non-residents face real barriers: banks generally require Finnish residency, a local ID code and income history before granting credit.',
    ],
    faqs: [
      { q: 'What is the typical mortgage reference rate in Finland?', a: 'The 12-month EURIBOR is the most common reference for Finnish variable-rate mortgages, reviewed once a year. Your total rate is EURIBOR plus the bank’s margin, and the margin is negotiable — comparing banks can change it meaningfully.' },
      { q: 'Can foreigners get loans in Finland?', a: 'You generally need Finnish residency, a personal identity code and demonstrable income in Finland. EU citizens who live and work in Finland can usually apply on similar terms to locals after establishing income history.' },
      { q: 'Are payday-style loans regulated in Finland?', a: 'Yes — Finland caps consumer credit interest by law, which pushed the market toward larger, longer-term unsecured loans. Always check the APR (todellinen vuosikorko), which must include all mandatory costs.' },
    ],
  },
  {
    slug: 'latvia',
    code: 'LV',
    intro: [
      'Latvia’s lending market combines pan-Baltic banking groups — Swedbank, SEB, Luminor, Citadele — with a growing fintech scene. As a eurozone member, variable-rate loans are priced from EURIBOR plus a margin, and consumer lending is supervised by the Bank of Latvia.',
      'Digital applications are widely available, and Riga’s startup scene has produced several online lenders. Residency and local income remain the practical requirements for most consumer credit.',
    ],
    faqs: [
      { q: 'Which banks dominate lending in Latvia?', a: 'The market is led by pan-Baltic groups: Swedbank, SEB, Luminor and Citadele. Local fintechs and consumer lenders compete mainly in unsecured credit, which keeps pressure on rates and processing speed.' },
      { q: 'How are Latvian mortgage rates structured?', a: 'Latvia uses the euro, so mortgages are typically priced as EURIBOR (commonly 6-month) plus a bank margin fixed in your contract. When EURIBOR resets, your payment changes accordingly.' },
      { q: 'Can non-residents borrow in Latvia?', a: 'Generally you need Latvian residency and locally verifiable income. Some banks consider EU citizens working in Latvia earlier than non-EU applicants, but expect to establish local income history first.' },
    ],
  },
  {
    slug: 'lithuania',
    code: 'LT',
    intro: [
      'Lithuania is the largest Baltic economy and one of Europe’s most active fintech hubs — the Bank of Lithuania has licensed hundreds of fintech companies, which shows in the breadth of digital lending options. As a eurozone member, variable rates follow EURIBOR plus margin.',
      'Traditional lending is led by Šiaulių bankas and the pan-Baltic groups, while licensed consumer lenders compete aggressively online. Comparing total APR rather than the headline rate is essential here.',
    ],
    faqs: [
      { q: 'Why does Lithuania have so many online lenders?', a: 'The Bank of Lithuania runs one of the EU’s most active fintech licensing regimes, which attracted many digital lenders. More competition generally benefits borrowers, but always verify the lender is licensed and compare full APR.' },
      { q: 'What reference rate do Lithuanian mortgages use?', a: 'As a eurozone country, Lithuanian variable-rate mortgages are typically tied to 6-month EURIBOR plus a contractual bank margin. Fixed-rate periods are also offered by the larger banks.' },
      { q: 'What do I need to borrow in Lithuania?', a: 'Residency, a personal code and verifiable income in Lithuania are the standard requirements. Fully digital onboarding is common, so once you have local income history the process is fast.' },
    ],
  },
  {
    slug: 'sweden',
    code: 'SE',
    intro: [
      'Sweden is the largest Nordic credit market, with mortgages dominated by major banks — SEB, Swedbank, Handelsbanken, SBAB — and rates that follow the Riksbank’s policy rate rather than EURIBOR, since Sweden keeps the krona. Variable mortgages commonly reprice every three months.',
      'Swedish rules add borrower protections worth knowing: loan-to-value caps and mandatory amortisation requirements tied to LTV and income. A personal identity number (personnummer) is effectively a prerequisite for mainstream credit.',
    ],
    faqs: [
      { q: 'Does Sweden use EURIBOR?', a: 'No — Sweden is outside the eurozone. Mortgage pricing follows Swedish conditions, ultimately anchored to the Riksbank policy rate; the common variable product reprices every three months.' },
      { q: 'What are Sweden’s amortisation requirements?', a: 'Regulations require minimum annual amortisation depending on your loan-to-value ratio, with stricter requirements when borrowing is high relative to income. This affects your monthly cost more than small rate differences.' },
      { q: 'Can I borrow without a personnummer?', a: 'It is very difficult. Mainstream lenders require a Swedish personal identity number, local income and usually credit history via UC. New arrivals typically need to establish these first.' },
    ],
  },
  {
    slug: 'norway',
    code: 'NO',
    intro: [
      'Norway’s lending market is led by DNB alongside savings-bank alliances and digital challengers. Outside the EU and the eurozone, Norwegian rates follow Norges Bank’s policy rate, and most mortgages are floating-rate — fixed periods are less common than elsewhere in Europe.',
      'Regulation caps total borrowing relative to income and requires stress-testing against rate rises. Consumer loans are registered centrally, so lenders see your existing unsecured debt.',
    ],
    faqs: [
      { q: 'What drives Norwegian loan rates?', a: 'Norges Bank’s policy rate. Most Norwegian mortgages are floating-rate, so payment changes follow policy-rate moves relatively quickly — EURIBOR is not used since Norway keeps the krone.' },
      { q: 'How much can I borrow in Norway?', a: 'Regulation limits total debt to a multiple of gross annual income and requires banks to stress-test affordability against a rate increase. Unsecured debt is centrally registered and counts against your capacity.' },
      { q: 'Can foreigners get a mortgage in Norway?', a: 'With Norwegian residency, a national ID number and local income, yes — terms are broadly similar to locals. Without residency it is rare and typically limited to special cases.' },
    ],
  },
  {
    slug: 'denmark',
    code: 'DK',
    intro: [
      'Denmark has one of the world’s most distinctive mortgage systems: realkredit institutions such as Nykredit fund loans by issuing covered bonds, so your mortgage rate directly reflects bond-market pricing, with unusually transparent terms and the option to buy back your own loan at market price.',
      'Denmark keeps the krone (pegged to the euro), so EURIBOR is not the reference. Consumer lending works through banks like Danske Bank, Jyske Bank and Nordea, with a CPR number and Danish income as practical requirements.',
    ],
    faqs: [
      { q: 'What makes Danish mortgages unique?', a: 'The realkredit system: loans are funded by covered bonds traded in the market, giving transparent pricing and the ability to redeem your loan by buying the underlying bonds — useful when rates rise. Fixed 30-year loans are common.' },
      { q: 'Does Denmark use the euro or EURIBOR?', a: 'No. Denmark uses the krone under a fixed peg to the euro. Mortgage costs follow Danish covered-bond yields, and short-rate loans reset based on Danish reference rates.' },
      { q: 'What do I need to borrow in Denmark?', a: 'A CPR number, Danish address and verifiable income are the practical baseline. Banks typically want to see local financial history before extending significant credit.' },
    ],
  },
  {
    slug: 'iceland',
    code: 'IS',
    intro: [
      'Iceland’s credit market is small, concentrated — Landsbankinn, Íslandsbanki and Arion Bank dominate — and structurally unusual: alongside standard loans, Iceland offers inflation-indexed mortgages where the principal adjusts with CPI. Understanding indexed vs non-indexed is the single most important choice for borrowers.',
      'Outside the EU (but in the EEA), Iceland sets rates via its own central bank. Nominal rates look high by European standards; indexed products trade lower headline rates for inflation risk on the principal.',
    ],
    faqs: [
      { q: 'What are indexed loans in Iceland?', a: 'Verðtryggð (indexed) loans link your principal to inflation: the balance rises with CPI while the interest rate is lower. Non-indexed loans have higher nominal rates but a stable principal. The right choice depends on inflation expectations and your horizon.' },
      { q: 'Why do Icelandic rates look high?', a: 'Iceland runs an independent monetary policy with a small currency, so nominal rates are structurally higher than eurozone levels. Compare real (inflation-adjusted) costs, not just the headline number.' },
      { q: 'Can foreigners borrow in Iceland?', a: 'Residency and a kennitala (national ID) are required in practice. EEA citizens living and working in Iceland can access mainstream products once local income is established.' },
    ],
  },
];

export function getCountryLanding(slug: string): CountryLanding | undefined {
  return COUNTRY_LANDINGS.find((c) => c.slug === slug);
}

export const COUNTRY_SLUG_BY_CODE: Record<CountryCode, string> = Object.fromEntries(
  COUNTRY_LANDINGS.map((c) => [c.code, c.slug])
) as Record<CountryCode, string>;
