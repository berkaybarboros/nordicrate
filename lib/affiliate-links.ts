/**
 * lib/affiliate-links.ts — onaylanan affiliate programlarının takip linkleri.
 *
 * 2026-09-18: Awin (publisher 2992735) ve Adtraction hesapları Temmuz'da onaylandı;
 * kazanç için eksik olan tek şey, ağ içinde onaylanan HER program için takip linkini
 * çıkış linklerine bağlamak. Bunu kod yerine `affiliate_links` tablosundan yönetiyoruz:
 * program onaylanınca tek satır eklenir, deploy gerekmez, tüm site o bankaya kazanan
 * linkle çıkar. Eşleşme yoksa link olduğu gibi (UTM'li) gider — gelir yok ama akış bozulmaz.
 *
 * Şablon yer tutucuları:
 *   {DEST}  → hedef URL (encodeURIComponent)
 *   {SUBID} → raporlama alt kimliği (ürün + oturum), ağ panelinde hangi kartın
 *             kazandırdığını görebilmek için
 */

import { createSupabaseAdmin } from '@/lib/supabase-admin';

export interface AffiliateLinkRow {
  network: string;
  institution_id: string;
  product_type: string | null;
  country: string | null;
  url_template: string;
  active: boolean;
}

const TTL_MS = 10 * 60 * 1000;
let cache: { at: number; rows: AffiliateLinkRow[] } | null = null;

async function getRows(): Promise<AffiliateLinkRow[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;

  const client = createSupabaseAdmin();
  if (!client) return [];

  const { data, error } = await client
    .from('affiliate_links')
    .select('network, institution_id, product_type, country, url_template, active')
    .eq('active', true);

  if (error) {
    console.error('[affiliate-links] read failed:', error.message);
    return cache?.rows ?? [];
  }

  cache = { at: Date.now(), rows: (data ?? []) as AffiliateLinkRow[] };
  return cache.rows;
}

/**
 * Hedef URL'yi ağın takip linkine sarar. Eşleşme yoksa null döner (çağıran
 * tarafta düz UTM linki kullanılır).
 *
 * Özgüllük sırası: kurum+tip+ülke → kurum+tip → kurum+ülke → kurum.
 */
export async function wrapWithAffiliate(
  dest: string,
  opts: { institutionId?: string | null; productType?: string | null; country?: string | null; subId?: string | null },
): Promise<string | null> {
  const inst = opts.institutionId;
  if (!inst) return null;

  let rows: AffiliateLinkRow[];
  try {
    rows = await getRows();
  } catch {
    return null;
  }
  if (rows.length === 0) return null;

  const forInst = rows.filter((r) => r.institution_id === inst);
  if (forInst.length === 0) return null;

  const score = (r: AffiliateLinkRow): number => {
    // Yanlış eşleşme kazançtan kötüdür: tip/ülke DOLU ama uyuşmuyorsa eleme
    if (r.product_type && r.product_type !== opts.productType) return -1;
    if (r.country && r.country !== opts.country) return -1;
    return (r.product_type ? 2 : 0) + (r.country ? 1 : 0);
  };

  const best = forInst
    .map((r) => ({ r, s: score(r) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)[0];

  if (!best) return null;

  const subId = (opts.subId ?? '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60);
  return best.r.url_template
    .replace('{DEST}', encodeURIComponent(dest))
    .replace('{SUBID}', subId);
}
