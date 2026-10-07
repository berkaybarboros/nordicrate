'use client';

import { useEffect, useState } from 'react';
import { describeEuribor } from '@/lib/rates';
import type { LiveRatesData } from '@/lib/types';

// 2026-10: Eskiden "Live rates · updated just now" — /api/rates fallback'te bile çekim
// saatini "şimdi" diye dönüyordu ve rozet statik ürün oranlarının üstünde duruyordu.
// Artık yalnız neyin referans olduğunu ve hangi döneme ait olduğunu söyler.
export default function DataFreshnessBadge() {
  const [data, setData] = useState<LiveRatesData | null>(null);

  useEffect(() => {
    fetch('/api/rates')
      .then(r => r.json())
      .then((d: LiveRatesData) => setData(d))
      .catch(() => null);
  }, []);

  if (!data) return null;

  const { text, live: isLive } = describeEuribor(data);
  const label = `Rates checked per product · ${text}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
        isLive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
      />
      {label}
    </span>
  );
}
