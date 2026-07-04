/**
 * lib/affiliate.ts — Affiliate/outbound tıklama altyapısı
 *
 * Model: tüm "Apply Now / Get Quote / Open Deposit" linkleri /go gateway'inden geçer.
 * Gateway (app/go/route.ts):
 *   1. Hedef URL'yi allowlist'e karşı doğrular (open-redirect koruması)
 *   2. Tıklamayı server-side loglar (adblock-proof — client tracker'a ek güvence)
 *   3. UTM (ileride Awin deeplink) ekleyip 302 ile bankaya yönlendirir
 *
 * buildGoLink client component'larda çağrılabilir (saf string builder, ağır import yok).
 * Allowlist doğrulaması SADECE server tarafında (isAllowedApplyUrl) yapılır.
 */

// ─── Client-safe link builder ────────────────────────────────────────────────

export interface GoLinkMeta {
  /** institution / bank id (utm_content + attribution) */
  inst?: string;
  /** product id (analitik) */
  pid?: string;
  /** product/loan type (utm_campaign) */
  pt?: string;
}

/**
 * Outbound hedefi /go gateway link'ine sarar.
 * dest yoksa '#' döner (buton görünür ama tıklanınca bir şey olmaz — nadir edge case).
 */
export function buildGoLink(dest: string | undefined, meta: GoLinkMeta = {}): string {
  if (!dest) return '#';
  const p = new URLSearchParams();
  p.set('u', dest);
  if (meta.inst) p.set('i', meta.inst);
  if (meta.pid) p.set('pid', meta.pid);
  if (meta.pt) p.set('pt', meta.pt);
  return `/go?${p.toString()}`;
}

// ─── Server-side allowlist (open-redirect koruması) ──────────────────────────
// NOT: Bu import'lar data statik olduğu için server bundle'da sorunsuz.

import { INSTITUTIONS } from '@/lib/data';
import { personalLoans, mortgageLoans, carLoans } from '@/data/loans';
import {
  motorInsurance, cascoInsurance, homeInsurance,
  healthInsurance, travelInsurance, lifeInsurance, deposits,
} from '@/data/insurance';

function hostOf(u?: string): string | null {
  if (!u) return null;
  try {
    return new URL(u).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/** Yönlendirmeye izin verilen banka/kurum host'ları — data'dan bir kez türetilir. */
export const ALLOWED_APPLY_HOSTS: ReadonlySet<string> = (() => {
  const hosts = new Set<string>();
  const add = (u?: string) => { const h = hostOf(u); if (h) hosts.add(h); };

  for (const i of INSTITUTIONS) add(i.website);
  for (const arr of [personalLoans, mortgageLoans, carLoans]) {
    for (const o of arr) add(o.applyUrl);
  }
  for (const arr of [motorInsurance, cascoInsurance, homeInsurance, healthInsurance, travelInsurance, lifeInsurance]) {
    for (const o of arr) { add(o.applyUrl); add(o.websiteUrl); }
  }
  for (const d of deposits) add(d.applyUrl);

  return hosts;
})();

/** Hedef URL bilinen bir kuruma mı gidiyor? (arbitrary redirect'i engeller) */
export function isAllowedApplyUrl(dest: string): boolean {
  const h = hostOf(dest);
  return !!h && ALLOWED_APPLY_HOSTS.has(h);
}
