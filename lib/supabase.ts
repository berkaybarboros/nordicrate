import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Single client instance — works in both server and browser contexts.
// For server components that need cookie-based session propagation,
// migrate to @supabase/ssr when implementing SSR auth.
export const supabase = createClient(url, key);
