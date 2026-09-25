/**
 * lib/live-rates.ts — Bankaların sitesinden günlük çekilen oranların TEK okuma noktası.
 *
 * Kaynak: deploy/scraper/scrape-rates.mjs (cron, her gün 06:30)
 *   kredi   → scraped_rates         / latest_scraped_rates view
 *   mevduat → scraped_deposit_rates / latest_deposit_rates view
 *
 * Neden tek modül (2026-09-13): canlı veri yalnızca PRODUCTS kataloğuna
 * uygulanıyordu; /loans/personal|car|mortgage sayfaları, AI öneri ve find-rate
 * uçları ayrı statik data/loans.ts'i, mevduat sayfası da statik data/insurance.ts'i
 * kullanıyordu. Sonuç: LHV kişisel kredi sitede 7.9% (banka 5.9%), mevduat
 * oranları gerçeğin ~2 katı. Artık her tüketici buradan okur.
 *
 * Tazelik politikası (UI ile ortak):
 *   ≤ 48 saat  → "fresh"  : yeşil, "Checked 3h ago"
 *   ≤ 7 gün    → "aging"  : amber, "Checked 4 days ago" (scraper bir-iki gün aksadı)
 *   > 7 gün    → kullanılmaz; kart statik göstergeye düşer ve öyle etiketlenir
 * Bayat bir oranı sessizce "canlı" diye göstermek, hiç göstermemekten kötüdür.
 */

// supabase-js YERİNE düz PostgREST fetch: Next Data Cache'i `next.revalidate` ile
// kontrol edebilmek için. 900sn: sayfa ISR'ından kısa, günlük scrape'ten çok kısa.
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const FRESH_MS = 48 * 60 * 60 * 1000;
export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

