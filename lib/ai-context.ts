import { PRODUCTS, INSTITUTIONS, COUNTRIES } from '@/lib/data';
import { PROGRAMS } from '@/lib/programs-data';
import type { LiveRatesData } from '@/lib/types';

export type AssistantMode = 'personal' | 'corporate';

export interface OnboardingContext {
  name?: string;
  country?: string;
  preferredLoanTypes?: string[];
  monthlyIncome?: number;
  preferredMode?: 'personal' | 'corporate';
}

function formatProduct(p: typeof PRODUCTS[0]) {
  const inst = INSTITUTIONS.find(i => i.id === p.institutionId);
  const country = COUNTRIES.find(c => c.code === inst?.country);
  const website = inst?.website ? ` | ${inst.website}` : '';
  const eRes = inst?.isEResidentFriendly ? ' | ✅ e-Resident friendly' : '';
  const digital = inst?.isDigitalFriendly ? ' | 📱 Digital-first' : '';
  return `  - ${inst?.shortName} (${country?.flag}${country?.code}): ${p.name}, APR ${p.rateMin}%–${p.rateMax}%, ${p.currency} ${(p.limitMin/1000).toFixed(0)}k–${(p.limitMax/1000).toFixed(0)}k, term ${p.termMin}–${p.termMax}mo${p.collateralRequired ? ', collateral req.' : ''}${eRes}${digital}${website}`;
}

/**
 * Kompakt data context — Groq on-demand tier TPM limiti 12k token/dk.
 * Eski hali TÜM kataloğu (~8.8k token) her istekte gönderiyordu → 3. mesajda
 * rate_limit_exceeded patlıyordu. Şimdi: mode'a göre sadece ilgili ürün tipleri,
 * tip başına en iyi TOP_N ürün + kalanı özet satır. Hedef: ~2.5k token/istek.
 */
const TOP_N = 8;

function buildDataContext(mode: AssistantMode, liveRates?: LiveRatesData): string {
  // Live rates block
  let liveRatesBlock = '';
  if (liveRates?.success) {
    const { euribor3m, euribor6m, euribor12m } = liveRates.euribor;
    const cbRates = Object.values(liveRates.centralBankRates)
      .map(r => `  ${r.label}: ${r.rate}% ${r.currency} (${r.period ?? ''})`)
      .join('\n');
    liveRatesBlock = `
LIVE MARKET RATES (as of ${new Date(liveRates.fetchedAt).toLocaleDateString('en-GB')}):
  EURIBOR 3M: ${euribor3m.rate}% | 6M: ${euribor6m.rate}% | 12M: ${euribor12m.rate}%
CENTRAL BANK RATES:
${cbRates}
NOTE: Variable-rate mortgages are typically EURIBOR + bank margin (0.5%–2.5%).`;
  }

  // Country summary (kompakt — her zaman dahil, coğrafi soruların bel kemiği)
  const countryLines = COUNTRIES.map(c => {
    const insts = INSTITUTIONS.filter(i => i.country === c.code);
    const prods = PRODUCTS.filter(p => INSTITUTIONS.find(i => i.id === p.institutionId)?.country === c.code);
    const personalMin = prods.filter(p => p.type === 'personal').sort((a, b) => a.rateMin - b.rateMin)[0];
    const mortgageMin = prods.filter(p => p.type === 'mortgage').sort((a, b) => a.rateMin - b.rateMin)[0];
    const businessMin = prods.filter(p => p.type === 'business').sort((a, b) => a.rateMin - b.rateMin)[0];
    return `${c.flag}${c.code} ${c.currency}${c.inEurozone ? '/€zone' : ''} | ${insts.length} inst | best: personal ${personalMin?.rateMin ?? '–'}%, mortgage ${mortgageMin?.rateMin ?? '–'}%, business ${businessMin?.rateMin ?? '–'}%`;
  }).join('\n');

  // Tip başına top-N + kalan özeti
  const productBlock = (type: 'personal' | 'mortgage' | 'business', label: string) => {
    const all = [...PRODUCTS].filter(p => p.type === type).sort((a, b) => a.rateMin - b.rateMin);
    const top = all.slice(0, TOP_N).map(formatProduct).join('\n');
    const rest = all.length > TOP_N
      ? `\n  …plus ${all.length - TOP_N} more ${type} products (rates up to ${all[all.length - 1].rateMax}%) — full list at nordicrate.com`
      : '';
    return `TOP ${label} (best ${Math.min(TOP_N, all.length)} of ${all.length}, by APR):\n${top}${rest}`;
  };

  // Mode'a göre sadece ilgili bloklar — personal mode'a business/program dökme
  const productSections = mode === 'personal'
    ? [productBlock('personal', 'PERSONAL LOANS'), productBlock('mortgage', 'MORTGAGES')]
    : [productBlock('business', 'BUSINESS LOANS')];

  // Programlar sadece corporate mode'da, kompakt formatta
  let programsSection = '';
  if (mode === 'corporate') {
    const programLines = PROGRAMS.map(p =>
      `  ${p.flag}[${p.country}] ${p.name} (${p.type})${p.maxAmount ? ` max ${(p.maxAmount / 1000).toFixed(0)}k ${p.currency}` : ''}${p.rateMin != null ? ` rate ${p.rateMin}${p.rateMax ? `–${p.rateMax}` : ''}%` : ''} — ${p.audience.join('/')}`
    ).join('\n');
    programsSection = `\nGOVERNMENT & EU PROGRAMS (${PROGRAMS.length}):\n${programLines}\n`;
  }

  return `
=== NORDICRATE PLATFORM DATA ===
${liveRatesBlock}

COUNTRIES (5 Nordic + 3 Baltic):
${countryLines}

${productSections.join('\n\n')}
${programsSection}
PLATFORM STATS: ${INSTITUTIONS.length} institutions | ${PRODUCTS.length} loan products | ${PROGRAMS.length} programs
`.trim();
}

