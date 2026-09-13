/**
 * lib/live-loan-offers.ts — data/loans.ts tekliflerine canlı oran uygular.
 *
 * 2026-09-13: /loans/personal, /loans/car, /loans/mortgage ve AI öneri/find-rate
 * uçları statik data/loans.ts'i DOĞRUDAN kullanıyordu; scraper verisi yalnızca
 * lib/data.ts PRODUCTS kataloğuna uygulanıyordu. LHV kişisel kredi sitede 7.9%
 * görünürken bankanın kendi sayfası 5.9% diyordu. Artık tüm bu tüketiciler
 * teklifleri buradan alır.
 *
 * Canlı veri yoksa teklif olduğu gibi döner ama `isLiveRate: false` ve
 * `rateCheckedAt: null` taşır — kart onu "gösterge oran" olarak etiketler.
 */

import type { LoanOffer } from '@/data/loans';
import { getLiveLoanRates } from '@/lib/live-rates';

export type LiveLoanOffer = LoanOffer & {
  /** Oranın bankanın sitesinden en son çekildiği an; canlı değilse null */
  rateCheckedAt: string | null;
  rateSourceUrl: string | null;
  isLiveRate: boolean;
};

/** data/loans tipi → scraper product_type */
const TYPE_MAP: Record<LoanOffer['type'], string | null> = {
  personal: 'personal',
  mortgage: 'mortgage',
  car: 'auto',
  business: null,
};

/** "https://www.seb.lt/..." → "seb.lt" (ülke TLD'si dahil kayıtlı alan adı) */
function registrableDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const labels = new URL(url).hostname.toLowerCase().split('.');
    return labels.slice(-2).join('.');
  } catch {
    return null;
  }
}

export async function withLiveRates(offers: LoanOffer[]): Promise<LiveLoanOffer[]> {
  let live: Awaited<ReturnType<typeof getLiveLoanRates>>;
  try {
    live = await getLiveLoanRates();
  } catch {
    live = new Map();
  }

  return offers.map((offer) => {
    const productType = TYPE_MAP[offer.type];
    const o = productType ? live.get(`${offer.bankId}:${productType}`) : undefined;

    // ÜLKE KORUMASI (2026-09-13, üretimde yakalandı): data/loans.ts'te Letonya ve
    // Litvanya teklifleri Estonya bankasıyla AYNI bankId'yi paylaşıyor ("Bigbank
    // Latvia", "SEB Bankas Lithuania", "Inbank Latvia", "Swedbank Latvia" → bankId
    // bigbank/seb/inbank/swedbank). Eşleme bankId ile yapılınca Estonya sayfasından
    // okunan oran Letonya/Litvanya ürününe basılıyordu. Aynı banka farklı ülkede
    // farklı fiyatlar; oran yalnızca teklifin kendi sitesi scraper'ın okuduğu
    // siteyle birebir aynı alan adındaysa (seb.ee = seb.ee, seb.lt ≠ seb.ee) uygulanır.
    const sameSite =
      o != null && registrableDomain(offer.applyUrl) === registrableDomain(o.sourceUrl);

    // Kaba tutarsızlık koruması: statik tavanın %50 üstü şüpheli bir parse'tır
    if (!o || !sameSite || o.rate > offer.interestRateMax * 1.5) {
      return { ...offer, rateCheckedAt: null, rateSourceUrl: null, isLiveRate: false };
    }

    // Bankanın yayınladığı "from X%" en iyi başvuran için geçerli oranı temsil eder.
    // Kart bunu "from" etiketiyle gösterir; aylık ödeme örneği de bu orandan
    // hesaplanır ve kartta "en iyi durum örneği" olarak işaretlenir (UCPD).
    return {
      ...offer,
      interestRateMin: o.rate,
      interestRateMax: Math.max(offer.interestRateMax, o.rate),
      representativeRate: o.rate,
      rateCheckedAt: o.scrapedAt,
      rateSourceUrl: o.sourceUrl,
      isLiveRate: true,
    };
  });
}
