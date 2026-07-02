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

interface Props {
  productType: 'loan' | 'insurance' | 'deposit';
  rateKey?: string; // API sözleşmesi için korunuyor
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SocialProofBar({ productType }: Props) {
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/rates')
      .then(r => r.json())
      .then((d: { fetchedAt?: string }) => {
        if (d.fetchedAt) setUpdatedAt(d.fetchedAt);
      })
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
        <span><strong className="text-slate-800">{INSTITUTIONS.length}+</strong> institutions compared</span>
      </div>

      {/* Countries */}
      <div className="flex items-center gap-1.5 text-slate-500">
        <Globe2 size={12} className="text-emerald-600" />
        <span><strong className="text-slate-800">{COUNTRIES.length}</strong> Nordic &amp; Baltic markets</span>
      </div>

      {/* Independence */}
      <div className="flex items-center gap-1.5 text-slate-500">
        <ShieldCheck size={12} className="text-violet-500" />
        <span>Independent — free comparison of {label}</span>
      </div>

      {/* Data freshness — pushed right */}
      <div className="ml-auto flex items-center gap-1.5">
        {updatedAt ? (
          <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Rates updated {timeAgo(updatedAt)}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-slate-300">
            <RefreshCw size={9} className="animate-spin" /> Loading…
          </span>
        )}
      </div>
    </div>
  );
}
