'use client';

/**
 * DemandCapture — bir arama boş ya da zayıf döndüğünde gösterilir.
 *
 * İki iş yapıyor ve birincisi kullanıcıdan hiçbir şey istemiyor:
 *
 *  1. Ne arandığını kaydeder (ülke, ürün, tutar, vade, kaç sonuç döndü). Sayfa
 *     altındaki "Did you find what you were looking for?" altı haftada bir
 *     cevap topladı; aynı dönemde 741 ürün görüntülendi. İnsanlar anket
 *     doldurmuyor, ama boş dönen arama zaten bize ne eksik olduğunu söylüyor.
 *  2. Ancak bu noktada e-posta ister — kullanıcının ihtiyacı tam da şu an
 *     karşılanmamışken. Genel bültene kaydolmakla aynı şey değil: "bunu
 *     bulduğumuzda haber ver" somut bir söz.
 *
 * Hiçbir alan zorunlu değil. Zorunlu olsaydı elimizde yine tek satır olurdu.
 */

import { useEffect, useRef, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { getSessionContext } from '@/lib/tracker';

export interface DemandQuery {
  productType: 'personal' | 'car' | 'mortgage' | 'business' | 'deposit' | 'insurance';
  /** ISO-2, filtre varsa */
  country?: string | null;
  amount?: number | null;
  termMonths?: number | null;
  resultCount: number;
  /** Kaç sonucun oranı bankadan okundu — 0 ise kapsam var, canlı veri yok */
  liveCount?: number | null;
}

interface Props extends DemandQuery {
  /** Kullanıcının ne aradığını kendi diliyle özetleyen satır: "a personal loan in Finland" */
  what: string;
  page: string;
  className?: string;
}

function post(payload: Record<string, unknown>) {
  const ctx = getSessionContext();
  return fetch('/api/demand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, sessionId: ctx.sessionId, source: ctx.source }),
    keepalive: true,
  }).catch(() => {
    // Sinyal kaydı kullanıcının akışını bozmamalı
  });
}

export default function DemandCapture({ what, page, className = '', ...query }: Props) {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  // Aynı arama için bir kez. Bir kullanıcının slider'ı oynatması on satır üretmesin:
  // anahtar sorgunun kendisi, bileşenin kaç kez render olduğu değil.
  const key = JSON.stringify(query);
  const logged = useRef<string | null>(null);

  useEffect(() => {
    if (logged.current === key) return;
    logged.current = key;
    void post({ ...query, page });
    // query nesnesi her render'da yeni; bağımlılık onun içeriği (key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, page]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !note.trim()) return;
    void post({ ...query, page, email: email.trim() || undefined, note: note.trim() || undefined });
    setSent(true);
  };

  if (sent) {
    return (
      <div className={`bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 ${className}`}>
        <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
          <Check size={16} /> Noted — thank you.
        </p>
        <p className="text-xs text-emerald-800 mt-1">
          {email.trim()
            ? 'We will email you once we cover it. Nothing else — no newsletter.'
            : 'This goes straight onto the list of what to add next.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl px-5 py-5 ${className}`}>
      <p className="text-sm font-semibold text-slate-900">
        We don&rsquo;t cover {what} yet.
      </p>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
        NordicRate is new and adds lenders one at a time, reading each bank&rsquo;s own page.
        Telling us what you were after is what decides the order.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="demand-note" className="block text-xs font-semibold text-slate-700 mb-1">
            What were you looking for? <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="demand-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="e.g. a mortgage in Finland as a non-resident"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label htmlFor="demand-email" className="block text-xs font-semibold text-slate-700 mb-1">
            Email to notify you <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="demand-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={200}
              placeholder="you@example.com"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="submit"
              disabled={!email.trim() && !note.trim()}
              className="inline-flex items-center gap-1.5 bg-[#1a3c6e] hover:bg-[#15325c] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <Bell size={14} /> Tell us
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
