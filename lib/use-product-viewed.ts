'use client';

/**
 * useProductViewed — bir ürün kartı GERÇEKTEN görüldüğünde `product_view` üretir.
 *
 * Neden var: `trackProductView` tanımlıydı ama hiçbir kart onu çağırmıyordu, bu
 * yüzden admin funnel'ında orta adım hep 0 görünüyordu (2026-08-31 denetimi).
 *
 * "Görüldü" tanımı — impression değil, dikkat:
 *   kartın en az yarısı ekranda VE en az 1 saniye orada kaldı.
 * Hızlı kaydırmada geçilen kartlar sayılmaz; yoksa metrik yine anlamsız olurdu.
 *
 * Aynı ürün sayfa yaşamı boyunca bir kez sayılır (modül seviyesi Set) — filtre
 * değişince kart yeniden mount olur ama görüntülenme tekrar yazılmaz.
 *
 * Native IntersectionObserver kullanır; ek paket yok.
 */

import { createElement, useEffect, useRef, type ReactNode } from 'react';
import { queueProductView } from '@/lib/tracker';

/** Sayfa yaşamı boyunca sayılmış ürünler — tekrar mount tekrar event yazmasın */
const counted = new Set<string>();

const VISIBLE_RATIO = 0.5;
const DWELL_MS = 1000;

export function useProductViewed<T extends HTMLElement = HTMLDivElement>(
  productId: string | null | undefined,
  productType: string | null | undefined
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !productId || !productType) return;

    const key = `${productType}:${productId}`;
    if (counted.has(key)) return;

    // Eski tarayıcı / test ortamı — sessizce devre dışı kal, UI etkilenmesin
    if (typeof IntersectionObserver === 'undefined') return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO) {
            if (dwellTimer) continue;
            dwellTimer = setTimeout(() => {
              if (!counted.has(key)) {
                counted.add(key);
                queueProductView(productId, productType);
              }
              observer.disconnect();
            }, DWELL_MS);
          } else if (dwellTimer) {
            // Süre dolmadan ekrandan çıktı → görüldü sayma
            clearTimeout(dwellTimer);
            dwellTimer = null;
          }
        }
      },
      { threshold: [0, VISIBLE_RATIO] }
    );

    observer.observe(el);

    return () => {
      if (dwellTimer) clearTimeout(dwellTimer);
      observer.disconnect();
    };
  }, [productId, productType]);

  return ref;
}

/**
 * Kartı `map` içinde inline render eden sayfalar için sarmalayıcı.
 * Hook bir döngü içinde çağrılamaz (React kuralı), ama her liste öğesi kendi
 * component instance'ı olduğunda çağrılabilir — bu bileşen tam olarak onu sağlar.
 * Ayrı bir kart component'i olan yerlerde (RateCard, LoanOfferCard...) doğrudan
 * `useProductViewed` kullan; bu sarmalayıcıya gerek yok.
 */
export function ProductViewed({
  productId,
  productType,
  className,
  children,
}: {
  productId: string;
  productType: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useProductViewed<HTMLDivElement>(productId, productType);
  return createElement('div', { ref, className }, children);
}
