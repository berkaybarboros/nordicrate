import { supabase } from './supabase';
import { INSTITUTIONS, PRODUCTS } from './data';
import type { Institution, LoanProduct } from './types';

// ── Institutions ──────────────────────────────────────────────
// Tries Supabase first; falls back to static seed data.
export async function getInstitutions(): Promise<Institution[]> {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('id');
    if (error || !data || data.length === 0) return INSTITUTIONS;
    return data.map(rowToInstitution);
  } catch {
    return INSTITUTIONS;
  }
}

// ── Products ──────────────────────────────────────────────────
export async function getProducts(): Promise<LoanProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('rate_min');
    if (error || !data || data.length === 0) return PRODUCTS;
    return data.map(rowToProduct);
  } catch {
    return PRODUCTS;
  }
}

// ── Leads ─────────────────────────────────────────────────────
export interface LeadInput {
  email?: string;
  name?: string;
  phone?: string;
  country?: string;
  loanType?: string;
  loanAmount?: number;
  monthlyIncome?: number;
  employmentType?: string;
  mode?: 'personal' | 'corporate';
  businessStage?: string;
  fundingNeeded?: number;
  sector?: string;
  matchedProductIds?: string[];
  matchedProgramIds?: string[];
  conversationSummary?: string;
  source?: string;
}

export async function createLead(input: LeadInput): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      email:                input.email,
      name:                 input.name,
      phone:                input.phone,
      country:              input.country,
      loan_type:            input.loanType,
      loan_amount:          input.loanAmount,
      monthly_income:       input.monthlyIncome,
      employment_type:      input.employmentType,
      mode:                 input.mode ?? 'personal',
      business_stage:       input.businessStage,
      funding_needed:       input.fundingNeeded,
      sector:               input.sector,
      matched_product_ids:  input.matchedProductIds ?? [],
      matched_program_ids:  input.matchedProgramIds ?? [],
      conversation_summary: input.conversationSummary,
      source:               input.source ?? 'nordicrate',
    })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: (data as { id: string } | null)?.id };
}

// ── User Profiles ─────────────────────────────────────────────
export interface UserProfileInput {
  userId: string;
  email?: string;
  name?: string;
  country?: string;
  monthlyIncome?: number;
  employmentType?: string;
  isResident?: boolean;
  businessStage?: string;
  companyName?: string;
  sector?: string;
  employeeCount?: number;
  annualRevenue?: number;
  fundingNeeded?: number;
  isEResident?: boolean;
  isDigitalNomad?: boolean;
  preferredMode?: 'personal' | 'corporate';
  preferredLoanTypes?: string[];
  onboardingCompleted?: boolean;
}

export async function upsertUserProfile(input: UserProfileInput): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id:              input.userId,
        email:                input.email,
        name:                 input.name,
        country:              input.country,
        monthly_income:       input.monthlyIncome,
        employment_type:      input.employmentType,
        is_resident:          input.isResident,
        business_stage:       input.businessStage,
        company_name:         input.companyName,
        sector:               input.sector,
        employee_count:       input.employeeCount,
        annual_revenue:       input.annualRevenue,
        funding_needed:       input.fundingNeeded,
        is_e_resident:        input.isEResident ?? false,
        is_digital_nomad:     input.isDigitalNomad ?? false,
        preferred_mode:       input.preferredMode ?? 'personal',
        preferred_loan_types: input.preferredLoanTypes ?? [],
        onboarding_completed: input.onboardingCompleted ?? false,
        updated_at:           new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) return { error: error.message };
  return {};
}

export async function getUserProfile(userId: string): Promise<UserProfileInput | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    userId:             row.user_id as string,
    email:              row.email as string | undefined,
    name:               row.name as string | undefined,
    country:            row.country as string | undefined,
    monthlyIncome:      row.monthly_income as number | undefined,
    employmentType:     row.employment_type as string | undefined,
    isResident:         row.is_resident as boolean | undefined,
    businessStage:      row.business_stage as string | undefined,
    companyName:        row.company_name as string | undefined,
    sector:             row.sector as string | undefined,
    employeeCount:      row.employee_count as number | undefined,
    annualRevenue:      row.annual_revenue as number | undefined,
    isEResident:        row.is_e_resident as boolean,
    isDigitalNomad:     row.is_digital_nomad as boolean,
    preferredMode:      row.preferred_mode as 'personal' | 'corporate',
    preferredLoanTypes: row.preferred_loan_types as string[],
    onboardingCompleted: row.onboarding_completed as boolean,
  };
}

// ── Row mappers ───────────────────────────────────────────────
function rowToInstitution(row: Record<string, unknown>): Institution {
  return {
    id:                  row.id as string,
    name:                row.name as string,
    shortName:           row.short_name as string,
    type:                row.type as Institution['type'],
    country:             row.country as Institution['country'],
    description:         row.description as string,
    founded:             row.founded as number | undefined,
    website:             row.website as string | undefined,
    isDigitalFriendly:   row.is_digital_friendly as boolean | undefined,
    isEResidentFriendly: row.is_e_resident_friendly as boolean | undefined,
  };
}

function rowToProduct(row: Record<string, unknown>): LoanProduct {
  return {
    id:                   row.id as string,
    institutionId:        row.institution_id as string,
    name:                 row.name as string,
    type:                 row.type as LoanProduct['type'],
    customerType:         row.customer_type as LoanProduct['customerType'],
    rateMin:              row.rate_min as number,
    rateMax:              row.rate_max as number,
    limitMin:             row.limit_min as number,
    limitMax:             row.limit_max as number,
    termMin:              row.term_min as number,
    termMax:              row.term_max as number,
    currency:             row.currency as LoanProduct['currency'],
    features:             row.features as string[],
    collateralRequired:   row.collateral_required as boolean,
    processingFeePercent: row.processing_fee_percent as number | undefined,
    updatedAt:            row.updated_at as string,
    isPromoted:           row.is_promoted as boolean | undefined,
  };
}