async function pgRest<T>(pathAndQuery: string): Promise<T | null> {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const res = await fetch(`${SB_URL}/rest/v1/${pathAndQuery}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function withinMaxAge(iso: string): boolean {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && Date.now() - t <= MAX_AGE_MS;
}

/* ─────────────────────────── KREDİ ─────────────────────────── */

/** scraper bank_id → PRODUCTS kurum id'si */
export const BANK_TO_INSTITUTION: Record<string, string> = {
  lhv: 'lhv-ee',
  coop: 'coop-ee',
  seb: 'seb-ee',
  swedbank: 'swedbank-ee',
  inbank: 'inbank-ee',
  bigbank: 'bigbank-ee',
  citadele: 'citadele-lv',
  'citadele-ee': 'citadele-ee',
  'swedbank-lv': 'swedbank-lv',
  // Isvec konut kredisi (2026-09-22): bankanin kendi "listranta" tablosundan.
  // bank_id = institution id — Estonya Swedbank'i ('swedbank') ile karismasin.
  'sbab-se': 'sbab-se',
  'nordea-se': 'nordea-se',
  'swedbank-se': 'swedbank-se',
  'lansforsakringar-se': 'lansforsakringar-se',
  'skandia-se': 'skandia-se',
  // Izlanda: bankalarin PDF faiz tablosundan ENDEKSSIZ (overdtryggd) sabit oran
  'landsbankinn-is': 'landsbankinn-is',
  'islandsbanki-is': 'islandsbanki-is',
};

/**
 * Banka bazlı güvenilir ürün tipleri — sayfa doğrulamalarıyla belirlendi.
 * Swedbank mortgage: oran
 * yayınlanmıyor. Inbank small-home-loan mortgage değil. Citadele LV auto:
 * sayfada yalnızca fee'li örnek oran.
 */
export const ALLOWED_TYPES_BY_BANK: Record<string, Set<string>> = {
  lhv: new Set(['personal', 'mortgage', 'auto']),
  coop: new Set(['personal', 'mortgage', 'auto']),
  seb: new Set(['personal', 'mortgage', 'auto']),
  swedbank: new Set(['personal', 'auto']),
  inbank: new Set(['personal', 'auto']),
  bigbank: new Set(['personal', 'auto', 'mortgage']),
  citadele: new Set(['personal', 'mortgage']),
  'citadele-ee': new Set(['personal', 'auto', 'mortgage']),
  'swedbank-lv': new Set(['personal']),
  // SE: yalnizca konut kredisi — bu bankalarin tuketici kredisi oranlari
  // ayni sayfada yayinlanmiyor, kredi karti/blanco oranini yanlislikla almayalim.
  'sbab-se': new Set(['mortgage']),
  'nordea-se': new Set(['mortgage']),
  'swedbank-se': new Set(['mortgage']),
  'lansforsakringar-se': new Set(['mortgage']),
  'skandia-se': new Set(['mortgage']),
  'landsbankinn-is': new Set(['mortgage']),
  'islandsbanki-is': new Set(['mortgage']),
};

export interface LiveLoanRate {
  /** Kullanıcıya gösterilecek taban oran (marjlı ürünlerde marj + canlı Euribor 6M) */
  rate: number;
  scrapedAt: string;
  sourceUrl: string | null;
}

interface ScrapedLoanRow {
  bank_id: string;
  product_type: string;
  rate_min: number | string | null;
  raw_snippet: string | null;
  source_url: string | null;
  scraped_at: string;
}

/** Anahtar: `${bank_id}:${product_type}` (product_type: personal | mortgage | auto) */
export async function getLiveLoanRates(): Promise<Map<string, LiveLoanRate>> {
  const out = new Map<string, LiveLoanRate>();
  const rows = await pgRest<ScrapedLoanRow[]>(
    'latest_scraped_rates?select=bank_id,product_type,rate_min,raw_snippet,source_url,scraped_at'
  );
  if (!rows?.length) return out;

  // Marj tabanlı oranlar için canlı EURIBOR 6M (rate_snapshots — kendi cron'umuz besliyor)
  let euribor6m: number | null = null;
  if (rows.some((r) => /euribor/i.test(r.raw_snippet ?? ''))) {
    const snap = await pgRest<Array<{ rate: number | string }>>(
      'rate_snapshots?select=rate&key=eq.euribor6m&order=fetched_at.desc&limit=1'
    );
    const v = snap?.[0]?.rate;
    euribor6m = v != null ? Number(v) : null;
    if (euribor6m != null && !Number.isFinite(euribor6m)) euribor6m = null;
  }

  for (const r of rows) {
    if (!ALLOWED_TYPES_BY_BANK[r.bank_id]?.has(r.product_type)) continue;
    if (!withinMaxAge(r.scraped_at)) continue;

    let rate = r.rate_min != null ? Number(r.rate_min) : NaN;
    if (!Number.isFinite(rate)) continue;

    // Marj + Euribor → gerçek taban oran. Canlı Euribor yoksa marjı APR gibi basma (UCPD)
    if (/euribor/i.test(r.raw_snippet ?? '')) {
      if (euribor6m == null) continue;
      rate = Math.round((rate + euribor6m) * 100) / 100;
    }
    if (rate < 0.5 || rate > 35) continue;

    out.set(`${r.bank_id}:${r.product_type}`, {
      rate,
      scrapedAt: r.scraped_at,
      sourceUrl: r.source_url,
    });
  }
  return out;
}

/* ─────────────────────────── MEVDUAT ─────────────────────────── */

export interface LiveDepositRate {
  /** vade (ay) → yıllık oran % */
  rates: Record<number, number>;
  minAmount: number | null;
  scrapedAt: string;
  sourceUrl: string;
}

interface ScrapedDepositRow {
  bank_id: string;
  rates: Record<string, number | string> | null;
  min_amount: number | string | null;
  source_url: string;
  scraped_at: string;
}

/** Anahtar: scraper bank_id (lhv, coop, seb, inbank, swedbank, citadele-ee) */
export async function getLiveDepositRates(): Promise<Map<string, LiveDepositRate>> {
  const out = new Map<string, LiveDepositRate>();
  const rows = await pgRest<ScrapedDepositRow[]>(
    'latest_deposit_rates?select=bank_id,rates,min_amount,source_url,scraped_at'
  );
  if (!rows?.length) return out;

  for (const r of rows) {
    if (!withinMaxAge(r.scraped_at) || !r.rates) continue;
    const rates: Record<number, number> = {};
    for (const [term, value] of Object.entries(r.rates)) {
      const t = Number(term);
      const v = Number(value);
      // Scraper bandıyla aynı sınır — bozuk bir kayıt kartta anlamsız oran basmasın
      if (Number.isInteger(t) && t > 0 && Number.isFinite(v) && v >= 0.5 && v <= 6) rates[t] = v;
    }
    if (Object.keys(rates).length === 0) continue;
    out.set(r.bank_id, {
      rates,
      minAmount: r.min_amount != null && Number.isFinite(Number(r.min_amount)) ? Number(r.min_amount) : null,
      scrapedAt: r.scraped_at,
      sourceUrl: r.source_url,
    });
  }
  return out;
}
