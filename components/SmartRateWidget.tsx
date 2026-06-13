'use client';

/**
 * SmartRateWidget
 * Supabase Realtime'a subscribe olur → rate_snapshots tablosunda
 * yeni satır gelince otomatik günceller.
 *
 * Gösterdikleri:
 *  - Canlı EURIBOR 3M / 6M / 12M
 *  - ECB / Norges Bank policy rates
 *  - Delta (↑↓ ile renk)
 *  - "Rates changed" toast → öneri güncelleme tetikler
 */

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Zap, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import RateAlertModal from './alerts/RateAlertModal';

export interface RateEntry {
  key: string;
  rate: number;
  delta: number | null;
  fetched_at: string;
  label: string;
  currency: string;
}

const RATE_META: Record<string, { label: string; currency: string; group: 'euribor' | 'policy' }> = {
  euribor3m:       { label: 'EURIBOR 3M',    currency: 'EUR', group: 'euribor' },
  euribor6m:       { label: 'EURIBOR 6M',    currency: 'EUR', group: 'euribor' },
  euribor12m:      { label: 'EURIBOR 12M',   currency: 'EUR', group: 'euribor' },
  policy_rate_no:  { label: 'Norges Bank',   currency: 'NOK', group: 'policy'  },
};

interface Props {
  compact?: boolean;
  onRateChange?: (rates: RateEntry[]) => void;
  className?: string;
  showAlertCta?: boolean;
}

