import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Anon client — client component'larda ve cookie'siz server okumalarında (blog, db.ts).
//
// Lazy: modül yüklenirken oluşturulmaz. @supabase/ssr URL/key boşsa throw eder;
// eskiden `export const supabase = createBrowserClient(...)` env'siz ortamda
// (cloud oturumu, CI) `next build`'i "Collecting page data" adımında düşürüyordu.
// Env yoksa null döner — çağıran statik fallback'e ya da no-op'a geçer.
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached = createBrowserClient(url, key);
  return cached;
}

export const SUPABASE_NOT_CONFIGURED = 'Supabase is not configured';
