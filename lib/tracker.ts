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
  | 'recommendation_click';// öneri tıklandı

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

export async function track(
  eventType: EventType,
  payload: TrackPayload = {}
): Promise<void> {
  if (typeof window === 'undefined') return; // SSR'da çalıştırma

  const { product_id, product_type, page, ...rest } = payload;

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

export const trackCompareAdd = (productId: string, productType: string) =>
  track('compare_add', { product_id: productId, product_type: productType });

export const trackCompareRemove = (productId: string, productType: string) =>
  track('compare_remove', { product_id: productId, product_type: productType });

export const trackFindRateSubmit = (productType: string, leadId: string | null) =>
  track('find_rate_submit', { product_type: productType, lead_id: leadId });

export const trackRecommendationClick = (rank: number, productId: string, leadId: string | null) =>
  track('recommendation_click', { product_id: productId, rank, lead_id: leadId });
