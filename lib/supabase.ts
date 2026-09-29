import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// createBrowserClient throws on an empty url or key, and this runs at module
// scope — so with no .env.local every route that imports it (sitemap.xml,
// /api/alerts, …) failed to build. A build must not need secrets: that is what
// lets CI and a cloud container verify their own work. So when the values are
// missing we hand it an unreachable placeholder: the module loads, and the
// first actual query fails with a network error instead of taking the build
// down. Production always has the real values; the warning is there so a
// misconfigured server says so in its logs rather than failing quietly.
const configured = Boolean(url && key);
if (!configured) {
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY missing — queries will fail. ' +
      'Expected during a build without secrets; a mistake anywhere else.',
  );
}

// Browser (client component) singleton
export const supabase = createBrowserClient(
  configured ? url : 'http://supabase.invalid',
  configured ? key : 'missing-anon-key',
);
