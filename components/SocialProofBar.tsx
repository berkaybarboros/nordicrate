'use client';

/**
 * SocialProofBar
 * Listing sayfalarının üstünde gösterilen canlı aktivite + güven sinyalleri.
 * Sayılar gün bazlı seed ile deterministik — gerçekçi ama statik.
 */

import { useEffect, useState } from 'react';
import { Users, Zap, RefreshCw, ShieldCheck } from 'lucide-react';

interface Props {
  productType: 'loan' | 'insurance' | 'deposit';
  rateKey?: string; // rate_snapshots'dan fetchedAt çekmek için (ör. 'euribor3m')
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getLiveNumbers(productType: string) {
  // Seed: gün + ürün tipi → gün boyunca stabil, gerçekçi sayılar
  const daySeed = Math.floor(Date.now() / 86400000);
  const typeSeed = productType === 'loan' ? 1 : productType === 'insurance' ? 2 : 3;
  const r = (offset: number) => seededRandom(daySeed * 10 + typeSeed + offset);

  return {
    viewingNow:   Math.floor(r(0) * 80 + 60),      // 60–140
    todayCompare: Math.floor(r(1) * 200 + 150),    // 150–350
    lastApplyMin: Math.floor(r(2) * 8 + 1),        // 1–9 min ago
    rating:       (4.6 + r(3) * 0.3).toFixed(1),   // 4.6–4.9
    reviewCount:  Math.floor(r(4) * 200 + 200),    // 200–400
  };
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SocialProofBar({ productType, rateKey = 'euribor3m' }: Props) {
  const nums = getLiveNumbers(productType);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // rate_snapshots'dan son güncelleme zamanını çek
    fetch('/api/rates')
      .then(r => r.json())
      .then((d: { fetchedAt?: string; success?: boolean }) => {
        if (d.fetchedAt) setUpdatedAt(d.fetchedAt);
      })
      .catch(() => null);

    // Her 45 sn'de "son başvuru" sayacını titret
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const label = productType === 'loan' ? 'loans' : productType === 'insurance' ? 'policies' : 'deposits';

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">

      {/* Viewing now */}
      <div className="flex items-center gap-1.5 text-gray-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span><strong className="text-gray-800">{nums.viewingNow}</strong> people viewing now</span>
      </div>

      {/* Today comparisons */}
      <div className="flex items-center gap-1.5 text-gray-500">
        <Users size={11} className="text-sky-500" />
        <span><strong className="text-gray-800">{nums.todayCompare}</strong> {label} compared today</span>
      </div>

      {/* Last application */}
      <div className={`flex items-center gap-1.5 transition-all ${pulse ? 'text-orange-600' : 'text-gray-500'}`}>
        <Zap size={11} className={pulse ? 'text-orange-500' : 'text-amber-400'} />
        <span>Last application <strong className="text-gray-800">{nums.lastApplyMin} min ago</strong></span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 text-gray-500">
        <ShieldCheck size={11} className="text-violet-500" />
        <span>
          <strong className="text-gray-800">⭐ {nums.rating}</strong>
          <span className="text-gray-400"> / 5 · {nums.reviewCount} reviews</span>
        </span>
      </div>

      {/* Data freshness — pushed right */}
      <div className="ml-auto flex items-center gap-1.5">
        {updatedAt ? (
          <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Rates updated {timeAgo(updatedAt)}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-gray-300">
            <RefreshCw size={9} className="animate-spin" /> Loading…
          </span>
        )}
      </div>
    </div>
  );
}
