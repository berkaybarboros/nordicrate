/**
 * lib/supabase-admin.ts — Service-role Supabase client (SADECE server-side).
 *
 * RLS'i bypass eder → admin dashboard'un leads/events tablolarını okuyabilmesi için.
 * SUPABASE_SERVICE_ROLE_KEY env yoksa null döner; dashboard anon client'a düşer.
 *
 * ⚠️ Bu client'ı asla client component'a import etme — key sızar.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function createSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
