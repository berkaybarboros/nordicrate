/**
 * lib/company-profile.ts — başvuru formlarının ortak metinleri, canlı rakamlarla.
 *
 * Hızlandırıcı/kredi/partner formları hep aynı şeyi sorar: tek cümlelik tanım,
 * problem, çözüm, pazar, iş modeli, traction, ekip, plan. Bu metinler tek yerde
 * durur ve rakamları /api/cron/founder-facts'ten alır — elle yazılan rakam bayatlar
 * (2026-09-15'te "%75 tıklama" ve "%96 organik" iddiaları böyle yanlış çıkmıştı).
 *
 * Kural: buradaki hiçbir cümle doğrulanmamış iddia içermez. Rakam yoksa cümle
 * kurulmaz; profildeki eksik alanlar "MISSING" olarak kalır ve otomasyon sorar.
 */

export interface CompanyProfile {
  trading_name?: string;
  legal_name?: string;
  entity_type?: string;
  country?: string;
  registry_no?: string;
  tax_id?: string;
  address?: string;
  founded?: string;
  website?: string;
  email?: string;
  phone?: string;
  linkedin_company?: string;
  founder_name?: string;
  founder_role?: string;
  founder_linkedin?: string;
  founder_bio?: string;
  team_size?: number;
  funding_raised_eur?: number;
  sector?: string;
  markets?: string[];
  target_raise_eur?: number;
  relocation?: string;
  [key: string]: unknown;
}

interface Facts {
  catalogue?: {
    countries?: number;
    institutions?: number;
    products?: number;
    fundingPrograms?: number;
    publishedArticles?: number | null;
    liveRateProductsTotal?: number;
  };
  traction60d?: {
    sessions?: number;
    sessionsReachedOffers?: number;
    sessionsClickedToBank?: number;
    clickThroughOfOffersPct?: number | null;
  };
  leadsTotal?: number | null;
  company?: { liveSince?: string; firstCommit?: string; revenueEur?: number };
}

/** Profilde doldurulmamış (MISSING) alanlar — otomasyon bunları hatırlatır. */
export function collectMissing(profile: CompanyProfile): string[] {
  return Object.entries(profile)
    .filter(([, v]) => typeof v === 'string' && v.toUpperCase().startsWith('MISSING'))
    .map(([k]) => k);
}

/**
 * Form alanlarına doğrudan yapıştırılabilir metin blokları. Uzunluk sınırı olan
 * formlar için üç boy: short (~200), medium (~500), long (~900 karakter).
 */
