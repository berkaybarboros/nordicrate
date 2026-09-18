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
import { fetchAllRows } from '@/lib/supabase-paginate';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { isBotSessionId } from '@/lib/security';
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
  /** Bot ayrimi icin: /go gateway sid gelmediginde 'go-<ts>' uretiyordu */
  session_id: string | null;
  /** 2026-09-13'ten beri trafik kaynagi burada: { source, origin, campaign } */
  metadata: { source?: string; origin?: string; campaign?: string } | null;
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

interface ApplicationRow {
  program: string;
  organisation: string | null;
  url: string | null;
  offer: string | null;
  deadline: string | null;
  deadline_note: string | null;
  fit: string;
  fit_reason: string | null;
  status: string;
  priority: number | null;
  draft_doc_url: string | null;
}

interface FeedbackRow {
  created_at: string;
  page: string;
  kind: string;
  helpful: boolean | null;
  message: string | null;
  email: string | null;
  source: string | null;
}

interface DepositRateRow {
  bank_id: string;
  rates: Record<string, number> | null;
  min_amount: number | null;
  scraped_at: string;
}

interface FailedAttemptRow {
  bank_id: string;
  product_type?: string;
  scraped_at: string;
}

interface OnboardingStepRow {
  session_id: string | null;
  metadata: { step?: number } | null;
}

