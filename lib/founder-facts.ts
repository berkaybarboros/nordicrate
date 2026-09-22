/**
 * lib/founder-facts.ts — basvuru ve pitch rakamlarinin tek hesaplandigi yer.
 *
 * 2026-09-18: /api/cron/applications bu rakamlari HTTP ile cekiyordu; sunucudan
 * kendi alan adimiza giden istek Cloudflare'da 403 aliyordu. Hesap artik burada,
 * iki uc da ayni fonksiyonu cagirir.
 */

import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { fetchAllRows } from '@/lib/supabase-paginate';
import { isBotSessionId } from '@/lib/security';
import { COUNTRIES, INSTITUTIONS, PRODUCTS } from '@/lib/data';
import { PROGRAMS } from '@/lib/programs-data';
import { personalLoans, mortgageLoans, carLoans } from '@/data/loans';
import { withLiveRates } from '@/lib/live-loan-offers';
import { getLiveDepositRates, getLiveLoanRates } from '@/lib/live-rates';
import { applyScrapedOverrides } from '@/lib/scraped-overrides';

interface EventRow {
  session_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
}

const DAY = 24 * 60 * 60 * 1000;

interface EventRow {
  session_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
}

function pct(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : null;
}

export async function computeFounderFacts(): Promise<Record<string, unknown>> {
  const client = createSupabaseAdmin();
  if (!client) return { error: 'SUPABASE_SERVICE_ROLE_KEY missing' };

  const now = Date.now();
  const since60 = new Date(now - 60 * DAY).toISOString();
  const since30 = new Date(now - 30 * DAY).toISOString();

  // PostgREST istek başına en fazla 1000 satır döner — ilk sürüm 3.966 olaydan
  // rastgele 1000'ini sayıp "60 günde 4 oturum" dedi. Başvuru formuna giden rakam.
  const fetchEvents = async (): Promise<EventRow[]> => {
    const { data, error } = await fetchAllRows<EventRow>((from, to) =>
      client
        .from('events')
        .select('session_id, event_type, metadata')
        .gte('created_at', since60)
        .order('id', { ascending: true })
        .range(from, to),
    );
    if (error) throw new Error(error);
    return data;
  };

  const [eventRows, leadsRes, postsRes, feedbackRes, liveLoans, liveDeposits, liveProducts, liveLoanFeeds] = await Promise.all([
    fetchEvents(),
    client.from('leads').select('id', { count: 'exact', head: true }),
    client.from('blog_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    client.from('user_feedback').select('kind, helpful').gte('created_at', since30).limit(5000),
    withLiveRates([...personalLoans, ...mortgageLoans, ...carLoans]).catch(() => []),
    getLiveDepositRates().catch(() => new Map()),
    // PRODUCTS katalogu da canli oran tasiyor (Isvec/Izlanda konut kredileri);
    // sayac 2026-09-22'ye kadar yalniz data/loans + mevduati sayiyordu
    applyScrapedOverrides(PRODUCTS).catch(() => [] as typeof PRODUCTS),
    getLiveLoanRates().catch(() => new Map()),
  ]);

  const events = eventRows.filter((e) => !isBotSessionId(e.session_id));
  const sessionsWith = (type: string) =>
    new Set(events.filter((e) => e.event_type === type).map((e) => e.session_id)).size;

  const sessions = sessionsWith('page_view');
  const reachedOffers = sessionsWith('product_view');
  const clickedToBank = sessionsWith('apply_click');
  const onboardingCompleted = sessionsWith('onboarding_complete');

  // İlk kaynak kanalı (page_view metadata.source) — oturum başına bir kez say
  const sourceBySession = new Map<string, string>();
  for (const e of events) {
    if (e.event_type !== 'page_view' || !e.session_id || sourceBySession.has(e.session_id)) continue;
    const src = typeof e.metadata?.source === 'string' ? e.metadata.source : 'unknown';
    sourceBySession.set(e.session_id, src);
  }
  const channels: Record<string, number> = {};
  for (const src of sourceBySession.values()) channels[src] = (channels[src] ?? 0) + 1;

  const residency: Record<string, number> = {};
  for (const e of events) {
    if (e.event_type !== 'onboarding_complete') continue;
    const r = typeof e.metadata?.residency === 'string' ? e.metadata.residency : 'not_answered';
    residency[r] = (residency[r] ?? 0) + 1;
  }

  const feedback = (feedbackRes.data ?? []) as { kind: string; helpful: boolean | null }[];
  const liveLoanCount = liveLoans.filter((o) => o.isLiveRate).length;
  const liveProductCount = liveProducts.filter((p) => p.isLiveRate).length;

  return {
    generatedAt: new Date(now).toISOString(),
    company: {
      name: 'NordicRate',
      url: 'https://nordicrate.com',
      founder: 'Berkay Barboros',
      contact: 'info@nordicrate.com',
      firstCommit: '2026-02-26',
      liveSince: '2026-07-04',
      revenueEur: 0,
      stage: 'live product, pre-revenue',
    },
    catalogue: {
      countries: COUNTRIES.length,
      institutions: INSTITUTIONS.length,
      products: PRODUCTS.length,
      fundingPrograms: PROGRAMS.length,
      publishedArticles: postsRes.count ?? null,
      // Tek dogru olcu: canli okunan banka x urun akisi sayisi. Katalog satirlari
      // (data/loans + PRODUCTS) ayni banka urununu iki kez sayabilir.
      liveRateFeeds: liveLoanFeeds.size + liveDeposits.size,
      liveRateLoanFeeds: liveLoanFeeds.size,
      liveRateDepositBanks: liveDeposits.size,
      liveRateOffersShown: liveLoanCount + liveProductCount,
    },
    traction60d: {
      sessions,
      sessionsReachedOffers: reachedOffers,
      sessionsClickedToBank: clickedToBank,
      reachedOffersPct: pct(reachedOffers, sessions),
      clickedToBankPct: pct(clickedToBank, sessions),
      clickThroughOfOffersPct: pct(clickedToBank, reachedOffers),
      onboardingCompleted,
      channels,
      residencyMix: residency,
    },
    leadsTotal: leadsRes.count ?? null,
    feedback30d: {
      responses: feedback.length,
      foundWhatTheyNeeded: feedback.filter((f) => f.helpful === true).length,
      didNot: feedback.filter((f) => f.helpful === false).length,
    },
  };
}
