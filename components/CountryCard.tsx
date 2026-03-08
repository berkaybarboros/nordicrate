import type { CountryInfo } from '@/lib/types';
import Link from 'next/link';

interface CountryCardProps {
  country: CountryInfo;
  institutionCount: number;
  productCount: number;
  avgPersonalRate: number | null;
  avgMortgageRate: number | null;
  avgBusinessRate: number | null;
}

export default function CountryCard({
  country,
  institutionCount,
  productCount,
  avgPersonalRate,
  avgMortgageRate,
  avgBusinessRate,
}: CountryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Region stripe */}
      <div className={`h-1.5 ${country.region === 'nordic' ? 'bg-blue-500' : 'bg-emerald-500'}`} />

      <div className="p-5">
        {/* Flag + name */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{country.flag}</span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{country.name}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                country.region === 'nordic'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {country.region}
              </span>
              <span className="text-xs text-slate-500">{country.currency}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-4 text-center">
          <div className="flex-1 bg-slate-50 rounded-xl p-2">
            <p className="text-lg font-bold text-slate-900">{institutionCount}</p>
            <p className="text-xs text-slate-500">Institutions</p>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl p-2">
            <p className="text-lg font-bold text-slate-900">{productCount}</p>
            <p className="text-xs text-slate-500">Products</p>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl p-2">
            <p className="text-xs font-medium text-slate-700">{country.capital}</p>
            <p className="text-xs text-slate-400">Capital</p>
          </div>
        </div>

        {/* Average rates */}
        <div className="space-y-2 mb-4">
          {avgPersonalRate !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">👤 Personal loans</span>
              <span className="font-semibold text-slate-800">from {avgPersonalRate.toFixed(2)}%</span>
            </div>
          )}
          {avgMortgageRate !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">🏠 Mortgage</span>
              <span className="font-semibold text-slate-800">from {avgMortgageRate.toFixed(2)}%</span>
            </div>
          )}
          {avgBusinessRate !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">🏢 Business</span>
              <span className="font-semibold text-slate-800">from {avgBusinessRate.toFixed(2)}%</span>
            </div>
          )}
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {country.inEU && (
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">🇪🇺 EU</span>
          )}
          {country.inEurozone && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">€ Eurozone</span>
          )}
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{country.population}</span>
        </div>

        {/* CTA */}
        <Link
          href={`/loans?country=${country.code}`}
          className="block text-center bg-slate-900 hover:bg-sky-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          View {country.name} Rates →
        </Link>
      </div>
    </div>
  );
}