export default function SmartRateWidget({ compact = false, onRateChange, className = '', showAlertCta = true }: Props) {
  const [rates, setRates] = useState<Map<string, RateEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [justChanged, setJustChanged] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // İlk yükleme: son rates'leri çek
  const fetchInitialRates = useCallback(async () => {
    const { data } = await supabase
      .from('rate_snapshots')
      .select('key, rate, delta, fetched_at')
      .in('key', Object.keys(RATE_META))
      .order('fetched_at', { ascending: false })
      .limit(20);

    if (!data) { setLoading(false); return; }

    const map = new Map<string, RateEntry>();
    for (const row of data) {
      if (!map.has(row.key) && RATE_META[row.key]) {
        map.set(row.key, {
          key:        row.key,
          rate:       row.rate,
          delta:      row.delta,
          fetched_at: row.fetched_at,
          label:      RATE_META[row.key].label,
          currency:   RATE_META[row.key].currency,
        });
      }
    }
    setRates(map);
    setLoading(false);
    if (map.size > 0) {
      setLastUpdate(new Date());
      onRateChange?.(Array.from(map.values()));
    }
  }, [onRateChange]);

  // Realtime subscription
  useEffect(() => {
    fetchInitialRates();

    const channel = supabase
      .channel('rate-snapshots-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rate_snapshots' },
        (payload) => {
          const row = payload.new as { key: string; rate: number; delta: number | null; fetched_at: string };
          if (!RATE_META[row.key]) return;

          setRates(prev => {
            const next = new Map(prev);
            next.set(row.key, {
              key:        row.key,
              rate:       row.rate,
              delta:      row.delta,
              fetched_at: row.fetched_at,
              label:      RATE_META[row.key].label,
              currency:   RATE_META[row.key].currency,
            });
            onRateChange?.(Array.from(next.values()));
            return next;
          });

          setLastUpdate(new Date());
          setJustChanged(true);
          setTimeout(() => setJustChanged(false), 4000);
        }
      )
      .subscribe((status) => {
        setRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, [fetchInitialRates, onRateChange]);

  // ─── Compact mode: sadece EURIBOR 3M chip ─────────────────────────────────
  if (compact) {
    const euribor3m = rates.get('euribor3m');
    if (loading || !euribor3m) {
      return (
        <div className={`inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1 text-xs text-slate-400 animate-pulse ${className}`}>
          <RefreshCw size={10} className="animate-spin" />
          Loading rates…
        </div>
      );
    }
    const delta = euribor3m.delta ?? 0;
    const isUp = delta > 0.001;
    const isDown = delta < -0.001;
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
        isDown ? 'bg-green-50 text-green-700 border-green-200' :
        isUp   ? 'bg-red-50 text-red-700 border-red-200' :
                 'bg-slate-50 text-slate-600 border-slate-200'
      } ${className}`}>
        {isDown ? <TrendingDown size={11} /> : isUp ? <TrendingUp size={11} /> : <Minus size={11} />}
        EURIBOR 3M: {euribor3m.rate}%
        {delta !== 0 && (
          <span className="font-normal opacity-70">
            ({delta > 0 ? '+' : ''}{delta?.toFixed(3)})
          </span>
        )}
        {realtimeActive && <Zap size={9} className="text-sky-500 animate-pulse" />}
      </div>
    );
  }

  // ─── Full mode ─────────────────────────────────────────────────────────────
  const euriborRates = Array.from(rates.values()).filter(r => RATE_META[r.key]?.group === 'euribor');
  const policyRates  = Array.from(rates.values()).filter(r => RATE_META[r.key]?.group === 'policy');

  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${realtimeActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
              {realtimeActive ? 'Live' : 'Cached'} Rates
            </span>
          </div>
          {justChanged && (
            <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full animate-bounce font-bold">
              Updated!
            </span>
          )}
        </div>
        {lastUpdate && (
          <span className="text-[10px] text-white/30">
            {lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rates.size === 0 ? (
        <div className="text-center py-4 text-white/40 text-sm">
          <RefreshCw size={20} className="mx-auto mb-2 opacity-40" />
          No live data — using fallback rates
        </div>
      ) : (
        <div className="space-y-4">
          {/* EURIBOR */}
          {euriborRates.length > 0 && (
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-semibold">EURIBOR Interbank</p>
              <div className="space-y-1.5">
                {euriborRates.map(r => <RateRow key={r.key} rate={r} />)}
              </div>
            </div>
          )}

          {/* Policy rates */}
          {policyRates.length > 0 && (
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-semibold">Central Banks</p>
              <div className="space-y-1.5">
                {policyRates.map(r => <RateRow key={r.key} rate={r} />)}
              </div>
            </div>
          )}

          <p className="text-[10px] text-white/20 text-center pt-1">
            Indicative rates · ECB & Norges Bank · Updated hourly
          </p>

          {showAlertCta && (
            <button
              onClick={() => setAlertOpen(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 text-xs font-semibold py-2 rounded-xl transition-all group"
            >
              <Bell size={12} className="group-hover:animate-bounce" />
              Get Rate Drop Alert
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </button>
          )}
        </div>
      )}

      <RateAlertModal open={alertOpen} onClose={() => setAlertOpen(false)} />
    </div>
  );
}

// ─── Sub-component: single rate row ─────────────────────────────────────────
function RateRow({ rate }: { rate: RateEntry }) {
  const delta = rate.delta ?? 0;
  const isUp   = delta > 0.001;
  const isDown = delta < -0.001;

  return (
    <div className="flex items-center justify-between bg-white/5 hover:bg-white/8 rounded-xl px-3 py-2 transition-colors">
      <span className="text-xs text-white/70 font-medium">{rate.label}</span>
      <div className="flex items-center gap-2">
        {delta !== 0 && (
          <span className={`text-[10px] font-semibold ${isDown ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{delta.toFixed(3)}
          </span>
        )}
        <div className={`flex items-center gap-1 ${isDown ? 'text-green-400' : isUp ? 'text-red-400' : 'text-white'}`}>
          {isDown ? <TrendingDown size={12} /> : isUp ? <TrendingUp size={12} /> : <Minus size={12} className="text-white/40" />}
          <span className="text-sm font-extrabold">{rate.rate}%</span>
        </div>
      </div>
    </div>
  );
}
