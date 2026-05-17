/**
 * POST /api/cron/sync-rates
 * VPS cron tarafından saatte 1 çağrılır.
 * ECB EURIBOR + Norges Bank → rate_snapshots tablosuna yazar.
 * Supabase Realtime → UI otomatik güncellenir.
 *
 * Güvenlik: x-cron-secret header kontrolü
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

// ─── SDMX parse (rates.ts'ten duplicate etmeden) ────────────────────────────
function parseSDMXRate(json: Record<string, unknown>): { rate: number; period: string } | null {
  try {
    const dataSets = json.dataSets as Array<{
      series: Record<string, { observations: Record<string, number[]> }>;
    }>;
    const structure = json.structure as {
      dimensions: { observation: Array<{ values: Array<{ id: string }> }> };
    };
    const seriesKey = Object.keys(dataSets[0].series)[0];
    const observations = dataSets[0].series[seriesKey].observations;
    const obsKeys = Object.keys(observations).map(Number).sort((a, b) => a - b);
    const lastKey = obsKeys[obsKeys.length - 1];
    const rate = observations[lastKey][0];
    const period = structure.dimensions.observation[0].values[lastKey]?.id ?? '';
    return { rate: Math.round(rate * 10000) / 10000, period };
  } catch {
    return null;
  }
}

async function fetchECBRate(series: string): Promise<{ rate: number; period: string } | null> {
  try {
    const url = `https://data-api.ecb.europa.eu/service/data/FM/M.U2.EUR.RT.MM.${series}_.HSTA?lastNObservations=1&format=jsondata`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return parseSDMXRate(await res.json());
  } catch {
    return null;
  }
}

async function fetchNorgesRate(): Promise<{ rate: number; period: string } | null> {
  try {
    const url = 'https://data.norges-bank.no/api/data/IR/B.KPRA.SD.I?lastNObservations=1&format=sdmx-json';
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return parseSDMXRate(await res.json());
  } catch {
    return null;
  }
}

// ─── Handler ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Secret kontrolü
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServer();
  const results: Record<string, string> = {};

  // ECB rates parallel fetch
  const [euribor3m, euribor6m, euribor12m, norges] = await Promise.all([
    fetchECBRate('EURIBOR3MD'),
    fetchECBRate('EURIBOR6MD'),
    fetchECBRate('EURIBOR1YD'),
    fetchNorgesRate(),
  ]);

  const rateRows: { source: string; key: string; rate: number; currency: string; period: string }[] = [];

  if (euribor3m)  { rateRows.push({ source: 'ecb', key: 'euribor3m',  rate: euribor3m.rate,  currency: 'EUR', period: euribor3m.period });  results.euribor3m  = `${euribor3m.rate}%`;  }
  if (euribor6m)  { rateRows.push({ source: 'ecb', key: 'euribor6m',  rate: euribor6m.rate,  currency: 'EUR', period: euribor6m.period });  results.euribor6m  = `${euribor6m.rate}%`;  }
  if (euribor12m) { rateRows.push({ source: 'ecb', key: 'euribor12m', rate: euribor12m.rate, currency: 'EUR', period: euribor12m.period }); results.euribor12m = `${euribor12m.rate}%`; }
  if (norges)     { rateRows.push({ source: 'norges', key: 'policy_rate_no', rate: norges.rate, currency: 'NOK', period: norges.period }); results.norges = `${norges.rate}%`; }

  if (rateRows.length === 0) {
    return NextResponse.json({ error: 'All rate APIs failed' }, { status: 503 });
  }

  // insert_rate_snapshot fonksiyonu: prev_rate otomatik doldurur
  for (const row of rateRows) {
    try {
      await supabase.rpc('insert_rate_snapshot', {
        p_source:   row.source,
        p_key:      row.key,
        p_rate:     row.rate,
        p_currency: row.currency,
        p_period:   row.period,
      });
    } catch (err) {
      results[`${row.key}_error`] = String(err);
    }
  }

  return NextResponse.json({
    ok: true,
    synced: rateRows.length,
    rates: results,
    timestamp: new Date().toISOString(),
  });
}

// VPS health check
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, job: 'sync-rates' });
}
