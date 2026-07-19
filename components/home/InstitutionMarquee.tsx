'use client';

/**
 * Kayan kurum logoları — "kalabalık" sosyal kanıt şeridi.
 * ETİKET BİLİNÇLİ OLARAK "institutions we compare" — "partners" DEĞİL:
 * kurumlarla imzalı ortaklık yok; footer'daki bağımsızlık feragatnamesiyle
 * çelişen bir "Partners" başlığı UCPD + marka riski yaratır.
 *
 * Logolar: public/logos/<domain>.webp (resmi, lokalde host'lu, sıkıştırılmış).
 * Yüklenemeyen logo → monogram fallback.
 * Öğeler SADECE ürünü olan kurumlar — sunucudan `items` prop'u ile gelir.
 */

import { useState } from 'react';

export interface MarqueeItem {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
  mono: string;
}

function LogoChip({ item }: { item: MarqueeItem }) {
  const [failed, setFailed] = useState(false);
  const showImg = item.logo && !failed;

  return (
    <div
      className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shrink-0 select-none"
      title={item.name}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- küçük lokal webp, next/image gereksiz
        <img
          src={item.logo!}
          alt=""
          width={22}
          height={22}
          loading="lazy"
          className="w-[22px] h-[22px] object-contain rounded-sm"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="w-[22px] h-[22px] rounded-md bg-slate-100 text-slate-500 text-[10px] font-extrabold flex items-center justify-center">
          {item.mono}
        </span>
      )}
      <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">{item.shortName}</span>
    </div>
  );
}

export default function InstitutionMarquee({ items, countryCount }: { items: MarqueeItem[]; countryCount: number }) {
  if (items.length === 0) return null;

  // İki yarıya böl — iki şerit zıt yönde kayar, "kalabalık" hissi artar
  const half = Math.ceil(items.length / 2);
  const rowA = items.slice(0, half);
  const rowB = items.slice(half);

  return (
    <section className="bg-slate-50 border-y border-slate-200 py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-1">
            {items.length} institutions · {countryCount} countries
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
              {[...row, ...row].map((item, j) => (
                <LogoChip key={`${item.id}-${j}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
