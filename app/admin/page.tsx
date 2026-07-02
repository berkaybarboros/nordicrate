/**
 * /admin — Internal lead funnel dashboard (V3 madde B3)
 *
 * Auth: ADMIN_TOKEN cookie (lib/admin-auth.ts)
 * Data: SUPABASE_SERVICE_ROLE_KEY varsa service-role client (RLS bypass),
 *       yoksa anon client'a düşer ve uyarı gösterir.
 */

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isAdminAuthed } from '@/lib/admin-auth';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServer } from '@/lib/supabase-server';
import LogoutButton from '@/components/admin/LogoutButton';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface EventRow {
  event_type: string;
  page: string | null;
  product_type: string | null;
  created_at: string;
}

interface LeadRow {
  id: string;
  created_at: string;
  email: string | null;
  country: string | null;
  product_type?: string | null;
  loan_type?: string | null;
  amount?: number | null;
  loan_amount?: number | null;
  source?: string | null;
  mode?: string | null;
}

interface ScrapedRateRow {
  bank_id: string;
  product_type: string;
  rate_min: number | null;
  aprc: number | null;
  raw_snippet: string | null;
  scraped_at: string;
}

const EMPTY_DATA = {
  usingServiceRole: false,
  leads: [] as LeadRow[],
  leadsError: 'Data load timed out — Supabase unreachable?' as string | null,
  events: [] as EventRow[],
  eventsError: null as string | null,
  alertCount: 0,
  scrapedRates: [] as ScrapedRateRow[],
};

async function loadData(): Promise<typeof EMPTY_DATA> {
  // Supabase erişilemezse sayfa sonsuza kadar beklemesin — 8sn'de boş veriyle render et
  return Promise.race([
    loadDataInner(),
    new Promise<typeof EMPTY_DATA>((resolve) => setTimeout(() => resolve(EMPTY_DATA), 8000)),
  ]);
}

async function loadDataInner() {
  const admin = createSupabaseAdmin();
  const client = admin ?? (await createSupabaseServer());
  const usingServiceRole = admin !== null;

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [leadsRes, eventsRes, alertsRes, scrapedRes] = await Promise.all([
    client
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
    client
      .from('events')
      .select('event_type, page, product_type, created_at')
      .gte('created_at', since30d)
      .order('created_at', { ascending: false })
      .limit(2000),
    client.from('rate_alerts').select('id', { count: 'exact', head: true }),
    // D1 pilot — tablo henüz yoksa sessizce boş döner
    client
      .from('latest_scraped_rates')
      .select('bank_id, product_type, rate_min, aprc, raw_snippet, scraped_at')
      .order('bank_id'),
  ]);

  return {
    usingServiceRole,
    leads: (leadsRes.data ?? []) as LeadRow[],
    leadsError: leadsRes.error?.message ?? null,
    events: (eventsRes.data ?? []) as EventRow[],
    eventsError: eventsRes.error?.message ?? null,
    alertCount: alertsRes.count ?? 0,
    scrapedRates: (scrapedRes.data ?? []) as ScrapedRateRow[],
  };
}

function countBy<T>(rows: T[], key: (row: T) => string | null | undefined): [string, number][] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const k = key(row) ?? '(unknown)';
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function pct(n: number, of: number): string {
  if (of === 0) return '—';
  return `${((n / of) * 100).toFixed(1)}%`;
}

