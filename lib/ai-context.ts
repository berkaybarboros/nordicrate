import { PRODUCTS, INSTITUTIONS, COUNTRIES } from '@/lib/data';
import { PROGRAMS } from '@/lib/programs-data';

export type AssistantMode = 'personal' | 'corporate';

function buildDataContext(): string {
  // Country summary
  const countryLines = COUNTRIES.map(c => {
    const insts = INSTITUTIONS.filter(i => i.country === c.code);
    const prods = PRODUCTS.filter(p => {
      const inst = INSTITUTIONS.find(i => i.id === p.institutionId);
      return inst?.country === c.code;
    });
    const personalRates = prods.filter(p => p.type === 'personal');
    const mortgageRates = prods.filter(p => p.type === 'mortgage');
    const businessRates = prods.filter(p => p.type === 'business');

    const avgPersonal = personalRates.length
      ? (personalRates.reduce((a, b) => a + b.rateMin, 0) / personalRates.length).toFixed(2)
      : 'N/A';
    const avgMortgage = mortgageRates.length
      ? (mortgageRates.reduce((a, b) => a + b.rateMin, 0) / mortgageRates.length).toFixed(2)
      : 'N/A';
    const avgBusiness = businessRates.length
      ? (businessRates.reduce((a, b) => a + b.rateMin, 0) / businessRates.length).toFixed(2)
      : 'N/A';

    return `${c.flag} ${c.name} (${c.code}) — ${c.currency}, EU:${c.inEU}, Eurozone:${c.inEurozone}, ${insts.length} banks, ${prods.length} products | Avg rates: personal ${avgPersonal}%, mortgage ${avgMortgage}%, business ${avgBusiness}%`;
  }).join('\n');

  // Best products per type
  const bestPersonal = [...PRODUCTS].filter(p => p.type === 'personal').sort((a, b) => a.rateMin - b.rateMin).slice(0, 5);
  const bestMortgage = [...PRODUCTS].filter(p => p.type === 'mortgage').sort((a, b) => a.rateMin - b.rateMin).slice(0, 5);
  const bestBusiness = [...PRODUCTS].filter(p => p.type === 'business').sort((a, b) => a.rateMin - b.rateMin).slice(0, 5);

  function formatProduct(p: typeof PRODUCTS[0]) {
    const inst = INSTITUTIONS.find(i => i.id === p.institutionId);
    const country = COUNTRIES.find(c => c.code === inst?.country);
    return `  - ${inst?.shortName} (${country?.flag}${country?.code}): ${p.name}, APR ${p.rateMin}%–${p.rateMax}%, ${p.currency} ${(p.limitMin/1000).toFixed(0)}k–${(p.limitMax/1000).toFixed(0)}k, term ${p.termMin}–${p.termMax}mo${p.collateralRequired ? ', collateral required' : ''}`;
  }

  // Program types summary
  const programTypes = [...new Set(PROGRAMS.map(p => p.type))];
  const programSummary = programTypes.map(type => {
    const progs = PROGRAMS.filter(p => p.type === type);
    return `  ${type}: ${progs.map(p => `${p.flag}${p.name} (${p.country})`).join(', ')}`;
  }).join('\n');

  return `
=== NORDICRATE PLATFORM DATA ===

COUNTRIES COVERED:
${countryLines}

TOP 5 PERSONAL LOANS (by lowest APR):
${bestPersonal.map(formatProduct).join('\n')}

TOP 5 MORTGAGE RATES (by lowest APR):
${bestMortgage.map(formatProduct).join('\n')}

TOP 5 BUSINESS LOANS (by lowest APR):
${bestBusiness.map(formatProduct).join('\n')}

GOVERNMENT & SPECIAL PROGRAMS (${PROGRAMS.length} total):
${programSummary}

TOTAL PLATFORM STATS:
- ${INSTITUTIONS.length} financial institutions
- ${PRODUCTS.length} loan products
- ${PROGRAMS.length} government programs
- 8 countries (5 Nordic + 3 Baltic)
`.trim();
}

export function buildSystemPrompt(mode: AssistantMode): string {
  const data = buildDataContext();

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

  if (mode === 'personal') {
    return `You are NordicAI, the personal finance assistant for NordicRate — the #1 Nordic & Baltic loan comparison platform.

YOUR ROLE (Personal Mode):
Help individuals (expats, digital nomads, locals) find the best loan, understand their eligibility, and assess financial risk for personal loans, mortgages, and auto loans across 8 countries.

ELIGIBILITY ASSESSMENT FRAMEWORK:
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
If user hasn't provided details, ask for: 1) Country of interest, 2) Loan type & amount, 3) Monthly net income, 4) Employment type, 5) Residency status.
Then provide: eligibility assessment + top 3 matching products + risk score + next steps.`;
  }

  // Corporate mode
  return `You are NordicAI, the corporate finance assistant for NordicRate — the #1 Nordic & Baltic loan comparison platform.

YOUR ROLE (Corporate Mode):
Help businesses (startups, SMEs, scale-ups, digital nomad founders) find the best business financing, government programs, EU funds, and assess corporate loan eligibility across 8 countries.

CORPORATE ELIGIBILITY FRAMEWORK:
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
If user hasn't provided details, ask for: 1) Business stage (idea/startup/established), 2) Country preference or citizenship, 3) Revenue (if any), 4) Funding needed + purpose, 5) Team size.
Then provide: eligibility assessment + top 3 programs/products + strategic recommendation.`;
}
