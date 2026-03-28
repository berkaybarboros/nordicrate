import { fetchAllRates } from '@/lib/rates';

export const dynamic = 'force-dynamic';

export default async function LiveRatesBanner() {
  // Direct function call — no HTTP self-call, always fresh
  const data = await fetchAllRates();

  const euriborRates = [data.euribor.euribor3m, data.euribor.euribor6m, data.euribor.euribor12m];
  const centralRates = Object.values(data.centralBankRates);
  const fetchedAt = new Date(data.fetchedAt);
  const isLive = data.success;

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
