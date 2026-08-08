'use client';

/**
 * PageViewTracker — her rota değişiminde first-party page_view event'i.
 *
 * Trafik denetimi (2026-08-08) bulgusu: events tablosunda page_view HİÇ yoktu —
 * tracker'da tip tanımlıydı ama hiçbir yer çağırmıyordu. GA4 page_view'ı GTM
 * otomatik atar ama consent'e bağlı; bu first-party kayıt consent'ten bağımsız
 * (kişisel veri yok: path + anonim session) ve admin funnel'ının tabanı.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/tracker';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    track('page_view', { page: pathname });
  }, [pathname]);

  return null;
}
