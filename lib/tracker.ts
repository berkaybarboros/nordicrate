/**
 * Client-side event tracker
 * Her event Supabase `events` tablosuna yazılır → ML pipeline'ı besler.
 *
 * Kullanım:
 *   import { track } from '@/lib/tracker';
 *   track('apply_click', { product_id: 'lhv-personal', product_type: 'personal', amount: 15000 });
 */

import { supabase } from '@/lib/supabase';

export type EventType =
  | 'page_view'
  | 'product_view'
  | 'calculator_use'
  | 'compare_add'
  | 'compare_remove'
  | 'apply_click'          // "Apply Now" veya "Get Quote" tıklandı
  | 'quote_view'
  | 'find_rate_open'       // modal açıldı
  | 'find_rate_submit'     // form gönderildi
  | 'find_rate_apply'      // modal içinde apply tıklandı
  | 'recommendation_view'  // öneri gösterildi
  | 'recommendation_click' // öneri tıklandı
  | 'onboarding_step'      // onboarding adımı görüntülendi (funnel)
  | 'onboarding_complete'  // onboarding sihirbazı tamamlandı
  | 'lead_capture';        // e-posta yakalama (newsletter / rate report gate)

interface TrackPayload {
  product_id?:   string;
  product_type?: string;
  page?:         string;
  [key: string]: unknown; // rest → metadata JSONB
}

// Session ID: browser sessionStorage'da tutulur (tab başına unique)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let sid = sessionStorage.getItem('nr_sid');
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('nr_sid', sid);
  }
  return sid;
}

// GTM dataLayer tipi — GA4 event'leri GTM üzerinden akar
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export async function track(
  eventType: EventType,
  payload: TrackPayload = {}
): Promise<void> {
  if (typeof window === 'undefined') return; // SSR'da çalıştırma

  const { product_id, product_type, page, ...rest } = payload;

  // GTM/GA4 köprüsü: her event dataLayer'a da düşer (event adı: nr_<tip>).
  // GTM'de "Custom Event: nr_apply_click" trigger'ı ile GA4'e conversion bağlanır.
  try {
    // Metadata alanları (step, rank, source...) GA4'e de nr_ önekiyle geçsin —
    // funnel raporları sadece Supabase'e değil GA4'e de düşer
    const extras = Object.fromEntries(
      Object.entries(rest).map(([k, v]) => [`nr_${k}`, v ?? null])
    );
    window.dataLayer?.push({
      event: `nr_${eventType}`,
      nr_product_id: product_id ?? null,
      nr_product_type: product_type ?? null,
      nr_page: page ?? window.location.pathname,
      ...extras,
    });
  } catch { /* analytics asla UI'yı bozmaz */ }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('events').insert({
      session_id:   getSessionId(),
      user_id:      user?.id ?? null,
      event_type:   eventType,
      page:         page ?? (typeof window !== 'undefined' ? window.location.pathname : null),
      product_id:   product_id ?? null,
      product_type: product_type ?? null,
      metadata:     Object.keys(rest).length > 0 ? rest : {},
    });
  } catch {
    // Tracking hataları UI'yı bozmamalı — sessizce geç
  }
}

// Shorthand'ler — sık kullanılanlar için
export const trackApplyClick = (productId: string, productType: string, extra?: Record<string, unknown>) =>
  track('apply_click', { product_id: productId, product_type: productType, ...extra });

export const trackProductView = (productId: string, productType: string) =>
  track('product_view', { product_id: productId, product_type: productType });

/* ─────────────────────────────────────────────────────────────────────────
 * product_view batch kuyruğu
 *
 * 2026-08-31: `trackProductView` tanımlıydı ama HİÇBİR yerden çağrılmıyordu —
 * admin funnel'ında "Product views: 0" görünmesinin sebebi buydu, yani
 * page_view → product_view → apply_click zincirinin orta adımı hiç ölçülmedi.
 *
 * Neden ayrı kuyruk: bir liste sayfasında 20+ kart görünür. Her biri için
 * `track()` çağırmak 20 × (auth.getUser + insert) = 40 ağ işlemi demek.
 * Görüntülenmeler tek insert'te toplanır; tıklama gibi kritik event'ler
 * eskisi gibi anında gider.
 * ───────────────────────────────────────────────────────────────────────── */

interface QueuedView { product_id: string; product_type: string; page: string }

const viewQueue: QueuedView[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushBound = false;

async function flushProductViews(): Promise<void> {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (viewQueue.length === 0) return;

  const batch = viewQueue.splice(0, viewQueue.length);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sid = getSessionId();
    await supabase.from('events').insert(
      batch.map((v) => ({
        session_id:   sid,
        user_id:      user?.id ?? null,
        event_type:   'product_view' as const,
        page:         v.page,
        product_id:   v.product_id,
        product_type: v.product_type,
        metadata:     {},
      }))
    );
  } catch {
    // Tracking hataları UI'yı bozmamalı — kayıp görüntülenme kabul edilebilir
  }
}

/**
 * Bir ürün kartının gerçekten görüldüğünü kuyruğa alır (bkz. useProductViewed).
 * GA4'e anında, Supabase'e toplu gider.
 */
export function queueProductView(productId: string, productType: string): void {
  if (typeof window === 'undefined') return;

  try {
    window.dataLayer?.push({
      event: 'nr_product_view',
      nr_product_id: productId,
      nr_product_type: productType,
      nr_page: window.location.pathname,
    });
  } catch { /* analytics asla UI'yı bozmaz */ }

  viewQueue.push({
    product_id: productId,
    product_type: productType,
    page: window.location.pathname,
  });

  // Sekme kapanırken/gizlenirken kuyrukta kalanı kaybetme
  if (!flushBound) {
    flushBound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushProductViews();
    });
  }

  if (viewQueue.length >= 12) { void flushProductViews(); return; } // kuyruk şişmesin
  if (!flushTimer) flushTimer = setTimeout(() => void flushProductViews(), 2500);
}

export const trackCompareAdd = (productId: string, productType: string) =>
  track('compare_add', { product_id: productId, product_type: productType });

export const trackCompareRemove = (productId: string, productType: string) =>
  track('compare_remove', { product_id: productId, product_type: productType });

export const trackFindRateSubmit = (productType: string, leadId: string | null) =>
  track('find_rate_submit', { product_type: productType, lead_id: leadId });

export const trackRecommendationClick = (rank: number, productId: string, leadId: string | null) =>
  track('recommendation_click', { product_id: productId, rank, lead_id: leadId });
