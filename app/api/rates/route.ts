import { NextResponse } from 'next/server';
import type { LiveRatesData } from '@/lib/types';

// Fallback rates (used if APIs are unavailable)
const FALLBACK: LiveRatesData = {
  success: false,
  note: 'Using cached fallback rates — live data unavailable',
  euribor: {
    euribor3m: { label: 'EURIBOR 3M', rate: 2.456, period: '2025-10' },
    euribor6m: { label: 'EURIBOR 6M', rate: 2.589, period: '2025-10' },
    euribor12m: { label: 'EURIBOR 12M', rate: 2.734, period: '2025-10' },
  },
  centralBankRates: {
    ecb: { label: 'ECB Deposit Rate', rate: 3.15, currency: 'EUR', period: '2025-10-17' },
    norges: { label: 'Norges Bank', rate: 4.5, currency: 'NOK', period: '2025-11-07' },
    riksbank: { label: 'Riksbank (Sweden)', rate: 2.75, currency: 'SEK', period: '2025-11-07' },
    nationalbank: { label: 'Danmarks Nationalbank', rate: 3.1, currency: 'DKK', period: '2025-10-24' },
    centralbank_is: { label: 'Central Bank of Iceland', rate: 9.0, currency: 'ISK', period: '2025-11-06' },
  },
  fetchedAt: new Date().toISOString(),
};

/** Parse ECB SDMX-JSON response and extract latest rate + period */
function parseECBResponse(json: Record<string, unknown>, label: string) {
  try {
    const dataSets = json.dataSets as Array<{ series: Record<string, { observations: Record<string, number[]> }> }>;
    const structure = json.structure as { dimensions: { observation: Array<{ values: Array<{ id: string }> }> } };

    const seriesKey = Object.keys(dataSets[0].series)[0];
    const observations = dataSets[0].series[seriesKey].observations;
    const obsKeys = Object.keys(observations).map(Number).sort((a, b) => a - b);
    const lastKey = obsKeys[obsKeys.length - 1];
    const rate = observations[lastKey][0];
    const period = structure.dimensions.observation[0].values[lastKey]?.id ?? 'N/A';
    return { label, rate: Math.round(rate * 1000) / 1000, period };
  } catch {
    return null;
  }
}

async function fetchEuribor(series: string, label: string) {
  const url = `https://data-api.ecb.europa.eu/service/data/FM/M.U2.EUR.RT0.MM.${series}_.HSTA?lastNObservations=1&format=jsondata`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`ECB ${series}: ${res.status}`);
  const json = await res.json();
  const parsed = parseECBResponse(json, label);
  if (!parsed) throw new Error(`ECB parse error for ${series}`);
  return parsed;
}

async function fetchNorgesBank() {
  // Norges Bank SDMX-JSON API — key policy rate (sight deposit rate)
  const url =
    'https://data.norges-bank.no/api/data/IR/B.KPRA.SD.I?lastNObservations=1&format=sdmx-json';
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Norges Bank: ${res.status}`);
  const json = await res.json();
  // Norges Bank SDMX JSON has same structure as ECB
  const parsed = parseECBResponse(json, 'Norges Bank');
  return parsed ? { ...parsed, currency: 'NOK' } : null;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Partial<LiveRatesData> = {
    euribor: { ...FALLBACK.euribor },
    centralBankRates: { ...FALLBACK.centralBankRates },
    fetchedAt: new Date().toISOString(),
    success: false,
  };

  // Fetch EURIBOR (ECB API)
  try {
    const [euribor3m, euribor6m, euribor12m] = await Promise.all([
      fetchEuribor('EURIBOR3MD', 'EURIBOR 3M'),
      fetchEuribor('EURIBOR6MD', 'EURIBOR 6M'),
      fetchEuribor('EURIBOR1YD', 'EURIBOR 12M'),
    ]);
    results.euribor = { euribor3m, euribor6m, euribor12m };
    results.success = true;
  } catch (err) {
    console.warn('ECB EURIBOR fetch failed:', err);
  }

  // Fetch Norges Bank rate
  try {
    const norges = await fetchNorgesBank();
    if (norges) {
      results.centralBankRates = {
        ...results.centralBankRates,
        norges: { label: 'Norges Bank', rate: norges.rate, currency: 'NOK', period: norges.period },
      };
    }
  } catch (err) {
    console.warn('Norges Bank fetch failed:', err);
  }

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
