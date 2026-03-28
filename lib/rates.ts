import type { LiveRatesData } from '@/lib/types';

// Fallback rates (used if all APIs fail)
export const FALLBACK_RATES: LiveRatesData = {
  success: false,
  note: 'Using cached fallback rates — live data unavailable',
  euribor: {
    euribor3m: { label: 'EURIBOR 3M', rate: 2.011, period: '2026-02' },
    euribor6m: { label: 'EURIBOR 6M', rate: 2.144, period: '2026-02' },
    euribor12m: { label: 'EURIBOR 12M', rate: 2.221, period: '2026-02' },
  },
  centralBankRates: {
    ecb: { label: 'ECB Deposit Rate', rate: 2.5, currency: 'EUR', period: '2025-12-18' },
    norges: { label: 'Norges Bank', rate: 4.5, currency: 'NOK', period: '2025-12-19' },
    riksbank: { label: 'Riksbank (Sweden)', rate: 2.5, currency: 'SEK', period: '2025-11-07' },
    nationalbank: { label: 'Danmarks Nationalbank', rate: 2.85, currency: 'DKK', period: '2025-12-18' },
    centralbank_is: { label: 'Central Bank of Iceland', rate: 9.0, currency: 'ISK', period: '2025-11-06' },
  },
  fetchedAt: new Date().toISOString(),
};

/** Parse ECB / Norges Bank SDMX-JSON response */
function parseSDMXResponse(json: Record<string, unknown>, label: string) {
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
    const period = structure.dimensions.observation[0].values[lastKey]?.id ?? 'N/A';
    return { label, rate: Math.round(rate * 1000) / 1000, period };
  } catch {
    return null;
  }
}

async function fetchEuribor(series: string, label: string) {
  const url = `https://data-api.ecb.europa.eu/service/data/FM/M.U2.EUR.RT.MM.${series}_.HSTA?lastNObservations=1&format=jsondata`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`ECB ${series}: ${res.status}`);
  const json = await res.json();
  const parsed = parseSDMXResponse(json, label);
  if (!parsed) throw new Error(`ECB parse error for ${series}`);
  return parsed;
}

async function fetchNorgesBank() {
  const url = 'https://data.norges-bank.no/api/data/IR/B.KPRA.SD.I?lastNObservations=1&format=sdmx-json';
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Norges Bank: ${res.status}`);
  const json = await res.json();
  const parsed = parseSDMXResponse(json, 'Norges Bank');
  return parsed ? { ...parsed, currency: 'NOK' } : null;
}

/** Fetch all live rates — call directly from server components, no HTTP round-trip */
export async function fetchAllRates(): Promise<LiveRatesData> {
  const result: LiveRatesData = {
    ...FALLBACK_RATES,
    fetchedAt: new Date().toISOString(),
    success: false,
  };

  // EURIBOR from ECB
  try {
    const [euribor3m, euribor6m, euribor12m] = await Promise.all([
      fetchEuribor('EURIBOR3MD', 'EURIBOR 3M'),
      fetchEuribor('EURIBOR6MD', 'EURIBOR 6M'),
      fetchEuribor('EURIBOR1YD', 'EURIBOR 12M'),
    ]);
    result.euribor = { euribor3m, euribor6m, euribor12m };
    result.success = true;
  } catch (err) {
    console.warn('[rates] ECB EURIBOR fetch failed:', err);
  }

  // Norges Bank key rate
  try {
    const norges = await fetchNorgesBank();
    if (norges) {
      result.centralBankRates = {
        ...result.centralBankRates,
        norges: { label: 'Norges Bank', rate: norges.rate, currency: 'NOK', period: norges.period },
      };
    }
  } catch (err) {
    console.warn('[rates] Norges Bank fetch failed:', err);
  }

  return result;
}