const EMPTY_DATA = {
  usingServiceRole: false,
  leads: [] as LeadRow[],
  leadsError: 'Data load timed out — Supabase unreachable?' as string | null,
  events: [] as EventRow[],
  eventsError: null as string | null,
  alertCount: 0,
  scrapedRates: [] as ScrapedRateRow[],
  depositRates: [] as DepositRateRow[],
  feedback: [] as FeedbackRow[],
  applications: [] as ApplicationRow[],
  failedAttempts: [] as FailedAttemptRow[],
  onboardingSteps: [] as OnboardingStepRow[],
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

  const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const [leadsRes, eventsRes, alertsRes, scrapedRes, onbRes, depRes, loanFailRes, depFailRes, fbRes, appsRes] = await Promise.all([
    client
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
    // PostgREST 1000 satirda kirpar — .limit(2000) funnel'i eksik sayiyordu (2026-09-15)
    fetchAllRows<EventRow>((from, to) =>
      client
        .from('events')
        .select('event_type, page, product_type, created_at, session_id, metadata')
        .gte('created_at', since30d)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to),
    ),
    client.from('rate_alerts').select('id', { count: 'exact', head: true }),
    // D1 pilot — tablo henüz yoksa sessizce boş döner
    client
      .from('latest_scraped_rates')
      .select('bank_id, product_type, rate_min, aprc, raw_snippet, scraped_at')
      .order('bank_id'),
    // Onboarding funnel — adım event'leri (dedup dashboard'da session bazlı yapılır)
    fetchAllRows<OnboardingStepRow>((from, to) =>
      client
        .from('events')
        .select('session_id, metadata')
        .eq('event_type', 'onboarding_step')
        .gte('created_at', since30d)
        .order('id', { ascending: true })
        .range(from, to),
    ),
    // Rate feed health: mevduat (2026-09-13'ten beri scrape ediliyor)
    client
      .from('latest_deposit_rates')
      .select('bank_id, rates, min_amount, scraped_at')
      .order('bank_id'),
    // Son 48 saatteki BASARISIZ denemeler: son basarili veri eski mi yoksa bugun de
    // denenip kirildi mi (sayfa degisti mi, erisim mi) ayirt etmek icin
    client
      .from('scraped_rates')
      .select('bank_id, product_type, scraped_at')
      .eq('parse_ok', false)
      .gte('scraped_at', since48h),
    client
      .from('scraped_deposit_rates')
      .select('bank_id, scraped_at')
      .eq('parse_ok', false)
      .gte('scraped_at', since48h),
    // Kullanıcı geri bildirimi (PageFeedback + onboarding sonuç ekranı)
    client
      .from('user_feedback')
      .select('created_at, page, kind, helpful, message, email, source')
      .gte('created_at', since30d)
      .order('created_at', { ascending: false })
      .limit(200),
    // Hizlandirici/yatirimci basvurulari — tablo yoksa sessizce bos doner
    client
      .from('startup_applications')
      .select('program, organisation, url, offer, deadline, deadline_note, fit, fit_reason, status, priority, draft_doc_url')
      .order('priority', { ascending: true })
      .limit(100),
  ]);

  return {
    usingServiceRole,
    leads: (leadsRes.data ?? []) as LeadRow[],
    leadsError: leadsRes.error?.message ?? null,
    events: eventsRes.data,
    eventsError: eventsRes.error,
    alertCount: alertsRes.count ?? 0,
    scrapedRates: (scrapedRes.data ?? []) as ScrapedRateRow[],
    depositRates: (depRes.data ?? []) as DepositRateRow[],
    feedback: (fbRes.data ?? []) as FeedbackRow[],
    applications: (appsRes.data ?? []) as ApplicationRow[],
    failedAttempts: [
      ...((loanFailRes.data ?? []) as FailedAttemptRow[]),
      ...((depFailRes.data ?? []) as FailedAttemptRow[]).map((r) => ({ ...r, product_type: 'deposit' })),
    ],
    onboardingSteps: onbRes.data,
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

  const { usingServiceRole, leads, leadsError, events, eventsError, alertCount, scrapedRates, depositRates, failedAttempts, onboardingSteps, feedback, applications } = await loadData();
  const appsOpen = applications
    .filter((a) => a.status !== 'skipped' && a.fit !== 'not_eligible')
    .sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    });
  const fbYes = feedback.filter((f) => f.helpful === true).length;
  const fbNo = feedback.filter((f) => f.helpful === false).length;
  const fbMessages = feedback.filter((f) => f.message);

  // Rate feed health: esikler lib/live-rates.ts ile ayni (48 saat taze, 7 gun ust sinir).
  // Scraper kendi kendine calisir; bu panel "sessizce bozuldu mu" sorusunu cevaplar.
  const nowMs = Date.now();
  const feedStatus = (iso: string) => {
    const age = nowMs - new Date(iso).getTime();
    return age <= 48 * 3600000 ? 'fresh' : age <= 7 * 86400000 ? 'aging' : 'stale';
  };
  const failedKeys = new Set(failedAttempts.map((f) => `${f.bank_id}:${f.product_type}`));
  const feedRows = [
    ...scrapedRates.map((r) => ({
      key: `${r.bank_id}:${r.product_type}`,
      bank: r.bank_id,
      product: r.product_type,
      value: r.rate_min != null ? `${r.rate_min}%` : '-',
      detail: r.raw_snippet ?? '',
      at: r.scraped_at,
    })),
    ...depositRates.map((r) => ({
      key: `${r.bank_id}:deposit`,
      bank: r.bank_id,
      product: 'deposit',
      value: r.rates?.['12'] != null ? `${r.rates['12']}% (12m)` : '-',
      detail: r.rates ? Object.entries(r.rates).map(([t, v]) => `${t}m ${v}%`).join(' / ') : '',
      at: r.scraped_at,
    })),
  ].sort((a, b) => a.bank.localeCompare(b.bank) || a.product.localeCompare(b.product));
  const feedProblems = feedRows.filter((r) => feedStatus(r.at) !== 'fresh' || failedKeys.has(r.key)).length;

  const eventCounts = new Map(countBy(events, (e) => e.event_type));
  const pageViews = eventCounts.get('page_view') ?? 0;
  const productViews = eventCounts.get('product_view') ?? 0;
  // 2026-08-31: apply_click kayitlarinin tamami crawler'di ve funnel gercek disi
  // bir oran gosteriyordu. Yeni bot tiklamalari artik hic loglanmiyor (/go route);
  // burasi GECMIS kayitlari ayirir, boylece tarihsel funnel da durust kalir.
  const applyClickRows = events.filter((e) => e.event_type === 'apply_click');
  const applyClicks = applyClickRows.filter((e) => !isBotSessionId(e.session_id)).length;
  const applyClicksBot = applyClickRows.length - applyClicks;

  // 2026-09-13: Trafik kaynagi eklendi. Oncesinde bir ziyaretcinin Google'dan mi
  // dogrudan mi geldigini bilmiyorduk, dolayisiyla SEO ve dagitim calismasinin
  // karsiligini olcemiyorduk. Oturum bazinda sayilir (event bazinda degil) —
  // cok sayfa gezen bir ziyaretci kanali sismesin.
  const humanEvents = events.filter((e) => !isBotSessionId(e.session_id));
  const sessionSource = new Map<string, { source: string; origin: string }>();
  for (const e of humanEvents) {
    if (!e.session_id || sessionSource.has(e.session_id)) continue;
    const m = e.metadata;
    if (m?.source) sessionSource.set(e.session_id, { source: m.source, origin: m.origin ?? '-' });
  }
  const sourceBreakdown = countBy(Array.from(sessionSource.values()), (v) => v.source);
  const originBreakdown = countBy(
    Array.from(sessionSource.values()).filter((v) => v.source !== 'direct'),
    (v) => v.origin
  ).slice(0, 8);
  const attributedSessions = sessionSource.size;
  const totalSessions = new Set(humanEvents.map((e) => e.session_id).filter(Boolean)).size;
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
    ...(applyClicksBot > 0
      ? [{ label: '↳ bot taramasi (haric tutuldu)', value: applyClicksBot, rate: '—' }]
      : []),
  ];

  const aiFunnel = [
    { label: 'Find-rate modal opened', value: findRateOpens, rate: '—' },
    { label: 'Form submitted (lead)', value: findRateSubmits, rate: pct(findRateSubmits, findRateOpens) },
    { label: 'Recommendation clicked', value: recClicks, rate: pct(recClicks, findRateSubmits) },
  ];

  // Onboarding funnel: session başına ulaşılan en yüksek adım (Back/tekrarlar elenir),
  // her satır = o adıma ULAŞAN session sayısı (kümülatif ≥ step)
  const maxStepBySession = new Map<string, number>();
  for (const row of onboardingSteps) {
    const step = row.metadata?.step;
    if (!row.session_id || typeof step !== 'number') continue;
    maxStepBySession.set(row.session_id, Math.max(maxStepBySession.get(row.session_id) ?? 0, step));
  }
  const maxSteps = Array.from(maxStepBySession.values());
  const reached = (n: number) => maxSteps.filter((s) => s >= n).length;
  const onboardingFunnel = [
    { label: 'Step 1 — Loan type', value: reached(1), rate: '—' },
    { label: 'Step 2 — Country', value: reached(2), rate: pct(reached(2), reached(1)) },
    { label: 'Step 3 — Amount', value: reached(3), rate: pct(reached(3), reached(2)) },
    { label: 'Step 4 — Income', value: reached(4), rate: pct(reached(4), reached(3)) },
    { label: 'Completed → Your matches', value: reached(5), rate: pct(reached(5), reached(4)) },
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

      {/* Trafik kaynagi — 2026-09-13'te eklendi. Oncesinde organik/dogrudan
          ayrimi yapilamiyordu, dolayisiyla SEO calismasinin karsiligi olculemiyordu.
          Oturum bazinda sayilir; kaynak yalnizca oturumun ILK sayfasindan alinir. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-extrabold text-slate-900 mb-1">Traffic Source (30d)</h2>
          <p className="text-xs text-slate-500 mb-4">
            {attributedSessions} / {totalSessions} oturum etiketli
            {attributedSessions < totalSessions && ' — etiketsizler 13 Eyl öncesinden'}
          </p>
          {sourceBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400">Henüz kaynak verisi yok.</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map(([src, n]) => {
                const max = Math.max(...sourceBreakdown.map(([, v]) => v), 1);
                return (
                  <div key={src}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 capitalize">{src}</span>
                      <span className="font-bold text-slate-900">
                        {n}
                        <span className="text-xs text-sky-600 ml-2">
                          ({pct(n, attributedSessions)})
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${src === 'organic' ? 'bg-emerald-500' : src === 'social' ? 'bg-violet-500' : 'bg-sky-500'}`}
                        style={{ width: `${Math.max(2, (n / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-extrabold text-slate-900 mb-1">Top Referrers (30d)</h2>
          <p className="text-xs text-slate-500 mb-4">Doğrudan trafik hariç</p>
          {originBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400">Henüz yönlendiren yok.</p>
          ) : (
            <ul className="space-y-2">
              {originBreakdown.map(([origin, n]) => (
                <li key={origin} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 truncate">{origin}</span>
                  <span className="font-bold text-slate-900">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Funnels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[
          { title: 'Browse → Apply Funnel', rows: funnel },
          { title: 'AI Find-Rate Funnel', rows: aiFunnel },
          { title: 'Onboarding Funnel (sessions, 30d)', rows: onboardingFunnel },
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

      {/* Startup/investor basvurulari (2026-09-16). Kaynak: startup_applications.
          Amac: son tarihi kacirmamak ve hangi basvurunun hangi asamada oldugunu
          tek yerde gormek. Gonderim her zaman insan onayli. */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-extrabold text-slate-900">Startup Applications</h2>
          <span className="text-xs text-slate-500">
            {appsOpen.length} live · {applications.length} tracked
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Skipped and not-eligible programmes are hidden. Deadlines shown in days from today.
        </p>
        {appsOpen.length === 0 ? (
          <p className="text-sm text-slate-400">No live applications tracked.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-200">
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Programme</th>
                  <th className="py-2 pr-4">What you get</th>
                  <th className="py-2 pr-4">Fit</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Draft</th>
                </tr>
              </thead>
              <tbody>
                {appsOpen.map((a) => {
                  const days = a.deadline
                    ? Math.ceil((new Date(a.deadline).getTime() - nowMs) / 86400000)
                    : null;
                  const urgent = days != null && days <= 10;
                  return (
                    <tr key={a.program} className="border-b border-slate-50 last:border-0 align-top">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {days == null ? (
                          <span className="text-xs text-slate-500">{a.deadline_note ?? 'rolling'}</span>
                        ) : (
                          <span className={`text-xs font-bold ${urgent ? 'text-red-600' : 'text-slate-700'}`}>
                            {days < 0 ? 'passed' : `${days} days`}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 font-semibold text-slate-800">
                        {a.url ? (
                          <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{a.program}</a>
                        ) : a.program}
                        <span className="block text-xs font-normal text-slate-400">{a.organisation}</span>
                      </td>
                      <td className="py-2 pr-4 text-slate-600 max-w-xs">{a.offer}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          a.fit === 'strong' ? 'bg-emerald-100 text-emerald-700'
                          : a.fit === 'possible' ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-600'}`}>{a.fit}</span>
                      </td>
                      <td className="py-2 pr-4 text-slate-600">{a.status.replace(/_/g, ' ')}</td>
                      <td className="py-2">
                        {a.draft_doc_url ? (
                          <a href={a.draft_doc_url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline text-xs">open</a>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User feedback (2026-09-15) — sayfa mikro-anketi + onboarding sonuçları */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-extrabold text-slate-900">User Feedback · 30d</h2>
          <span className="text-xs text-slate-500">
            <strong className="text-emerald-700">{fbYes}</strong> found it · <strong className="text-amber-700">{fbNo}</strong> didn&apos;t · {fbMessages.length} messages
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Every &quot;No&quot; with a message is a roadmap item. Reply to those that left an email.</p>
        {fbMessages.length === 0 ? (
          <p className="text-sm text-slate-400">No written feedback yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-200">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Page</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Message</th>
                  <th className="py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {fbMessages.slice(0, 50).map((f) => (
                  <tr key={f.created_at + f.page} className="border-b border-slate-50 last:border-0 align-top">
                    <td className="py-2 pr-4 text-slate-500 whitespace-nowrap">
                      {new Date(f.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-2 pr-4 text-slate-700 whitespace-nowrap">{f.page}</td>
                    <td className="py-2 pr-4 text-slate-500">{f.source ?? '-'}</td>
                    <td className="py-2 pr-4 text-slate-800 max-w-md">{f.message}</td>
                    <td className="py-2 text-slate-500">{f.email ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rate feed health (2026-09-13). Eski "D1 Pilot - LHV" tablosunun yerine:
          kredi + mevduat, banka bazinda son basarili okuma ve son 48 saatteki
          basarisiz deneme. Amber/kirmizi satir = sitede o banka eskiyor ya da
          "indicative"e dusuyor. */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-extrabold text-slate-900">Rate Feed Health</h2>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${feedProblems === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
            {feedProblems === 0 ? 'All feeds fresh' : `${feedProblems} need attention`}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Daily VPS cron 06:30 · fresh up to 48h · aging up to 7d (still shown, amber) · stale beyond 7d (hidden on site)
        </p>
        {feedRows.length === 0 ? (
          <p className="text-sm text-slate-400">
            No scraped data yet. Check the cron and <code className="bg-slate-50 px-1 rounded">/var/log/nordicrate-scraper.log</code>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-200">
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Bank</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Rate</th>
                  <th className="py-2 pr-4">Last success</th>
                  <th className="py-2">Parsed (verify)</th>
                </tr>
              </thead>
              <tbody>
                {feedRows.map((r) => {
                  const st = feedStatus(r.at);
                  const failed = failedKeys.has(r.key);
                  return (
                    <tr key={r.key} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${st === 'fresh' ? 'bg-emerald-500' : st === 'aging' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-slate-600">{st}</span>
                        {failed && <span className="ml-1.5 text-[10px] font-bold text-red-600">last run failed</span>}
                      </td>
                      <td className="py-2 pr-4 font-bold text-slate-800 uppercase">{r.bank}</td>
                      <td className="py-2 pr-4 text-slate-600">{r.product}</td>
                      <td className="py-2 pr-4 font-bold text-sky-700 whitespace-nowrap">{r.value}</td>
                      <td className="py-2 pr-4 text-slate-500 whitespace-nowrap">
                        {new Date(r.at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 text-xs text-slate-400 max-w-md truncate" title={r.detail}>
                        {r.detail || '-'}
                      </td>
                    </tr>
                  );
                })}
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