export function buildBoilerplate(profile: CompanyProfile, factsUnknown: unknown) {
  const f = (factsUnknown ?? {}) as Facts;
  const c = f.catalogue ?? {};
  const t = f.traction60d ?? {};

  const num = (v: number | null | undefined) => (typeof v === 'number' ? v : null);
  const sessions = num(t.sessions);
  const reached = num(t.sessionsReachedOffers);
  const clicked = num(t.sessionsClickedToBank);
  const ctr = num(t.clickThroughOfOffersPct ?? null);

  const tractionSentence =
    sessions != null && reached != null && clicked != null
      ? `In the last 60 days, with no paid marketing: ${sessions} sessions, ${reached} reached the offer list and ${clicked} clicked through to a bank${ctr != null ? ` (${ctr}% of those who saw offers)` : ''}.`
      : 'Traction figures unavailable — check /api/cron/founder-facts before submitting.';

  const catalogueSentence =
    c.products != null && c.institutions != null && c.countries != null
      ? `${c.products}+ products from ${c.institutions} institutions across ${c.countries} countries, of which ${c.liveRateProductsTotal ?? 0} have rates read daily from the bank's own website.`
      : 'Catalogue figures unavailable.';

  const oneLiner =
    'NordicRate is an English, AI-assisted comparison platform for loans, deposits and insurance across the 8 Nordic and Baltic markets, with bank rates read daily from each bank\'s own website.';

  return {
    one_liner: oneLiner,

    pitch_short:
      `${oneLiner} Built for the foreign residents and e-residents that local, single-country comparison sites do not serve.`,

    pitch_medium:
      `${oneLiner} Our users are the 5.5 million foreign-born residents of these countries plus Estonia's e-residents: people who cannot easily tell which bank will lend to them or at what rate today. ${catalogueSentence} Banks, lenders and insurers pay us affiliate commissions and for consented leads; listing and corrections are free, and ranking is never paid.`,

    problem:
      'People who move to the Nordics and Baltics cannot easily find out which banks will lend to them and at what rate: offers sit on dozens of local-language bank sites, residency requirements are rarely stated, and most comparison sites are single-country, local-language and ask for a loan application before showing offers.',

    solution:
      `An English comparison across 8 markets — loans, mortgages, car loans, term deposits, insurance and 38 public funding programmes. Rates are read daily from banks' own product pages and shown with the time they were checked and a link to the source; anything not read live is labelled indicative. A 4-question, no-signup flow plus an LLM assistant match people to offers that fit their residency, amount and income.`,

    market:
      '5.5M foreign-born residents across the 8 markets (16% of 34.3M, Eurostat 1 Jan 2025) and 443k new arrivals in 2024; 144k Estonian e-residents with 44k+ companies. Finland alone holds €140.6bn of household loans and €118.1bn of deposits (Bank of Finland, 2026).',

    business_model:
      'Affiliate commissions from banks, lenders and insurers per click, application or approved contract (Awin and Adtraction accounts are live) plus consented lead generation; later, rate data and embeddable comparison for relocation firms, employers and media.',

    competition:
      'Lendo Group (SE/NO/DK), Axo Group with Zmarta (NO/SE/FI/DK), Sortter and Rahalaitos (FI), Laenud.ee and Moneezy (EE/LT); public tools Finansportalen (NO) and Konsumenternas (SE). All are single-country or local-language, and most require an application before showing offers. None is English-first across the Nordics and Baltics.',

    traction: `${catalogueSentence} ${tractionSentence} Leads so far: ${f.leadsTotal ?? 0}. Revenue: €${f.company?.revenueEur ?? 0} — affiliate programme approvals in progress.`,

    team:
      `${profile.founder_name ?? 'Founder'} — ${profile.founder_role ?? 'Founder'}. ${profile.founder_bio ?? 'MISSING — founder bio'} Built the product solo since ${f.company?.firstCommit ?? profile.founded ?? '2026'}: data pipeline, comparison engine, LLM assistant, analytics and content automation. Missing competencies: partnerships and sales with Nordic and Baltic banks and insurers, and a second engineer for data work.`,

    goals_6m:
      'Coverage: live rate extraction for Sweden, Iceland, Latvia and Lithuania, taking live-rate products from 20 to 60+. Revenue: first affiliate income with measured conversion, and at least one signed bank or insurer partnership. Matching: residency-aware eligibility matching validated against real user outcomes.',

    use_of_funds:
      `Target raise €${profile.target_raise_eur ?? 200000}: growth and partnerships hire 35%, data coverage and partnerships 30%, founder runway 25%, EU entity and legal 10%.`,

    ai_usage:
      "An LLM assistant answers borrowing and funding questions with the live catalogue in context and extracts a structured profile from the conversation; next is LLM-based rate extraction that turns any bank's rate page, table or PDF into validated structured data. We do not score creditworthiness — lenders decide — so the system stays outside the EU AI Act's high-risk category, and users are told they are talking to AI.",

    data_sources:
      "Public rates from banks' own product pages, read once a day by an automated browser that respects robots.txt, each value stored with a timestamp and source URL; ECB and Norges Bank reference rates; public funding programme data; and what users voluntarily tell the assistant. No personal data is used to train models.",

    why_now:
      'Migration into these markets keeps rising (443k arrivals in 2024), e-Residency company registrations are up about 36% in 2026, and the regional comparison market is consolidating — Clar bought Lendo Group at EV NOK 1.0bn in 2026 — while no incumbent serves this audience in English.',

    risks:
      'Foreign-resident traffic may convert worse than local traffic because some lenders require local credit history; we measure users\' residency mix and route to lenders that accept them. Banks could restrict automated reading; we read public pages once a day, respect robots.txt, link back to the source and are moving to direct feeds. Solo founder capacity is limited; the operation is automated and the first hire is planned.',

    company_facts: {
      legal_name: profile.legal_name,
      trading_name: profile.trading_name,
      entity_type: profile.entity_type,
      country: profile.country,
      registry_no: profile.registry_no,
      tax_id: profile.tax_id,
      address: profile.address,
      founded: profile.founded,
      website: profile.website,
      email: profile.email,
      phone: profile.phone,
      linkedin_company: profile.linkedin_company,
      founder_name: profile.founder_name,
      founder_linkedin: profile.founder_linkedin,
      team_size: profile.team_size,
      funding_raised_eur: profile.funding_raised_eur,
      sector: profile.sector,
      markets: profile.markets,
      relocation: profile.relocation,
      live_since: f.company?.liveSince,
    },
  };
}
