/**
 * lib/trust-content.ts — Güven/PM sayfaları: /about, /how-we-make-money, /methodology
 * Kıyas sitesi güven standardı: kim olduğumuz + nasıl para kazandığımız +
 * veriyi nasıl topladığımız açık yazılır. UCPD dürüstlük kuralları geçerli:
 * uydurma sayı yok, sadece doğrulanabilir sistem gerçekleri.
 */

export interface TrustDoc {
  slug: string;
  title: string;
  description: string;
  md: string;
}

const ABOUT = String.raw`# About NordicRate

NordicRate is an independent loan and insurance comparison platform for the Nordic and Baltic countries — Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia and Lithuania.

## Why we exist

Comparing credit in this region is harder than it should be. Rates are scattered across dozens of bank websites in eight languages, advertised "from" rates hide the real cost, and expats, e-residents and newcomers face an extra wall of unfamiliar terminology. We built NordicRate to put the region's loan, mortgage and insurance market on one screen — with the numbers taken from the banks' own public pages, not from press releases.

## What we do

- **Compare** personal loans, mortgages, car loans, business financing, insurance and deposits from 50+ institutions across 8 countries.
- **Capture rates daily** from banks' public websites for a growing set of institutions, and mark them with a LIVE badge — see our [Methodology](/methodology).
- **Explain the concepts** behind every loan decision in plain language: [Euribor](/guides/euribor), [APR/KKM](/guides/apr-kkm), [LTV](/guides/ltv) and more, in English, Estonian and Finnish.
- **Stay independent.** We are not owned by, sponsored by, or affiliated with any bank or insurer. How the site is funded is documented openly in [How we make money](/how-we-make-money).

## What we don't do

We are not a bank, a broker or a financial advisor. We don't take loan applications, we don't see your credit file, and we never make decisions about you. Every contract is between you and the institution you choose — our job ends at giving you an honest, current picture of the market.

## Who is behind it

NordicRate was founded in 2026 by **Berkay Barboros**, a growth and performance-marketing professional building independent consumer tools for European markets. The platform is operated as a sole proprietorship; operator details are in the [Imprint](/imprint).

## Contact

- General: **info@nordicrate.com**
- Partnerships and B2B: **partners@nordicrate.com**`;

const HOW_WE_MAKE_MONEY = String.raw`# How We Make Money

Transparency is the entire value of a comparison site, so here is our funding model in full.

## The short version

NordicRate is free for you, and always will be. When you click through to a bank or insurer and end up becoming their customer, that institution (or an affiliate network acting for it) may pay us a referral commission. That's the business model — the same one used by comparison sites across Europe.

## What commissions do and don't affect

**They never change your price.** You pay the bank exactly what you would pay arriving at its website directly. Commissions come out of the institution's marketing budget, not your pocket.

**They never change the data.** Rates, terms and limits shown on NordicRate come from the institutions' own public pages — many captured automatically every day (see [Methodology](/methodology)). A commission cannot buy a better-looking rate, and no institution can pay to have its real rate hidden or altered.

**They can affect visibility — and we label it.** Some placements may be highlighted as promoted or featured. Wherever that happens, the placement carries a visible label. Default sorting is by the product data itself (for example, lowest rate first), never by who pays us.

## What we don't do

- We don't sell your personal data — see the [Privacy Policy](/privacy).
- We don't accept payment to remove or suppress any institution's products.
- We don't write fake reviews or invent ratings; you'll notice we display none, because we don't have genuine review volume yet.
- We don't compare every product on the market. Our catalog covers the major institutions in each country and grows continuously.

## Current status

We are candid about this too: NordicRate is early-stage. Affiliate partnerships with networks and institutions are being established, and some outbound links are currently unpaid referrals — we send banks traffic for free while agreements are pending. The model above describes how the site is designed to earn as those agreements go live.

Questions about this model: **info@nordicrate.com**`;

const METHODOLOGY = String.raw`# Methodology: Where Our Numbers Come From

Every comparison is only as good as its data. This page documents exactly how NordicRate collects, computes and displays rates.

## 1. Daily rate capture (LIVE badge)

For a growing set of institutions — currently six Estonian banks: LHV, Coop Pank, SEB, Swedbank, Inbank and Bigbank — we capture published rates **directly from the banks' own public product pages, every morning**. Offers backed by a fresh capture (within the last 48 hours) carry a **LIVE RATE** badge and a timestamp.

What the capture pipeline does:

- Reads the public product page the same way a visitor's browser would, once per day — no logins, no paywalled data, and we respect each site's robots.txt.
- Extracts the advertised rate with sanity checks (implausible values, fee percentages and promotional example calculations are filtered out).
- Stores every capture with its source URL and a text snippet, so each number can be traced back to the page it came from.

## 2. Euribor-linked pricing

Many mortgages in the region are priced as a bank margin plus [Euribor](/guides/euribor). When a bank publishes the margin (for example "1.49% + 6-month Euribor"), we **add the current 6-month Euribor** — sourced daily from the European Central Bank's data portal — and display the combined effective rate. We never display a bare margin as if it were the full rate.

## 3. Catalog data

Products without daily capture are maintained manually from the institutions' public pages, each with a "last updated" date. Where we cannot verify an upper rate bound, we show only the verified minimum instead of inventing a range. Stale entries (older than 90 days) have their date hidden rather than displayed as if fresh.

## 4. Reference rates

Euribor (3/6/12-month) comes from the **European Central Bank data portal**; Norwegian policy rates from the **Norges Bank API**. Both update daily and are shown with their publication dates.

## 5. What the numbers are — and aren't

Displayed rates are the institutions' **advertised/starting rates**. Your personal offer depends on the institution's individual assessment and may differ. NordicRate shows market information, not personalized quotes, and nothing here is financial advice — see the [Terms of Use](/terms).

## 6. Corrections

Found a number that doesn't match the bank's page? Email **info@nordicrate.com** with the product and source link. Verified corrections are applied with the next deployment, usually within a day.`;

export const TRUST_DOCS: TrustDoc[] = [
  { slug: 'about', title: 'About NordicRate', description: 'Who we are, why NordicRate exists, and what an independent loan comparison platform does — and doesn’t do.', md: ABOUT },
  { slug: 'how-we-make-money', title: 'How We Make Money', description: 'NordicRate is free for users. Here is exactly how the site is funded, and what commissions can and cannot influence.', md: HOW_WE_MAKE_MONEY },
  { slug: 'methodology', title: 'Methodology — Where Our Numbers Come From', description: 'How NordicRate captures bank rates daily, computes Euribor-linked pricing, and keeps catalog data honest.', md: METHODOLOGY },
];

export function getTrustDoc(slug: string): TrustDoc | undefined {
  return TRUST_DOCS.find((d) => d.slug === slug);
}
