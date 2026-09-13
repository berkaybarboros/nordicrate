/**
 * Scraper override katmanı — PRODUCTS kataloğu (lib/data.ts) için.
 * Statik oranları, bankaların sitesinden günlük scrape edilen DOĞRULANMIŞ
 * oranlarla runtime'da günceller. Okuma mantığı lib/live-rates.ts'te (tek kaynak).
 *
 * Dürüstlük kuralları:
 * - Yalnızca parse_ok + ≤7 gün veri (live-rates.ts). Kart tazeliği ayrıca gösterir.
 * - Marj tabanlı ürünlerde marj + canlı Euribor 6M toplanır (live-rates.ts).
 * - Statik data.ts'e ASLA yazılmaz (CLAUDE.md kuralı) — runtime kopya üretilir.
 *
 * NOT: cookie'siz PostgREST fetch — ISR/SSG sayfalarda cookies() çağrısı
 * static-to-dynamic 500'üne yol açar (blog'da yaşandı).
 */

import type { LoanProduct } from '@/lib/types';
import { getLiveLoanRates, BANK_TO_INSTITUTION } from '@/lib/live-rates';

const INSTITUTION_TO_BANK: Record<string, string> = Object.fromEntries(
  Object.entries(BANK_TO_INSTITUTION).map(([bank, inst]) => [inst, bank])
);

export async function applyScrapedOverrides(products: LoanProduct[]): Promise<LoanProduct[]> {
  try {
    const live = await getLiveLoanRates();
    if (live.size === 0) return products;

    return products.map((p) => {
      const bank = INSTITUTION_TO_BANK[p.institutionId];
      if (!bank) return p;
      const o = live.get(`${bank}:${p.type}`);
      if (!o) return p;
      // Kaba tutarsızlık koruması: scrape statik banttan %50+ yüksekse veri şüpheli
      if (o.rate > p.rateMax * 1.5) return p;
      return {
        ...p,
        rateMin: o.rate,
        rateMax: Math.max(p.rateMax, o.rate), // 'up to' tutarlılığı
        updatedAt: o.scrapedAt,
        isLiveRate: true,
        rateSourceUrl: o.sourceUrl ?? undefined,
      };
    });
  } catch {
    return products; // veri katmanı asla sayfayı düşürmez
  }
}
