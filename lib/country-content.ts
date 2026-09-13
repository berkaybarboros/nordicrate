/**
 * Country landing page içerikleri (/loans/[country]).
 * Kural: yalnızca doğrulanabilir gerçekler — banka fiyatı/istatistik uydurma yok (UCPD).
 */

import type { CountryCode } from '@/lib/types';

export interface CountryLanding {
  slug: string;
  code: CountryCode;
  intro: string[];   // 2 paragraf
  faqs: { q: string; a: string }[];  // 3+ soru
  /**
   * Derin bolumler (opsiyonel). 2026-09-13'te eklendi: analitik, trafigin
   * kategori sayfalarina degil ULKE sayfalarina geldigini gosterdi
   * (/loans/iceland 11, /loans/sweden 8, /loans/finland 5 goruntulenme),
   * ama bu sayfalarda yalnizca ~200 kelime metin vardi — kategori
   * sayfalarina yazdigimizin altida biri.
   *
   * Her ulkenin kendine ozgu sistemi buranin asil degeri: Izlanda'da
   * enflasyona endeksli krediler, Danimarka'da realkredit tahvil modeli,
   * Isvec'te amorteringskrav, Finlandiya'da pozitif kredi kaydi. Bu
   * farklar hicbir jenerik karsilastirma sayfasinda anlatilmiyor.
   */
  sections?: { h2: string; body: string[] }[];
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
      { q: 'What does the positive credit register mean for my application?', a: 'Lenders now see your existing loans and credit, not only defaults, and they must consult the register. Affordability is assessed on your real total debt service, so undisclosed obligations no longer pass unnoticed. For tidy finances it is neutral; carrying several consumer credits usually lowers what a new lender offers.' },
      { q: 'Is the mortgage margin negotiable in Finland?', a: 'Yes, and it is where the real difference lies. Euribor is the same for everyone, but the margin is set by the bank and Finnish borrowers commonly negotiate it, including by presenting a competing offer. Two identical applicants can pay noticeably different amounts on margin alone.' },
    ],
    sections: [
      {
        h2: 'The positive credit register changed applications',
        body: [
          'Finland now operates a positive credit register, which records your existing loans and credit rather than only recording defaults. Lenders are required to consult it, so your full borrowing picture is visible from the first application — including credit you might once have kept out of the conversation.',
          'The practical effect is that undisclosed obligations no longer pass unnoticed, and affordability assessments are based on your real total debt service. For a borrower with tidy finances this is neutral or helpful; for someone carrying several consumer credits it usually reduces how much a new lender will offer.',
          'It also makes shopping around cleaner: because the register standardises what lenders see, differences between offers come down to pricing and policy rather than to what each bank happened to discover.',
        ],
      },
      {
        h2: 'Euribor, margin, and where the negotiation actually is',
        body: [
          'Finland is in the eurozone, and Finnish variable-rate mortgages are unusual in the region for commonly using the 12-month Euribor rather than the 6-month. Your rate resets once a year, which means slower but larger adjustments than in markets using shorter references.',
          'The margin, not the reference rate, is what the bank controls and what you can negotiate. Two applicants with identical Euribor exposure can pay noticeably different amounts purely on margin, and Finnish borrowers are accustomed to negotiating it — including by presenting a competing offer.',
          'Consumer credit interest is capped by law, which pushed the market away from very short high-cost products toward larger instalment loans. Compare on the true annual rate (todellinen vuosikorko), which must include all mandatory costs.',
        ],
      },
      {
        h2: 'What banks require from newcomers',
        body: [
          'A Finnish personal identity code (henkilotunnus) and a local bank account are prerequisites. Beyond that, banks lean heavily on domestic income history, and it is common for a well-paid newcomer to be refused in the first year simply because that history does not yet exist.',
          'For a home purchase, borrowers must fund part of the price themselves, and first-home buyers are treated somewhat differently from other buyers. Finland also runs a subsidised saving scheme for first-home buyers that changes both the deposit requirement and the terms available — worth checking before assuming standard conditions apply.',
        ],
      },
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
      { q: 'What is the amortisation requirement in Sweden?', a: 'New Swedish mortgages must repay a share of the principal each year rather than running interest-only, and the required share rises with the loan size relative to the property value and your income. It often affects your monthly cost more than the interest rate does, so compare full monthly payments.' },
      { q: 'Does applying to several lenders hurt my chances in Sweden?', a: 'It can. Credit applications trigger enquiries that other lenders can see, so a cluster of applications in a short period is visible and can weaken your position. Compare terms first and apply narrowly rather than using applications as a way of shopping around.' },
    ],
    sections: [
      {
        h2: 'The amortisation requirement, which decides your monthly cost',
        body: [
          'Sweden applies a mandatory amortisation rule (amorteringskrav) to new mortgages. Rather than being free to choose an interest-only arrangement, borrowers must repay a share of the principal each year, and the required share rises with how large the loan is relative to both the property value and your income.',
          'This matters more than the headline rate for most buyers, because it sets the floor on your monthly outflow. Two mortgages at the same interest rate can cost very differently per month depending on which amortisation tier they fall into. When comparing offers, compare the full monthly payment, not the rate.',
          'There is also a cap on how much of a property value a mortgage may cover, with the remainder funded by your own capital. Both the cap and the amortisation tiers are set by the financial supervisor and reviewed periodically, so confirm the current figures with the lender rather than relying on an article.',
        ],
      },
      {
        h2: 'Krona pricing and the credit check that everyone sees',
        body: [
          'Sweden keeps its own currency and the Riksbank sets policy independently, so Swedish loan pricing follows domestic rates rather than Euribor. Mortgages are commonly offered with a choice between a variable rate that follows the market and a fixed period of one to several years.',
          'Consumer credit applications trigger a credit enquiry that other lenders can see. Applying to many lenders in a short period leaves a visible trail and can itself weaken your position — one reason to compare terms first and apply narrowly, rather than submitting applications as a way of shopping around.',
        ],
      },
      {
        h2: 'Requirements for newcomers',
        body: [
          'A personnummer is effectively the entry ticket to Swedish financial services, and obtaining it is the first practical step after arriving. Without it, most lending is closed regardless of income.',
          'After that, lenders look for stable employment, income paid into a Swedish account, and a domestic payment record. A permanent contract is treated more favourably than a fixed-term one, and self-employment requires a longer documented history.',
          'EU citizens who live and work in Sweden generally apply on the same terms as residents once that record exists. The barrier is time in the system rather than nationality.',
        ],
      },
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
      { q: 'What is a realkredit loan?', a: 'Danish mortgages are funded by issuing bonds that match your loan rather than from bank deposits, so pricing follows an observable bond market. Because your debt corresponds to specific bonds, you can in principle repay by buying them back at market price — which can reduce your outstanding debt if rates have risen since you borrowed.' },
      { q: 'Why do I need two loans to buy property in Denmark?', a: 'The realkredit loan covers only part of the purchase price; a supplementary bank loan usually covers the rest, at ordinary bank pricing. Since two lenders are involved, ask for the total monthly cost across both — comparing only the realkredit rate understates what you will actually pay.' },
    ],
    sections: [
      {
        h2: 'Realkredit: the Danish mortgage system has no equivalent elsewhere',
        body: [
          'Danish mortgages are funded through a bond model rather than from bank deposits. When you take a realkredit loan, the mortgage institution issues bonds matching your loan and sells them to investors; your payments service those bonds. This balance principle is why Danish mortgage pricing is unusually transparent — the rate follows an observable bond market rather than an internal bank decision.',
          'It also produces a feature borrowers elsewhere do not have. Because your debt corresponds to specific bonds, you can in principle repay by buying back those bonds at market price. If rates have risen since you borrowed, the bonds trade below par and the buy-back can reduce your outstanding debt. This makes refinancing in Denmark a genuine financial decision rather than only an administrative one.',
          'Alongside the realkredit loan, most buyers take a supplementary bank loan for the part the mortgage does not cover. That portion is ordinary bank credit at ordinary bank pricing, so the blended cost is what matters — comparing only the realkredit rate understates it.',
        ],
      },
      {
        h2: 'A currency pegged to the euro, with its own policy rate',
        body: [
          'Denmark keeps the krone but maintains a fixed-rate policy against the euro, so Danish rates track euro-area conditions closely without being set by them. Nationalbanken adjusts policy primarily to defend the peg rather than to steer the domestic economy, which is a meaningful difference from Sweden or Norway.',
          'For a borrower the consequence is practical: Danish pricing usually moves in the same direction as the euro area, but the instruments and the mortgage structure remain distinctly Danish. An offer here is not directly comparable to a eurozone offer even when the headline rate looks similar.',
        ],
      },
      {
        h2: 'Requirements and what newcomers should expect',
        body: [
          'A CPR number is the prerequisite for banking and credit. After that, lenders assess income, existing debt and payment record, and they apply affordability rules that stress-test your budget against higher rates than today.',
          'Property purchases require your own capital for part of the price, and the split between realkredit and bank loan follows from how much you contribute. Because two lenders are effectively involved, ask for the total monthly cost across both rather than comparing the mortgage component alone.',
          'Newcomers meet the same pattern as elsewhere in the region: income earned abroad counts for less than income arriving in a Danish account, and a few months of domestic record changes what lenders will offer.',
        ],
      },
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
      { q: 'Should I choose an indexed or non-indexed loan in Iceland?', a: 'It is a risk choice, not a price choice. An indexed loan (verdtryggt) keeps early payments low but lets inflation raise your outstanding principal. A non-indexed loan costs more per month at the start but the balance only falls. Decide which risk you can carry, then compare banks within that category.' },
      { q: 'Do I need a kennitala to borrow in Iceland?', a: 'Yes. The Icelandic identity number is required for essentially any financial product, including a bank account. Income earned abroad also counts for less than salary arriving in an Icelandic account, so most newcomers need some months of domestic record before applications succeed.' },
    ],
    sections: [
      {
        h2: 'Indexed or non-indexed: the choice unique to Iceland',
        body: [
          'Iceland is the only market in this comparison where you must first choose whether your loan is linked to inflation. An indexed loan (verdtryggt) has its principal adjusted by the consumer price index, so the monthly payment starts low but the outstanding balance rises with inflation. A non-indexed loan (overdtryggt) carries a higher nominal rate and a heavier early payment, but the principal only falls.',
          'This is not a technicality — it changes the total cost more than any rate comparison between banks. Indexed loans shift inflation risk onto the borrower and can leave you owing more after years of payments if inflation runs high. Non-indexed loans put that risk on the lender, which is why they price higher up front.',
          'Neither is universally correct. The honest framing is that an indexed loan buys affordability today at the cost of certainty later, and a non-indexed loan does the reverse. Before comparing banks, decide which risk you are willing to carry — then compare within that category.',
        ],
      },
      {
        h2: 'Currency and rate setting',
        body: [
          'Iceland uses the krona and sets monetary policy independently through the Central Bank of Iceland. Loan pricing therefore follows domestic policy rates rather than Euribor, and it can move on a different cycle from the eurozone entirely. If you are comparing an Icelandic offer against a euro-area one, you are comparing two separate rate environments, not two banks.',
          'Currency also matters if your income is not in krona. A loan in ISK repaid from foreign earnings carries exchange-rate risk in both directions, and that risk is yours, not the bank. Borrowers who earn abroad should treat this as a real cost of the loan rather than a footnote.',
        ],
      },
      {
        h2: 'What lenders require',
        body: [
          'You need a kennitala, the Icelandic identity number, for essentially any financial product. Beyond that, lenders assess income, existing obligations and payment history, and they apply affordability rules that limit how much of your income can go to debt service.',
          'Newcomers face the familiar problem: the file, not the finances. A domestic payment record and salary arriving in an Icelandic account carry more weight than the same income earned abroad. Building a few months of local history before applying materially changes the outcome.',
          'For property purchases, expect a deposit requirement and a valuation, and check the current loan-to-value and affordability limits directly with the lender — these are set by regulation and reviewed periodically.',
        ],
      },
    ],
  },
];

export function getCountryLanding(slug: string): CountryLanding | undefined {
  return COUNTRY_LANDINGS.find((c) => c.slug === slug);
}

export const COUNTRY_SLUG_BY_CODE: Record<CountryCode, string> = Object.fromEntries(
  COUNTRY_LANDINGS.map((c) => [c.code, c.slug])
) as Record<CountryCode, string>;
