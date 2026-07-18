'use client';

/**
 * Kayan kurum logoları — "kalabalık" sosyal kanıt şeridi.
 * ETİKET BİLİNÇLİ OLARAK "institutions we compare" — "partners" DEĞİL:
 * kurumlarla imzalı ortaklık yok; footer'daki bağımsızlık feragatnamesiyle
 * çelişen bir "Partners" başlığı UCPD + marka riski yaratır ve affiliate
 * ağlarının compliance kontrolüne takılır. Görsel etki aynı, iddia dürüst.
 *
 * Logolar: Clearbit (domain bazlı). Yüklenemeyen logo → monogram fallback.
 * Motion: saf CSS sonsuz kayma (globals.css @keyframes marquee),
 * hover'da durur, prefers-reduced-motion globalde animasyonları kapatır.
 */

import { useState } from 'react';
import { INSTITUTIONS, COUNTRIES } from '@/lib/data';

function logoUrl(website?: string): string | null {
  if (!website) return null;
  try {
    return `https://logo.clearbit.com/${new URL(website).hostname}?size=64&greyscale=true`;
  } catch {
    return null;
  }
}

function LogoChip({ name, shortName, website }: { name: string; shortName: string; website?: string }) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl(website);

  return (
    <div
      className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shrink-0 select-none"
      title={name}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- küçük 3P logolar, next/image optimizasyonu gereksiz
        <img
          src={src}
          alt=""
          width={24}
          height={24}
          loading="lazy"
          className="rounded-sm opacity-70"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-[10px] font-extrabold flex items-center justify-center">
          {shortName.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">{shortName}</span>
    </div>
  );
}

export default function InstitutionMarquee() {
  // İki yarıya böl — iki şerit zıt yönde kayar, "kalabalık" hissi artar
  const half = Math.ceil(INSTITUTIONS.length / 2);
  const rowA = INSTITUTIONS.slice(0, half);
  const rowB = INSTITUTIONS.slice(half);

  return (
    <section className="bg-slate-50 border-y border-slate-200 py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-1">
            {INSTITUTIONS.length}+ institutions · {COUNTRIES.length} countries
          </p>
          <h2 className="text-xl font-extrabold text-slate-900">
            Banks, insurers &amp; lenders we compare
          </h2>
        </div>
        <p className="text-[11px] text-slate-400 max-w-xs text-right hidden sm:block">
          Independent comparison — trademarks belong to their respective owners.
        </p>
      </div>

      <div className="space-y-3 group">
        {[
          { row: rowA, cls: 'animate-marquee' },
          { row: rowB, cls: 'animate-marquee-reverse' },
        ].map(({ row, cls }, i) => (
          <div key={i} className="overflow-hidden">
            <div className={`flex gap-3 w-max ${cls} group-hover:[animation-play-state:paused]`}>
              {/* Kesintisiz döngü için liste iki kez render edilir */}
              {[...row, ...row].map((inst, j) => (
                <LogoChip key={`${inst.id}-${j}`} name={inst.name} shortName={inst.shortName} website={inst.website} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
