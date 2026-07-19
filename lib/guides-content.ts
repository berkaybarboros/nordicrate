/**
 * lib/guides-content.ts — Entity/glossary rehber sayfaları (/guides/*)
 *
 * Topical authority katmanı: her kredi sayfasının atıfta bulunduğu finansal
 * kavramların kanonik açıklayıcıları. Kurallar deep-content.ts ile aynı:
 * mevzuat kaynaklı olmayan rakam yok, kişisel tavsiye yok, [link](/route) destekli.
 */

import type { DeepContent } from '@/lib/deep-content';

export interface GuideEntry extends DeepContent {
  slug: string;
  /** DefinedTerm JSON-LD için kısa tanım */
  definition: string;
  /** Hub kartında gösterilen etiket */
  cardLabel: string;
}

export const GUIDES: GuideEntry[] = [
  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: 'euribor',
    cardLabel: 'EURIBOR',
    definition:
      'Euribor (Euro Interbank Offered Rate) is the benchmark interest rate at which European banks lend to each other, used as the reference rate for most variable-rate loans in the eurozone.',
    locale: 'en',
    h1: 'What is Euribor? The rate behind your loan payment',
    metaTitle: 'What Is Euribor? How It Sets Your Loan Payment',
    metaDescription:
      'Euribor is the reference rate behind most variable-rate mortgages in Estonia, Latvia, Lithuania and Finland. How it works, who sets it, and what a reset means.',
    intro:
      'Euribor (Euro Interbank Offered Rate) is the benchmark rate at which European banks lend to one another. Most variable-rate mortgages and many other loans in the eurozone are priced as Euribor plus a fixed bank margin — so when Euribor moves, your monthly payment moves with it at the next reset date.',
    sections: [
      {
        h2: 'Who sets Euribor and how',
        body: [
          'Euribor is administered by the European Money Markets Institute (EMMI) in Brussels. It is calculated from the rates at which a panel of European banks report they can borrow unsecured funds from other banks. It is published every business day for several maturities — the ones borrowers meet most often are the 3-month, 6-month and 12-month Euribor.',
          'Euribor broadly follows the European Central Bank’s monetary policy: when the ECB raises or cuts its key rates, Euribor tends to move in the same direction, often in anticipation. That is why eurozone borrowers watch ECB decisions — they flow through to loan payments within months.',
        ],
      },
      {
        h2: 'Which Euribor applies to your loan',
        body: [
          'The maturity named in your contract determines how often your rate resets. In Estonia, Latvia and Lithuania, [mortgages](/loans/mortgage) are most commonly tied to the 6-month Euribor — your rate updates twice a year. In Finland, the 12-month Euribor dominates, so [Finnish mortgage](/fi/asuntolaina) payments reset once a year.',
          'A shorter maturity passes rate changes to you faster — in both directions. A longer one gives more payment stability between resets but can lag the market. Neither is inherently cheaper over the life of a loan; they distribute the same interest-rate risk differently.',
        ],
      },
      {
        h2: 'What a reset means for your payment',
        body: [
          'On each reset date, the bank replaces the old Euribor value in your pricing formula with the current one; your margin stays unchanged. If the 6-month Euribor rose since your last reset, your monthly payment rises for the next six months; if it fell, your payment falls.',
          'Euribor can also be negative — it was below zero for several years until 2022. Most Baltic and Finnish loan contracts contain a floor clause treating negative Euribor as zero, so borrowers get the benefit of low rates but banks don’t pay borrowers. Check your contract for how it handles a negative reference rate.',
        ],
      },
      {
        h2: 'Where to see current Euribor rates',
        body: [
          'NordicRate shows current Euribor values — sourced from the European Central Bank data portal and updated daily — on our [homepage](/) and loan pages. Live bank offers marked with a LIVE badge already reflect the current Euribor in their effective rates.',
          'When comparing loans, remember the part you can influence is not Euribor itself but the margin the bank adds on top — that is where [comparing offers](/loans) pays off.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Euribor the same as the ECB interest rate?',
        a: 'No. The ECB sets its own policy rates; Euribor is a market rate between commercial banks. They are closely linked — Euribor typically follows expected ECB policy — but they are set by different institutions and are not equal.',
      },
      {
        q: 'Why do Estonian banks use the 6-month Euribor?',
        a: 'It is the established market convention in the Baltics, balancing how quickly rate changes reach borrowers against payment stability. Finland, by contrast, conventionally uses the 12-month Euribor. The contract, not the law, determines which maturity applies.',
      },
      {
        q: 'Can I switch my loan from Euribor to a fixed rate?',
        a: 'Many banks let you fix the rate for a period or switch reference terms, usually for a fee or a different margin. Whether it pays off depends on future rates, which nobody can promise. Ask your bank for the concrete cost of switching before deciding.',
      },
      {
        q: 'What happens to my loan if Euribor goes negative?',
        a: 'Most loan contracts in the region contain a clause treating a negative reference rate as zero, meaning you pay just the margin. Check your own contract — the exact wording governs.',
      },
      {
        q: 'How often is Euribor published?',
        a: 'Every TARGET business day, for each maturity. Your loan only re-reads the value on its contractual reset dates, so daily fluctuations between resets do not affect your payment.',
      },
    ],
    related: [
      { label: 'Mortgages in Estonia', href: '/loans/mortgage' },
      { label: 'Asuntolaina Suomessa', href: '/fi/asuntolaina' },
      { label: 'What is APRC (KKM)?', href: '/guides/apr-kkm' },
      { label: 'Compare all loans', href: '/loans' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: 'apr-kkm',
    cardLabel: 'APR / KKM',
    definition:
      'The annual percentage rate of charge (APRC; Estonian: krediidi kulukuse määr, KKM) expresses the total yearly cost of a loan — interest plus all mandatory fees — as a single percentage.',
    locale: 'en',
    h1: 'APR and KKM explained: the only fair way to compare loans',
    metaTitle: 'APR / KKM Explained: Compare Loan Costs Fairly',
    metaDescription:
      'The APRC (krediidi kulukuse määr in Estonia, todellinen vuosikorko in Finland) folds interest and mandatory fees into one comparable number. What it includes and why it matters.',
    intro:
      'The annual percentage rate of charge — APRC, known in Estonia as krediidi kulukuse määr (KKM) and in Finland as todellinen vuosikorko — expresses the total yearly cost of a loan, including interest and all mandatory fees, as one percentage. EU law requires lenders to disclose it, precisely so borrowers can compare offers like-for-like.',
    sections: [
      {
        h2: 'Why the interest rate alone misleads',
        body: [
          'The advertised interest rate is only the price of the money. Loans also carry contract fees, setup fees, account or administration charges — and these differ widely between lenders. A loan with a lower interest rate but a high setup fee can easily cost more in total than a higher-rate loan with no fees.',
          'The APRC ends this comparison problem by folding every mandatory cost into a single annualised percentage. Two offers with the same APRC cost you the same per year, whatever the split between interest and fees.',
        ],
      },
      {
        h2: 'What the APRC includes — and what it doesn’t',
        body: [
          'Included: the nominal interest, mandatory one-time fees (contract/setup), and recurring mandatory charges tied to the credit. Under EU consumer credit rules, lenders must state the APRC in advertising and in the standardised pre-contract information you receive before signing.',
          'Not included: optional extras you choose freely (like voluntary payment insurance), penalty fees, and costs that don’t stem from the credit agreement itself. If an "optional" insurance is in practice required to get the advertised rate, its cost belongs in the APRC — treat pressure to bundle skeptically.',
        ],
      },
      {
        h2: 'How to use APRC when comparing',
        body: [
          'Ask every lender for an offer with the same amount and the same term — the APRC is sensitive to both, so mismatched offers are not comparable. Then rank offers by APRC, not the headline rate.',
          'This applies to every credit type: [personal loans](/loans/personal), [car loans](/loans/car) and [mortgages](/loans/mortgage). For mortgages, the APRC also captures valuation and contract fees, which vary meaningfully between banks.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is a lender required to tell me the APRC?',
        a: 'Yes. Under EU consumer credit law, transposed in every Nordic and Baltic member state, lenders must disclose the APRC in advertising that mentions a cost figure and in the standardised information sheet you receive before signing.',
      },
      {
        q: 'Why does the same loan show different APRC for different amounts?',
        a: 'Fixed fees weigh more on small, short loans: a fixed contract fee spread over a small loan raises the annualised cost sharply. That is why you should compare offers only at the same amount and term.',
      },
      {
        q: 'Is the APRC the rate I pay monthly?',
        a: 'No. Your monthly payment is calculated from the nominal interest rate and schedule; the APRC is a standardised total-cost measure for comparison. A loan is repaid at its contract rate — the APRC just tells you what it all costs per year.',
      },
      {
        q: 'What is a good APRC?',
        a: 'It depends on the credit type, your profile and the market moment — secured loans run far below unsecured ones. The practical answer: the best APRC among several real offers for your amount and term. Comparing is what defines "good".',
      },
    ],
    related: [
      { label: 'Personal loans in Estonia', href: '/loans/personal' },
      { label: 'Tarbimislaen Eestis', href: '/et/tarbimislaen' },
      { label: 'What is Euribor?', href: '/guides/euribor' },
      { label: '14-day withdrawal right', href: '/guides/withdrawal-right' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: 'ltv',
    cardLabel: 'LTV',
    definition:
      'Loan-to-value (LTV) is the ratio between a loan and the value of the asset securing it. In Estonian mortgage lending, the standard cap is 85% — implying a 15% down payment.',
    locale: 'en',
    h1: 'LTV and the down payment: how much house your money buys',
    metaTitle: 'LTV & Down Payment in Estonia: The 85% Rule',
    metaDescription:
      'Loan-to-value (LTV) caps how much of a property a mortgage may cover. How the Estonian 85% limit works, what counts as omafinantseering, and how a state guarantee changes it.',
    intro:
      'Loan-to-value (LTV) is the ratio between your mortgage and the value of the property securing it. In Estonia, Eesti Pank caps standard housing loans at 85% LTV — meaning at least a 15% down payment (omafinantseering). The property’s appraised value, not the purchase price, anchors the calculation.',
    sections: [
      {
        h2: 'How LTV is calculated',
        body: [
          'LTV = loan amount ÷ property value. If a bank lends €170,000 against a property valued at €200,000, the LTV is 85%. Banks base the value on an appraisal — if the appraisal comes in below your purchase price, the loan is sized off the lower figure and your required cash grows.',
          'A lower LTV means less risk for the bank and often a better margin for you: borrowers bringing more equity routinely negotiate better terms. The [margin over Euribor](/guides/euribor) is where that advantage shows up.',
        ],
      },
      {
        h2: 'The Estonian macroprudential limits',
        body: [
          'Eesti Pank, Estonia’s central bank, sets binding requirements for housing loans: a standard LTV cap of 85%, a maturity cap of 30 years, and a limit on monthly debt payments relative to income (see [DSTI](/guides/dsti)). Banks may exceed the LTV cap only within a small regulated share of new loans.',
          'With a state-backed guarantee (widely known as the [KredEx guarantee](/guides/kredex)), eligible buyers — typically first-home buyers and young families — can borrow at a higher effective LTV, reducing the cash needed upfront. Similar caps exist across the region: Finland applies its own statutory loan cap (lainakatto) with a gentler limit for first-home buyers.',
        ],
      },
      {
        h2: 'What counts toward the down payment',
        body: [
          'The down payment is normally your own money: savings, proceeds from selling property, or documented gifts. Banks generally do not accept another consumer loan as omafinantseering — taking a personal loan for the deposit worsens your [debt-service ratio](/guides/dsti) and can sink the application.',
          'Additional collateral (for example a second property, or in some schemes a co-borrower’s asset) can substitute for part of the cash deposit at some banks. Terms differ enough between banks that this alone justifies [comparing mortgage offers](/loans/mortgage).',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the 15% down payment an absolute rule in Estonia?',
        a: 'The 85% LTV cap is the standard Eesti Pank requirement, but a state guarantee (KredEx) allows eligible borrowers to put down less, and banks have a small regulated allowance for exceptions. Verify the current rules — they are reviewed periodically.',
      },
      {
        q: 'Does the down payment have to be cash?',
        a: 'Mostly yes — own savings or documented funds. Some banks accept additional collateral in place of part of the cash. A consumer loan taken to fund the deposit is generally not accepted and hurts your affordability assessment.',
      },
      {
        q: 'Purchase price or appraised value — which counts?',
        a: 'Banks lend against the appraised value. If the appraisal is lower than the agreed price, the difference comes out of your pocket on top of the normal down payment.',
      },
      {
        q: 'Does a bigger down payment get me a better rate?',
        a: 'Often, yes. A lower LTV reduces the bank’s risk, and banks price that into the margin. It is one of the few pricing levers fully in the borrower’s control.',
      },
    ],
    related: [
      { label: 'Mortgages in Estonia', href: '/loans/mortgage' },
      { label: 'Kodulaen Eestis', href: '/et/kodulaen' },
      { label: 'KredEx guarantee', href: '/guides/kredex' },
      { label: 'DSTI affordability rule', href: '/guides/dsti' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: 'kredex',
    cardLabel: 'KredEx',
    definition:
      'The KredEx housing loan guarantee is an Estonian state-backed surety that lets eligible buyers — typically first-home buyers and young families — take a mortgage with a smaller down payment.',
    locale: 'en',
    h1: 'The KredEx guarantee: buying a home with a smaller deposit',
    metaTitle: 'KredEx Housing Guarantee: Smaller Deposit, Same Loan',
    metaDescription:
      'Estonia’s state housing loan guarantee (KredEx) reduces the required down payment for eligible buyers. Who qualifies, what it costs, and what it does not do.',
    intro:
      'The KredEx housing loan guarantee is an Estonian state-backed surety: the state guarantees part of your mortgage, so the bank can accept a smaller down payment than the standard 15%. It lowers the cash barrier to buying a home — it does not lower your interest rate.',
    sections: [
      {
        h2: 'How the guarantee works',
        body: [
          'Normally the [85% LTV cap](/guides/ltv) means you bring at least 15% of the property value in cash. With the state guarantee, the guaranteed portion substitutes for part of that deposit, so eligible buyers can proceed with less cash while the bank stays within its risk rules.',
          'You apply through the bank, not separately: when you request a [mortgage](/loans/mortgage), tell the bank you want to use the guarantee, and the bank handles the assessment against the current criteria. A guarantee fee applies — factor it into the total cost comparison alongside the APRC.',
        ],
      },
      {
        h2: 'Who is typically eligible',
        body: [
          'The scheme has historically targeted groups such as first-home buyers, young families with children, young professionals, tenants of restituted housing, and buyers renovating energy-inefficient homes. Exact categories, income conditions and guarantee ceilings change over time — check the current criteria with your bank or the administering state fund before planning around it.',
          'The guarantee applies to a home you will live in, not investment property. Banks still run their full affordability assessment: the guarantee replaces deposit cash, not income requirements.',
        ],
      },
      {
        h2: 'What the guarantee does not do',
        body: [
          'It does not reduce your interest rate or margin — pricing is still set by the bank, and [comparing margins](/loans/mortgage) matters exactly as much with a guarantee as without.',
          'It does not remove the [DSTI affordability check](/guides/dsti), and it is not a grant: you borrow more relative to the property value, which means more interest paid over the life of the loan. It trades a lower cash barrier today for slightly higher leverage.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does the KredEx guarantee make my loan cheaper?',
        a: 'No — it reduces the required down payment, not the interest rate. You also pay a guarantee fee, and borrowing at higher LTV means more total interest. Its value is access, not price.',
      },
      {
        q: 'How do I apply for the guarantee?',
        a: 'Through the bank issuing your mortgage. Tell the bank you want to use the state guarantee; it checks your eligibility against current criteria as part of the loan process.',
      },
      {
        q: 'Can I combine the guarantee with any bank?',
        a: 'The major Estonian mortgage banks work with the scheme. Terms and how much deposit they still expect can differ, so compare several banks with the guarantee factored in.',
      },
      {
        q: 'Is there a similar scheme in Finland?',
        a: 'Finland has its own instruments — the ASP savings scheme and a state guarantee (valtiontakaus) for owner-occupied homes. See our [Finnish mortgage guide](/fi/asuntolaina) for how those work.',
      },
    ],
    related: [
      { label: 'Mortgages in Estonia', href: '/loans/mortgage' },
      { label: 'LTV & down payment', href: '/guides/ltv' },
      { label: 'Government programs', href: '/programs' },
      { label: 'Kodulaen Eestis', href: '/et/kodulaen' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: 'dsti',
    cardLabel: 'DSTI',
    definition:
      'Debt-service-to-income (DSTI) is the share of your net monthly income consumed by loan payments. Estonian banks must keep new mortgage borrowers under a DSTI limit set by Eesti Pank.',
    locale: 'en',
    h1: 'DSTI: the affordability rule that sizes your loan',
    metaTitle: 'DSTI Explained: How Banks Decide What You Can Borrow',
    metaDescription:
      'Debt-service-to-income (DSTI) caps your monthly loan payments relative to income. How Estonian banks apply it, what counts as debt, and why the stress test matters.',
    intro:
      'Debt-service-to-income (DSTI) is the share of your net monthly income that goes to loan payments. Estonian mortgage rules set a ceiling on this ratio, and banks must test it against a higher interest rate than today’s — so the loan you are offered already assumes rates could rise.',
    sections: [
      {
        h2: 'How banks compute your DSTI',
        body: [
          'The bank adds up all your monthly credit obligations — the new loan’s payment plus existing loans, leases, credit card and overdraft limits — and divides by your net income. Regular, documented income counts; volatile income is typically counted conservatively or partially.',
          'Crucially, the mortgage payment in this calculation is not today’s payment: regulation requires an interest-rate stress test, computing your payment at a rate meaningfully above the current one. Passing at the stressed rate is what protects you from payment shock when [Euribor](/guides/euribor) rises.',
        ],
      },
      {
        h2: 'What counts as debt — more than you think',
        body: [
          'Unused credit card limits and overdrafts often count as obligations even if you never draw them, because you could. Closing unused credit lines before applying is one of the few quick, legitimate ways to improve your assessed capacity.',
          'Co-signed loans and guarantees you have given also appear in the calculation. Small consumer loans and buy-now-pay-later balances add up faster than most applicants expect — see how they interact with a [personal loan application](/loans/personal).',
        ],
      },
      {
        h2: 'What to do if you hit the ceiling',
        body: [
          'Options banks accept: a longer maturity (within the 30-year cap) to lower the monthly payment, a larger [down payment](/guides/ltv) to shrink the loan, repaying or closing existing credit lines, or adding a co-borrower whose income enters the calculation.',
          'What does not work: taking another loan to bridge the gap — it raises the very ratio being tested. If the numbers are close, comparing banks matters: income counting rules differ at the margins.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What DSTI limit applies in Estonia?',
        a: 'Eesti Pank sets the binding limit and reviews it periodically; banks also have a small regulated allowance for exceptions. Check the current percentage with Eesti Pank or your bank — the principle (payments capped relative to net income, tested at a stressed rate) is stable even when the number moves.',
      },
      {
        q: 'Do credit cards I never use really count?',
        a: 'Usually yes — the limit is available credit you could draw at any time. Closing unused cards and overdrafts before a mortgage application is a legitimate way to improve your assessed capacity.',
      },
      {
        q: 'Is rental income counted?',
        a: 'Banks differ: documented, stable rental income is often counted partially. Ad-hoc or undocumented income generally is not. Ask each bank how it treats your income mix — it is a real reason results differ between banks.',
      },
      {
        q: 'Why did the bank offer me less than an online calculator suggested?',
        a: 'Public calculators rarely apply the full stress test and cannot see your other obligations. The bank’s number includes both, so it is usually lower — and it is the binding one.',
      },
    ],
    related: [
      { label: 'Mortgages in Estonia', href: '/loans/mortgage' },
      { label: 'LTV & down payment', href: '/guides/ltv' },
      { label: 'Personal loans', href: '/loans/personal' },
      { label: 'What is Euribor?', href: '/guides/euribor' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: 'withdrawal-right',
    cardLabel: '14-day right',
    definition:
      'EU consumer credit law gives borrowers a 14-day right of withdrawal: a consumer credit agreement can be cancelled within 14 days of signing, repaying principal plus accrued interest, without penalty.',
    locale: 'en',
    h1: 'The 14-day withdrawal right: cancelling a loan you just signed',
    metaTitle: '14-Day Loan Withdrawal Right in the EU: How It Works',
    metaDescription:
      'EU consumer credit rules let you cancel a loan within 14 days of signing without penalty. What you repay, how to exercise the right, and what it does not cover.',
    intro:
      'Under EU consumer credit rules, transposed across the Nordic and Baltic countries, you can withdraw from a consumer credit agreement within 14 days of signing — without giving a reason and without penalty. You repay the principal plus the interest accrued for the days you held the money, nothing more.',
    sections: [
      {
        h2: 'How the right works in practice',
        body: [
          'The clock starts when the agreement is concluded (or when you receive the contractual terms, if later). Within 14 calendar days you notify the lender that you withdraw — the contract states the exact procedure and address. You then repay the principal without undue delay, plus interest accrued from drawdown to repayment.',
          'The lender cannot charge a cancellation fee or penalty. Non-refundable third-party costs the lender paid on your behalf to public authorities may remain payable — the pre-contract information sheet lists them.',
        ],
      },
      {
        h2: 'What it covers — and what it doesn’t',
        body: [
          'The right covers consumer credit: [personal loans](/loans/personal), car credit, credit cards and similar agreements. Mortgages follow a different EU regime — depending on the country you get a reflection period or a withdrawal window under national rules implementing the Mortgage Credit Directive, so check the national specifics before signing a [home loan](/loans/mortgage).',
          'Withdrawal from the credit does not automatically undo a purchase you financed — a car bought with the loan is a separate contract, unless the credit and purchase are legally linked (as in many dealer-financed deals). Linked-credit rules can unwind both together; the pre-contract information states whether your agreement is linked.',
        ],
      },
      {
        h2: 'Withdrawal vs. early repayment',
        body: [
          'These are different rights. Withdrawal (14 days) erases the agreement as if it had not been concluded, at zero penalty. Early repayment applies any time later: you can always repay a consumer loan ahead of schedule, and the lender may charge only limited, capped compensation.',
          'If you find a better offer weeks after signing, early repayment plus refinancing is the route — [compare current offers](/loans) with the APRC to check the switch actually pays off after any compensation.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I need a reason to withdraw from a loan?',
        a: 'No. The 14-day right is unconditional — no reason, no penalty. You repay the principal plus interest for the days you actually had the money.',
      },
      {
        q: 'Does the 14-day right apply to mortgages?',
        a: 'Mortgages follow a separate EU regime; depending on the country you get a reflection period before signing or a withdrawal window after. Check the national rules stated in your mortgage documentation.',
      },
      {
        q: 'I financed a purchase with the loan — does withdrawal cancel the purchase?',
        a: 'Only if the credit is legally linked to the purchase (common in dealer or store financing). Otherwise the purchase contract stands, and you must fund it another way after withdrawing from the credit.',
      },
      {
        q: 'What if the lender never told me about the withdrawal right?',
        a: 'The withdrawal period does not start running until you have received the mandatory contractual information. Missing information extends your window — and is a compliance failure worth raising with the lender or the national supervisor.',
      },
    ],
    related: [
      { label: 'Personal loans in Estonia', href: '/loans/personal' },
      { label: 'APR / KKM explained', href: '/guides/apr-kkm' },
      { label: 'Compare all loans', href: '/loans' },
      { label: 'Kulutusluotto Suomessa', href: '/fi/kulutusluotto' },
    ],
  },
];

export function getGuide(slug: string): GuideEntry | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
