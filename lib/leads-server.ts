/**
 * lib/leads-server.ts — lead yazmaları (SADECE server-side).
 *
 * 2026-11-07: `leads` tablosunda 3 satır vardı ve hiçbiri aylardır eklenmemişti,
 * oysa aynı dönemde 741 ürün görüntüleme ve 219 bankaya tıklama oldu. Sebep tek:
 * yazma anon client ile yapılıyordu ve `.insert(...).select('id').single()`
 * deseni, `leads`'in okuması kısıtlı RLS'i yüzünden çalışmıyordu —
 *
 *   INSERT politikası : with_check true          → anon yazabilir
 *   SELECT politikası : auth.uid() = user_id     → anon kaydın user_id'si NULL
 *
 * `INSERT ... RETURNING` dönen satır için SELECT politikasını da uygulamak
 * zorunda, geçemiyor, bu yüzden **tüm statement hata veriyor ve satır yazılmıyor**.
 * Insert izni vermek yetmiyor: `.select()` eklediysen okuma izni de gerekiyor.
 *
 * Üstüne `/api/find-rate` yalnız `{ data: lead }` destructure ediyordu, yani
 * hata nesnesi hiç okunmuyordu — ne log, ne uyarı. Affiliate'in yanındaki ikinci
 * gelir mekanizması sessizce boşa çalıştı.
 *
 * Çözüm `/api/demand` ve `/api/alerts` ile aynı: ziyaretçi yazması server-side'dan
 * service-role ile yapılır, anon key'in yazma yetkisine ihtiyacı kalmaz.
 *
 * ⚠️ Bu dosyayı asla client component'a import etme — service-role key sızar.
 * Client tarafı `createLead()` üzerinden `/api/leads`'e POST eder.
 */

import { createSupabaseAdmin } from './supabase-admin';
import type { LeadInput } from './db';

export const SERVICE_ROLE_MISSING = 'SUPABASE_SERVICE_ROLE_KEY is not set';

export async function insertLead(input: LeadInput): Promise<{ id?: string; error?: string }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return { error: SERVICE_ROLE_MISSING };

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
      user_id:              input.userId ?? null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  // Satır yazıldıysa id döner. id yoksa yazılmadı sayılır: sessizce "oldu" demek
  // tam olarak bu hatayı aylarca gizleyen davranıştı.
  if (!data?.id) return { error: 'insert returned no id' };
  return { id: data.id };
}
