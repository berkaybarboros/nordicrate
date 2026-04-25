import { PROGRAMS } from '@/lib/programs-data';
import type { GovernmentProgram, ProgramAudience } from '@/lib/types';

export interface CorporateProfile {
  businessStage?: 'idea' | 'startup' | 'growth' | 'established';
  country?: string;
  employeeCount?: number;
  annualRevenue?: number;    // EUR
  fundingNeeded?: number;    // EUR
  sector?: 'tech' | 'fintech' | 'saas' | 'ecommerce' | 'manufacturing' | 'services' | 'agriculture' | 'tourism' | 'other';
  isEResident?: boolean;
  isDigitalNomad?: boolean;
  hasCollateral?: boolean;
  needsExportFinancing?: boolean;
  needsRdFunding?: boolean;
  companyAge?: number;       // years
}

export interface ProgramMatch {
  program: GovernmentProgram;
  score: number;             // 0–100
  matchReasons: string[];
}

const EU_STATES = new Set(['DK', 'FI', 'SE', 'EE', 'LV', 'LT']);
const EEA_STATES = new Set(['DK', 'FI', 'SE', 'EE', 'LV', 'LT', 'NO', 'IS']);

// Approximate EUR conversion for max amount comparisons
function toEUR(amount: number, currency?: string): number {
  switch (currency) {
    case 'NOK': return amount / 11;
    case 'SEK': return amount / 11;
    case 'DKK': return amount / 7.5;
    case 'ISK': return amount / 150;
    default:    return amount;
  }
}

function buildAudienceSet(profile: CorporateProfile): Set<ProgramAudience> {
  const s = new Set<ProgramAudience>();

  const stage = profile.businessStage;
  if (!stage || stage === 'idea' || stage === 'startup') s.add('startup');
  if (stage === 'growth' || stage === 'established') {
    s.add('sme');
    s.add('corporate');
  }

  const emp = profile.employeeCount;
  if (emp !== undefined) {
    if (emp <= 250) s.add('sme');
    if (emp > 250) s.add('corporate');
  }

  if (profile.isEResident)    s.add('e_resident');
  if (profile.isDigitalNomad) { s.add('digital_nomad'); s.add('freelancer'); }
  if (profile.needsRdFunding)          s.add('innovator');
  if (profile.needsExportFinancing)    s.add('exporter');

  return s;
}

function scoreProgram(
  program: GovernmentProgram,
  profile: CorporateProfile,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // ── 1. Country match (max 35) ──────────────────────────────────────
  if (program.country === 'EU') {
    if (profile.country && EU_STATES.has(profile.country)) {
      score += 25;
      reasons.push(`EU fund — available in ${profile.country}`);
    } else if (profile.country && EEA_STATES.has(profile.country)) {
      score += 20;
      reasons.push('EU fund — EEA country eligible');
    } else if (!profile.country) {
      score += 12;
    }
  } else if (profile.country && program.country === profile.country) {
    score += 35;
    reasons.push(`${program.flag} National program — exact country match`);
  } else if (!profile.country) {
    score += 8;
  }
  // country mismatch on national program → 0

  // ── 2. Audience match (max 30) ────────────────────────────────────
  const audienceSet = buildAudienceSet(profile);
  const matched = program.audience.filter(a => audienceSet.has(a));
  score += Math.min(matched.length * 15, 30);
  if (matched.length > 0) reasons.push(`Targets: ${matched.join(', ')}`);

  // ── 3. Penalise irrelevant program types ──────────────────────────
  const isNomadOrERes = profile.isEResident || profile.isDigitalNomad;
  if (!isNomadOrERes && ['digital_nomad_visa', 'startup_visa', 'e_residency'].includes(program.type)) {
    score -= 20;
  }
  // Housing/individual programs are irrelevant in corporate mode
  if (program.audience.every(a => a === 'individual')) {
    score -= 35;
  }

  // ── 4. e-Residency / digital nomad bonuses (max 25) ──────────────
  if (profile.isEResident && program.isEResidentFriendly) {
    score += 15;
    reasons.push('e-Resident friendly');
  }
  if (profile.isDigitalNomad && program.isDigitalNomadFriendly) {
    score += 10;
    reasons.push('Digital nomad friendly');
  }

  // ── 5. Amount compatibility (max 15) ─────────────────────────────
  if (profile.fundingNeeded && program.maxAmount) {
    const maxEUR = toEUR(program.maxAmount, program.currency);
    if (maxEUR >= profile.fundingNeeded) {
      score += 15;
      reasons.push(`Covers €${profile.fundingNeeded.toLocaleString()} request`);
    } else if (maxEUR >= profile.fundingNeeded * 0.5) {
      score += 7;
      reasons.push('Partially covers funding need');
    }
  }

  // ── 6. Business stage fit (max 10) ───────────────────────────────
  const isEarly =
    !profile.businessStage ||
    profile.businessStage === 'idea' ||
    profile.businessStage === 'startup' ||
    (profile.companyAge !== undefined && profile.companyAge < 3);

  const isGrowth =
    profile.businessStage === 'growth' ||
    profile.businessStage === 'established' ||
    (profile.companyAge !== undefined && profile.companyAge >= 3);

  if (isEarly && ['startup_loan', 'grant', 'innovation_fund'].includes(program.type)) {
    score += 10;
    reasons.push('Ideal for early-stage companies');
  }
  if (isGrowth && ['government_loan', 'guarantee', 'eu_fund'].includes(program.type)) {
    score += 8;
    reasons.push('Good fit for growth-stage');
  }

  // ── 7. Thematic bonuses ───────────────────────────────────────────
  if (profile.needsRdFunding && ['innovation_fund', 'grant'].includes(program.type)) {
    score += 10;
    reasons.push('R&D / innovation match');
  }
  if (profile.needsExportFinancing && program.type === 'export_credit') {
    score += 15;
    reasons.push('Export financing match');
  }

  // ── 8. Tech/fintech sector tag bonus ─────────────────────────────
  if (profile.sector && ['tech', 'fintech', 'saas'].includes(profile.sector)) {
    const techTags = ['digital', 'tech', 'fintech', 'innovation', 'R&D', 'startup-friendly', 'startup', 'deep tech'];
    if (program.tags?.some(t => techTags.includes(t))) score += 5;
  }

  return { score: Math.max(0, score), reasons };
}

export function matchPrograms(profile: CorporateProfile, limit = 5): ProgramMatch[] {
  if (Object.keys(profile).length === 0) return [];

  return PROGRAMS
    .map(program => {
      const { score, reasons } = scoreProgram(program, profile);
      return { program, score, matchReasons: reasons };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
