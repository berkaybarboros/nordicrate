'use client';

/**
 * SocialProofBar
 * Listing sayfalarının üstünde gösterilen güven sinyalleri.
 * SADECE doğrulanabilir iddialar: kurum/ülke sayısı statik katalogdan,
 * "rates updated" zamanı gerçek rate_snapshots verisinden.
 * (Eski fabrike "X people viewing now" sayıları UCPD riski nedeniyle kaldırıldı.)
 */

import { useEffect, useState } from 'react';
import { Landmark, Globe2, ShieldCheck, RefreshCw } from 'lucide-react';
import { INSTITUTIONS, COUNTRIES } from '@/lib/data';
import { describeEuribor } from '@/lib/rates';
import AffiliateDisclosure from './AffiliateDisclosure';
import type { LiveRatesData } from '@/lib/types';

interface Props {
  productType: 'loan' | 'insurance' | 'deposit';
  rateKey?: string; // API sözleşmesi için korunuyor
}

export default function SocialProofBar({ productType }: Props) {
  // 2026-10: "EURIBOR reference updated just now" fallback'te bile basılıyordu
  // (fetchedAt = istek anı). Artık oranın ait olduğu dönemi ve kaynağını söyler.
  const [euribor, setEuribor] = useState<{ text: string; live: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/rates')
      .then(r => r.json())
      .then((d: LiveRatesData) => setEuribor(describeEuribor(d)))
      .catch(() => null);
  }, []);

  const label =
    productType === 'loan' ? 'loan products' :
    productType === 'insurance' ? 'insurance products' : 'deposit products';

  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">

      {/* Institutions */}
      <div className="flex items-center gap-1.5 text-slate-500">
        <Landmark size={12} className="text-sky-600" />
        <span><strong className="text-slate-800">{INSTITUTIONS.length}</strong> institutions listed</span>
      </div>

      {/* Countries */}
      <div className="flex items-center gap-1.5 text-slate-500">
        <Globe2 size={12} className="text-emerald-600" />
        <span><strong className="text-slate-800">{COUNTRIES.length}</strong> Nordic &amp; Baltic markets</span>
      </div>

      {/* Independence */}
      <div className="flex items-center gap-1.5 text-slate-500">
        <ShieldCheck size={12} className="text-violet-500" />
        <span>Free comparison of {label}</span>
      </div>

      {/* Data freshness — pushed right */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* 2026-09-15: /api/rates yalnizca ECB/Norges Bank referans oranlarini tazeler.
            Onceden sigorta sayfasinda bile "Rates updated 5m ago" basiyordu — urun
            fiyatlari canliymis gibi. Artik neyin tazelendigini soyluyor. */}
        {productType === 'insurance' ? (
          <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Example premiums · not live quotes
          </span>
        ) : euribor ? (
          <span
            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              euribor.live
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${euribor.live ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {euribor.text}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-slate-300">
            <RefreshCw size={9} className="animate-spin" /> Loading…
          </span>
        )}
      </div>

      <AffiliateDisclosure className="basis-full" />
    </div>
  );
}
