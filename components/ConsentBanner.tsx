'use client';

/**
 * Cookie consent banner — Google Consent Mode v2 ile çalışır.
 * - İlk ziyarette görünür; seçim localStorage 'nr-consent' (granted/denied).
 * - Accept → gtag consent update (analytics_storage granted) → GTM/GA4 devreye girer.
 * - Decline → denied kalır, GA4 çerez düşürmez (default zaten denied — layout.tsx).
 * - Footer'daki "Cookie settings" 'nr-open-consent' event'iyle yeniden açar.
 * Üçüncü parti CMP scripti YOK — hafif, self-hosted (P0 ücretsiz-kaynak kararı).
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

function pushConsent(granted: boolean) {
  try {
    // gtag shim'i layout'taki inline script tanımlıyor (arguments-tabanlı push).
    // Consent Mode komutları MUTLAKA gtag() üzerinden gitmeli — düz dataLayer.push
    // array'i Google tag'leri tarafından consent komutu olarak işlenmez.
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
    }
  } catch { /* ignore */ }
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('nr-consent')) setVisible(true);
    } catch { /* ignore */ }

    const reopen = () => setVisible(true);
    window.addEventListener('nr-open-consent', reopen);
    return () => window.removeEventListener('nr-open-consent', reopen);
  }, []);

  const choose = (granted: boolean) => {
    try { localStorage.setItem('nr-consent', granted ? 'granted' : 'denied'); } catch { /* ignore */ }
    pushConsent(granted);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 sm:p-5">
        {/* Kısa tutulmalı: banner client-side geç mount olur — uzun paragraf mobilde
            LCP elementi olup skoru 5.8s'e çekiyordu (Lighthouse 2026-08-01) */}
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Cookies on NordicRate.</strong>{' '}
          One optional analytics cookie (Google Analytics) — nothing is set until you choose.{' '}
          <Link href="/cookies" className="text-sky-700 underline">Cookie Policy</Link>
          {' · '}
          <Link href="/privacy" className="text-sky-700 underline">Privacy Policy</Link>
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => choose(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            Accept analytics
          </button>
          <button
            onClick={() => choose(false)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