function buildOnboardingBlock(onboarding: OnboardingContext): string {
  const country = onboarding.country
    ? COUNTRIES.find(c => c.code === onboarding.country)
    : undefined;
  const loanType = onboarding.preferredLoanTypes?.[0];
  const incomeStr = onboarding.monthlyIncome && onboarding.monthlyIncome > 0
    ? `~€${onboarding.monthlyIncome.toLocaleString()}/month`
    : undefined;

  const lines = [
    onboarding.name           && `  Name: ${onboarding.name}`,
    country                   && `  Country of interest: ${country.flag} ${country.name} (${country.code})`,
    loanType                  && `  Preferred loan type: ${loanType}`,
    incomeStr                 && `  Monthly income: ${incomeStr}`,
    onboarding.preferredMode  && `  Mode: ${onboarding.preferredMode}`,
  ].filter(Boolean).join('\n');

  if (!lines) return '';

  return `
USER ONBOARDING PROFILE (already collected — do NOT re-ask these):
${lines}

IMPORTANT: The user completed onboarding and shared the above preferences. Use this immediately:
- Reference their country and loan type in your first response
- Skip the "tell me your situation" opener — go straight to recommendations
- If they ask "what are my options" or similar, show the best products for their country/loan type first`.trim();
}

export function buildSystemPrompt(mode: AssistantMode, liveRates?: LiveRatesData, topProgramsText?: string, onboarding?: OnboardingContext): string {
  const data = buildDataContext(mode, liveRates);

  const sharedRules = `
RESPONSE RULES:
- Always be concise, structured, and actionable
- Use bullet points and short paragraphs
- Include specific numbers (rates, amounts, terms) when relevant
- Always remind users that rates are indicative and to verify directly with the bank
- Never give legal or binding financial advice — you are a comparison tool assistant
- When recommending products, explain WHY (lowest rate, best term, e-resident friendly, etc.)
- If user's currency differs from product currency, mention FX risk
- Respond in the same language the user writes in (Turkish, English, etc.)
`.trim();

  const onboardingBlock = onboarding ? buildOnboardingBlock(onboarding) : '';

  if (mode === 'personal') {
    return `You are NordicAI, the personal finance assistant for NordicRate — the #1 Nordic & Baltic loan comparison platform.

YOUR ROLE (Personal Mode):
Help individuals (expats, digital nomads, locals) find the best loan, understand their eligibility, and assess financial risk for personal loans, mortgages, and auto loans across 8 countries.

${onboardingBlock ? onboardingBlock + '\n' : ''}ELIGIBILITY ASSESSMENT FRAMEWORK:
When a user shares financial details, assess eligibility using these guidelines:
- DTI (Debt-to-Income): Monthly loan payment should not exceed 35–40% of net monthly income
- LTV (Loan-to-Value) for mortgages: Typically max 70–85% depending on country
- Employment: Permanent employment preferred; self-employed and freelancers can apply with 2+ years tax returns
- Credit history: No defaults in last 3 years ideal
- Residency: Some banks require local residency; e-resident friendly banks are LHV (EE), Inbank (EE), CitadeleBanka (LV)
- Income minimum: Most personal loans require €1,000+/month net; mortgages €2,000+/month

RISK SCORING GUIDE:
Based on user inputs, provide a simple risk assessment:
- LOW RISK: Stable employment, DTI < 30%, local residency, good credit history
- MEDIUM RISK: Freelance/self-employed, DTI 30–40%, expat status
- HIGH RISK: DTI > 40%, no local residency, short employment history

${data}

${sharedRules}

CONVERSATION FLOW:
${onboardingBlock
  ? 'User already provided country, loan type and income via onboarding. Start with personalized recommendations — do NOT ask for info they already gave.'
  : 'If user hasn\'t provided details, ask for: 1) Country of interest, 2) Loan type & amount, 3) Monthly net income, 4) Employment type, 5) Residency status.'}
Then provide: eligibility assessment + top 3 matching products + risk score + next steps.`;
  }

  // Corporate mode
  return `You are NordicAI, the corporate finance assistant for NordicRate — the #1 Nordic & Baltic loan comparison platform.

YOUR ROLE (Corporate Mode):
Help businesses (startups, SMEs, scale-ups, digital nomad founders) find the best business financing, government programs, EU funds, and assess corporate loan eligibility across 8 countries.

${onboardingBlock ? onboardingBlock + '\n' : ''}CORPORATE ELIGIBILITY FRAMEWORK:
- Revenue-based: Most banks require 2+ years of positive revenue; startups need government/guarantee-backed loans
- Startup programs: Finnvera (FI), Innovasjon Norge (NO), Almi (SE), Enterprise Estonia (EE) — no revenue history required
- EU Funds: EIB, EIF, Horizon Europe available across all 8 countries
- e-Residency (Estonia): Company registration in 24h, EUR banking via LHV, no physical presence required
- Collateral: Asset-backed preferred; government guarantees can substitute for startups
- Business age: <2 years → government programs; 2+ years → bank loans; 5+ years → full range

PROGRAM RECOMMENDATION LOGIC:
- Startup + early stage → Government startup loans + grants (Finnvera, Innovasjon Norge, Almi, Enterprise Estonia)
- Digital/remote business → Estonia e-Residency + LHV banking
- Digital nomad + founder → Digital Nomad Visa (EE/LV/LT/IS) + e-Residency combo
- Export-focused → Export credit programs (Finnvera Export, EKF Denmark)
- Innovation/R&D → Horizon Europe, Business Finland, Innovation Norway
- SME growth → EIF guarantees + local bank business loans

${data}

${sharedRules}

CONVERSATION FLOW:
${onboardingBlock
  ? 'User already provided country and mode via onboarding. Start with personalized business loan/program recommendations.'
  : 'If user hasn\'t provided details, ask for: 1) Business stage (idea/startup/established), 2) Country preference or citizenship, 3) Revenue (if any), 4) Funding needed + purpose, 5) Team size.'}
Then provide: eligibility assessment + top 3 programs/products + strategic recommendation.
${topProgramsText ? `
PERSONALIZED PROGRAM MATCHES (ranked by relevance to this specific user — lead with these):
${topProgramsText}

INSTRUCTION: Reference the above matched programs first in your recommendations. Explain why each is a strong fit based on the match reasons shown. Then suggest additional options if relevant.` : ''}`;
}
