/**
 * Katalogdaki doğrulanması gereken ürün iddiaları — hız ("Instant decision", "24h") ve
 * ücret ("No fees", tek seferlik ücret) — kaynak sayfalarıyla birlikte.
 *
 * Neden ayrı: bu iddialar kartlarda olgu gibi görünüyor ama hiçbiri bankanın sitesinde
 * kontrol edilmedi. Sunucudaki deploy/scraper/source-audit.mjs bu listeyi okuyup her
 * kaynak sayfada kanıt cümlesi arar; karar (tut / düzelt / sil) insan incelemesiyle
 * lib/data.ts ve data/loans.ts'e yansır. Liste tests/claims.test.ts ile
 * deploy/scraper/claims-to-verify.json'a senkron tutulur (UPDATE_CLAIMS=1 npm test).
 *
 * Göreli import'lar bilinçli: vitest ve ileride node --experimental-strip-types aynı
 * dosyayı yol takma adı (@/) olmadan yükleyebilsin.
 */

import { PRODUCTS, INSTITUTIONS } from './data';
import { personalLoans, mortgageLoans, carLoans } from '../data/loans';

export type ClaimKind = 'speed' | 'fee';

export interface VerifiableClaim {
  /** Kararlı anahtar: rapor ve inceleme notları bununla eşleşir */
  id: string;
  productId: string;
  institution: string;
  kind: ClaimKind;
  /** İddianın verideki yeri */
  field: 'feature' | 'processingTime' | 'fee';
  /** Kullanıcının gördüğü metin */
  text: string;
  /** Kanıtın aranacağı sayfa — başvuru linki ya da kurumun sitesi */
  sourceUrl: string | null;
}

const SPEED = /\b(instant|immediate|same[- ]day|24 ?h|minutes?|quick|fast|rapid|express)\b/i;
const FEE = /\b(no fees?|free|without (?:a )?fee|zero fee|0 ?€|€ ?0)\b/i;

function kindOf(text: string): ClaimKind | null {
  if (FEE.test(text)) return 'fee';
  if (SPEED.test(text)) return 'speed';
  return null;
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function collectClaims(): VerifiableClaim[] {
  const claims: VerifiableClaim[] = [];
  const seen = new Set<string>();
  const push = (c: VerifiableClaim) => {
    if (seen.has(c.id)) return;
    seen.add(c.id);
    claims.push(c);
  };

  // data/loans.ts — Estonya ağırlıklı canlı katalog: başvuru linki doğrudan kaynak
  for (const loan of [...personalLoans, ...mortgageLoans, ...carLoans]) {
    const base = { productId: loan.id, institution: loan.bankName, sourceUrl: loan.applyUrl || null };
    push({
      ...base,
      id: `${loan.id}:processingTime`,
      kind: 'speed',
      field: 'processingTime',
      text: loan.processingTime,
    });
    push({
      ...base,
      id: `${loan.id}:fee`,
      kind: 'fee',
      field: 'fee',
      text:
        loan.feePercent > 0
          ? `One-time fee ${loan.feePercent}%${loan.fee > 0 ? ` (min €${loan.fee})` : ''}`
          : loan.fee > 0
            ? `One-time fee €${loan.fee}`
            : 'No one-time fee',
    });
    for (const f of loan.features) {
      const kind = kindOf(f);
      if (kind) push({ ...base, id: `${loan.id}:feature:${slug(f)}`, kind, field: 'feature', text: f });
    }
  }

  // lib/data.ts — 8 ülkelik katalog: kaynak kurumun sitesi (ürün sayfası yok)
  for (const p of PRODUCTS) {
    const inst = INSTITUTIONS.find((i) => i.id === p.institutionId);
    const base = { productId: p.id, institution: inst?.name ?? p.institutionId, sourceUrl: inst?.website ?? null };
    for (const f of p.features) {
      const kind = kindOf(f);
      if (kind) push({ ...base, id: `${p.id}:feature:${slug(f)}`, kind, field: 'feature', text: f });
    }
  }

  return claims.sort((a, b) => a.id.localeCompare(b.id));
}
