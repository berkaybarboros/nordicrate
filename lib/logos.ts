/**
 * Kurum logo çözümleyici — logolar public/logos/<domain>.webp olarak lokalde host'lu
 * (deploy/logos/fetch-logos.mjs ile indirilip sıkıştırıldı; resmi apple-touch-icon
 * → Google favicon fallback). Dosya yoksa çağıran taraf <img onError> ile monograma düşer.
 */

// Modal katalog bankaları (data/loans.ts bankId, data/insurance.ts companyId) → domain.
// INSTITUTIONS için website'tan domain türetiyoruz; bunlar yalnızca modal kataloğu için.
const BANK_DOMAIN: Record<string, string> = {
  // loans
  lhv: 'lhv.ee',
  coop: 'cooppank.ee',
  bigbank: 'bigbank.ee',
  inbank: 'inbank.ee',
  citadele: 'citadele.lv',
  luminor: 'luminor.ee',
  seb: 'seb.ee',
  swedbank: 'swedbank.ee',
  'bank-norwegian': 'banknorwegian.no',
  credit24: 'credit24.ee',
  ferratum: 'ferratum.com',
  resurs: 'resursbank.se',
  siauliu: 'sb.lt',
  // insurance
  bta: 'bta.ee',
  compensa: 'compensa.ee',
  ergo: 'ergo.ee',
  gjensidige: 'gjensidige.no',
  if: 'if.fi',
  salva: 'salva.ee',
  'lhv-insurance': 'lhv.ee',
  'swedbank-insurance': 'swedbank.ee',
};

/** INSTITUTIONS.website → local logo path (dosya yoksa onError fallback devreye girer) */
export function logoFromWebsite(website?: string): string | null {
  if (!website) return null;
  try {
    const host = new URL(website).hostname.replace(/^www\./, '');
    return `/logos/${host}.webp`;
  } catch {
    return null;
  }
}

/** Modal katalog bankId/companyId → local logo path */
export function logoFromBankId(id?: string): string | null {
  if (!id) return null;
  const domain = BANK_DOMAIN[id];
  return domain ? `/logos/${domain}.webp` : null;
}

/** Logo yüklenemezse gösterilecek 2-harfli monogram */
export function monogram(name: string): string {
  const letters = name
    .replace(/[^a-zA-ZÀ-ÿ ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return letters || '••';
}
