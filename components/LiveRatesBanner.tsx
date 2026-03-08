import type { LiveRatesData } from '@/lib/types';

async function fetchRates(): Promise<LiveRatesData | null> {
  try {
    // In production this calls our own /api/rates route (server-side)
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/rates`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function LiveRatesBanner() {
  const data = await fetchRates();

  // Fallback if API unreachable at SSR time
  const euribor = data?.euribor ?? {
    euribor3m: { label: 'EURIBOR 3M', rate: 2.456, period: '2025-10' },
    euribor6m: { label: 'EURIBOR 6M', rate: 2.589, period: '2025-10' },
    euribor12m: { label: 'EURIBOR 12M', rate: 2.734, period: '2025-10' },
  };
  const cbRates = data?.centralBankRates ?? {
    norges: { label: 'Norges Bank', rate: 4.5, currency: 'NOK', period: '2025-11' },
    riksbank: { label: 'Riksbank', rate: 2.75, currency: 'SEK', period: '2025-11' },
    nationalbank: { label: 'Danmarks Nationalbank', rate: 3.1, currency: 'DKK', period: '2025-10' },
    centralbank_is: { label: 'Central Bank of Iceland', rate: 9.0, currency: 'ISK', period: '2025-11' },
    ecb: { label: 'ECB Deposit Rate', rate: 3.15, currency: 'EUR', period: '2025-10' },
  };

  const fetchedAt = data?.fetchedAt ? new Date(data.fetchedAt) : new Date();
  const isLive = data?.success ?? false;

  const euriborRates = [euribor.euribor3m, euribor.euribor6m, euribor.euribor12m];
  const centralRates = Object.values(cbRates);

  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
              <span
                className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
              />
              {isLive ? 'Live Market Rates' : 'Reference Rates'}
            </span>
            <span className="text-xs text-slate-500">
              via ECB Data Portal & Norges Bank API
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Updated:{' '}
            {fetchedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{' '}
            {fetchedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* EURIBOR */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            🇪🇺 EURIBOR (Base rate for EUR mortgages — EE, LV, LT, FI)
          </p>
          <div className="grid grid-cols-3 gap-3">
            {euriborRates.map((r) => (
              <div
                key={r.label}
                className="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-slate-400">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.period}</p>
                </div>
                <p
                  className={`text-xl font-bold ${
                    r.rate <= 2.5
                      ? 'text-emerald-400'
                      : r.rate <= 4
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {r.rate.toFixed(3)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Central Bank Rates */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            🏛️ Central Bank Key Rates
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {centralRates.map((r) => (
              <div
                key={r.label}
                className="bg-slate-800/60 rounded-xl px-3 py-2.5 text-center"
              >
                <p className="text-xs text-slate-400 mb-1 truncate">{r.label}</p>
                <p
                  className={`text-lg font-bold ${
                    r.rate <= 3
                      ? 'text-emerald-400'
                      : r.rate <= 6
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {r.rate.toFixed(2)}%
                </p>
                <p className="text-xs text-slate-500">{r.currency}</p>
              </div>
            ))}
          </div>
        </div>

        {!isLive && (
          <p className="text-xs text-amber-400 mt-2">
            ⚠️ Showing cached reference rates. Live API data temporarily unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
