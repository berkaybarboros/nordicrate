/**
 * Scraper override katmanı (task #15) — statik data.ts oranlarını, bankaların
 * sitesinden günlük scrape edilen DOĞRULANMIŞ oranlarla runtime'da günceller.
 *
 * Dürüstlük kuralları:
 * - Sadece parse_ok + son 48 saat içindeki veriler kullanılır (latest_scraped_rates view'ı zaten parse_ok filtreli)
 * - Sadece güvenilirliği kanıtlanmış ürün tipleri (personal, mortgage) — auto hariç
 *   (LHV auto'da public oran yok; nadir "başarılı" parse'lar yanlış pozitif)
 * - Snippet "Euribor" içeriyorsa oran MARJ demektir → canlı EURIBOR 6M ile toplanır,
 *   yoksa 1.49% marjı "APR from" gibi göstermek yanıltıcı olur (UCPD)
 * - Statik data.ts'e ASLA yazılmaz (CLAUDE.md kuralı) — bu katman runtime'da kopya üretir
 *
 * NOT: cookie'siz supabase client kullanılıyor — ISR/SSG sayfalarda cookies() çağrısı
 * static-to-dynamic 500'üne yol açar (blog'da yaşandı).
 */

import { supabase } from '@/lib/supabase';
import type { LoanProduct } from '@/lib/types';

const BANK_TO_INSTITUTION: Record<string, string> = {
  lhv: 'lhv-ee',
  coop: 'coop-ee',
};

// Banka bazlı güvenilir tipler — LHV auto public oran yayınlamıyor (yanlış-pozitif
// riski), Coop ise 3 tipte de açık oran veriyor (2026-07-17 sayfa doğrulaması)
const ALLOWED_TYPES_BY_BANK: Record<string, Set<string>> = {
  lhv: new Set(['personal', 'mortgage']),
  coop: new Set(['personal', 'mortgage', 'auto']),
};
const FRESHNESS_MS = 48 * 60 * 60 * 1000;

interface ScrapedRow {
  bank_id: string;
  product_type: string;
  rate_min: number | null;
  raw_snippet: string | null;
  scraped_at: string;
}

export async function applyScrapedOverrides(products: LoanProduct[]): Promise<LoanProduct[]> {
  try {
    const { data, error } = await supabase
      .from('latest_scraped_rates')
      .select('bank_id, product_type, rate_min, raw_snippet, scraped_at');
    if (error || !data || data.length === 0) return products;

    const rows = data as ScrapedRow[];

    // Marj tabanlı oranlar için canlı EURIBOR 6M (rate_snapshots — kendi cron'umuz besliyor)
    let euribor6m: number | null = null;
    if (rows.some((r) => /euribor/i.test(r.raw_snippet ?? ''))) {
      const { data: snap } = await supabase
        .from('rate_snapshots')
        .select('rate')
        .eq('key', 'euribor6m')
        .order('fetched_at', { ascending: false })
        .limit(1);
      const v = snap?.[0]?.rate;
      euribor6m = typeof v === 'number' ? v : v != null ? Number(v) : null;
      if (euribor6m != null && !Number.isFinite(euribor6m)) euribor6m = null;
    }

    const overrides = new Map<string, { rate: number; at: string }>();
    for (const r of rows) {
      if (!ALLOWED_TYPES_BY_BANK[r.bank_id]?.has(r.product_type)) continue;
      if (Date.now() - new Date(r.scraped_at).getTime() > FRESHNESS_MS) continue;
      const instId = BANK_TO_INSTITUTION[r.bank_id];
      if (!instId) continue;

      let rate = r.rate_min != null ? Number(r.rate_min) : NaN;
      if (!Number.isFinite(rate)) continue;

      // Marj + Euribor → gerçek taban oran
      if (/euribor/i.test(r.raw_snippet ?? '')) {
        if (euribor6m == null) continue; // canlı Euribor yoksa yanıltıcı marjı basma
        rate = Math.round((rate + euribor6m) * 100) / 100;
      }

      if (rate < 0.5 || rate > 35) continue;
      overrides.set(`${instId}:${r.product_type}`, { rate, at: r.scraped_at });
    }

    if (overrides.size === 0) return products;

    return products.map((p) => {
      const o = overrides.get(`${p.institutionId}:${p.type}`);
      if (!o) return p;
      // Kaba tutarsızlık koruması: scrape statik banttan %50+ yüksekse veri şüpheli
      if (o.rate > p.rateMax * 1.5) return p;
      return {
        ...p,
        rateMin: o.rate,
        rateMax: Math.max(p.rateMax, o.rate), // 'up to' tutarlılığı
        updatedAt: o.at,
        isLiveRate: true,
      };
    });
  } catch {
    return products; // veri katmanı asla sayfayı düşürmez
  }
}