export default async function AdminDashboard() {
  if (!(await isAdminAuthed())) redirect('/admin/login');

  const { usingServiceRole, leads, leadsError, events, eventsError, alertCount, scrapedRates } = await loadData();

  const eventCounts = new Map(countBy(events, (e) => e.event_type));
  const pageViews = eventCounts.get('page_view') ?? 0;
  const productViews = eventCounts.get('product_view') ?? 0;
  const applyClicks = eventCounts.get('apply_click') ?? 0;
  const findRateOpens = eventCounts.get('find_rate_open') ?? 0;
  const findRateSubmits = eventCounts.get('find_rate_submit') ?? 0;
  const recClicks = eventCounts.get('recommendation_click') ?? 0;

  const leadsWithEmail = leads.filter((l) => l.email).length;
  const leadsByProduct = countBy(leads, (l) => l.product_type ?? l.loan_type);
  const leadsByCountry = countBy(leads, (l) => l.country);

  const funnel = [
    { label: 'Page views (30d)', value: pageViews, rate: '—' },
    { label: 'Product views', value: productViews, rate: pct(productViews, pageViews) },
    { label: 'Apply clicks', value: applyClicks, rate: pct(applyClicks, productViews) },
  ];

  const aiFunnel = [
    { label: 'Find-rate modal opened', value: findRateOpens, rate: '—' },
    { label: 'Form submitted (lead)', value: findRateSubmits, rate: pct(findRateSubmits, findRateOpens) },
    { label: 'Recommendation clicked', value: recClicks, rate: pct(recClicks, findRateSubmits) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Lead Funnel Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Internal — last 200 leads · events from last 30 days
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Warnings */}
      {!usingServiceRole && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
          ⚠️ <strong>SUPABASE_SERVICE_ROLE_KEY</strong> tanımlı değil — anon client kullanılıyor.
          RLS nedeniyle leads/events boş görünebilir. Server <code>.env.local</code>&apos;a key&apos;i ekle.
        </div>
      )}
      {(leadsError || eventsError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
          {leadsError && <p>leads: {leadsError}</p>}
          {eventsError && <p>events: {eventsError}</p>}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Leads (last 200)', value: leads.length, icon: '🎯' },
          { label: 'Leads with email', value: leadsWithEmail, icon: '✉️' },
          { label: 'Rate alert subscribers', value: alertCount, icon: '🔔' },
          { label: 'Apply clicks (30d)', value: applyClicks, icon: '🚀' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-3xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Funnels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[
          { title: 'Browse → Apply Funnel', rows: funnel },
          { title: 'AI Find-Rate Funnel', rows: aiFunnel },
        ].map(({ title, rows }) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-extrabold text-slate-900 mb-4">{title}</h2>
            <div className="space-y-3">
              {rows.map(({ label, value, rate }, i) => {
                const max = Math.max(...rows.map((r) => r.value), 1);
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-bold text-slate-900">
                        {value}
                        {i > 0 && <span className="text-xs text-sky-600 ml-2">({rate})</span>}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${Math.max(2, (value / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Leads by product', rows: leadsByProduct },
          { title: 'Leads by country', rows: leadsByCountry },
          { title: 'Events by type (30d)', rows: countBy(events, (e) => e.event_type) },
        ].map(({ title, rows }) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-extrabold text-slate-900 mb-4 text-sm">{title}</h2>
            {rows.length === 0 ? (
              <p className="text-xs text-slate-400">No data yet</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {rows.slice(0, 8).map(([key, count]) => (
                    <tr key={key} className="border-b border-slate-50 last:border-0">
                      <td className="py-1.5 text-slate-600">{key}</td>
                      <td className="py-1.5 text-right font-bold text-slate-900">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>

      {/* D1 pilot — scraped rates */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-slate-900">Scraped Rates (D1 Pilot — LHV)</h2>
          <span className="text-xs text-slate-400">daily via VPS cron</span>
        </div>
        {scrapedRates.length === 0 ? (
          <p className="text-sm text-slate-400">
            No scraped data yet. Run <code className="bg-slate-50 px-1 rounded">deploy/scraper/schema.sql</code> in Supabase,
            then set up the cron per <code className="bg-slate-50 px-1 rounded">deploy/scraper/README.md</code>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-200">
                  <th className="py-2 pr-4">Bank</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Rate from</th>
                  <th className="py-2 pr-4">APRC</th>
                  <th className="py-2 pr-4">Scraped</th>
                  <th className="py-2">Snippet (verify)</th>
                </tr>
              </thead>
              <tbody>
                {scrapedRates.map((r) => (
                  <tr key={`${r.bank_id}-${r.product_type}`} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 pr-4 font-bold text-slate-800 uppercase">{r.bank_id}</td>
                    <td className="py-2 pr-4 text-slate-600">{r.product_type}</td>
                    <td className="py-2 pr-4 font-bold text-sky-700">{r.rate_min != null ? `${r.rate_min}%` : '—'}</td>
                    <td className="py-2 pr-4 text-slate-600">{r.aprc != null ? `${r.aprc}%` : '—'}</td>
                    <td className="py-2 pr-4 text-slate-500 whitespace-nowrap">
                      {new Date(r.scraped_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 text-xs text-slate-400 max-w-md truncate" title={r.raw_snippet ?? ''}>
                      {r.raw_snippet ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent leads table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-extrabold text-slate-900 mb-4">Recent Leads</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-slate-400">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-200">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Country</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 25).map((l) => (
                  <tr key={l.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 pr-4 text-slate-500 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 pr-4 font-medium text-slate-800">{l.email ?? '—'}</td>
                    <td className="py-2 pr-4 text-slate-600">{l.product_type ?? l.loan_type ?? '—'}</td>
                    <td className="py-2 pr-4 text-slate-600">{l.country ?? '—'}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {(l.amount ?? l.loan_amount) ? `€${(l.amount ?? l.loan_amount)!.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-2 text-slate-500 text-xs">{l.source ?? l.mode ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
