import { fetchAllRates, formatPeriod } from '@/lib/rates';

export const dynamic = 'force-dynamic';

export default async function LiveRatesBanner() {
  // Direct function call — no HTTP self-call, always fresh
  const data = await fetchAllRates();

  const euriborRates = [data.euribor.euribor3m, data.euribor.euribor6m, data.euribor.euribor12m];
  const centralRates = Object.values(data.centralBankRates);
  const isLive = data.success;

  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Header */}
        {/* 2026-10: Eskiden "Live Market Rates · Updated HH:MM" — saat sayfanın render
            anıydı ve Riksbank / Danmarks Nationalbank / Seðlabanki hiç çekilmeyen sabit
            değerlerdi. Artık her oran kendi dönemini ve canlı/statik durumunu gösterir. */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
              <span
                className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
              Reference Rates
            </span>
            <span className="text-xs text-slate-400">
              EURIBOR via ECB Data Portal · Norges Bank via its API · others static
            </span>
          </div>
          <span className="text-xs text-slate-400">Each rate shows the period it refers to</span>
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
                  <p className="text-xs text-slate-400">
                    {formatPeriod(r.period)}
                    {r.source !== 'live' && ' · static'}
                  </p>
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
                <p className="text-xs text-slate-400">
                  {r.currency} · {formatPeriod(r.period)}
                  {r.source !== 'live' && ' · static'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {!isLive && (
          <p className="text-xs text-amber-400 mt-2">
            ⚠️ Showing static reference rates — the ECB data portal could not be reached.
          </p>
        )}
      </div>
    </div>
  );
}
