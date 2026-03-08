import type { LoanProduct, Institution, CountryInfo } from '@/lib/types';
import {
  formatAmount,
  formatRate,
  formatTerm,
  getRateColor,
  getLoanTypeBadgeClass,
  getInstitutionTypeBadgeClass,
  LOAN_TYPE_LABELS,
  INSTITUTION_TYPE_LABELS,
  LOAN_TYPE_ICONS,
  CURRENCY_SYMBOLS,
} from '@/lib/utils';

interface RateCardProps {
  product: LoanProduct;
  institution: Institution;
  country: CountryInfo;
}

export default function RateCard({ product, institution, country }: RateCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        product.isPromoted ? 'border-sky-300 ring-1 ring-sky-200' : 'border-slate-200'
      }`}
    >
      {product.isPromoted && (
        <div className="bg-sky-500 text-white text-xs font-semibold text-center py-1 tracking-wide">
          ⭐ FEATURED OFFER
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            {/* Institution */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {institution.shortName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{institution.shortName}</p>
                <p className="text-xs text-slate-500 truncate">{institution.name}</p>
              </div>
            </div>
          </div>

          {/* Country */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xl">{country.flag}</span>
            <span className="text-xs text-slate-500 font-medium">{country.code}</span>
          </div>
        </div>

        {/* Product name + badges */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900 mb-2">{product.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${getLoanTypeBadgeClass(product.type)}`}>
              {LOAN_TYPE_ICONS[product.type]} {LOAN_TYPE_LABELS[product.type]}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getInstitutionTypeBadgeClass(institution.type)}`}>
              {INSTITUTION_TYPE_LABELS[institution.type]}
            </span>
            {product.collateralRequired && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Collateral
              </span>
            )}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Interest Rate</p>
            <p className={`text-lg font-bold ${getRateColor(product.rateMin)}`}>
              {formatRate(product.rateMin)}
            </p>
            <p className="text-xs text-slate-400">from</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Max Limit</p>
            <p className="text-base font-bold text-slate-800">
              {formatAmount(product.limitMax, product.currency)}
            </p>
            <p className="text-xs text-slate-400">{CURRENCY_SYMBOLS[product.currency]}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Max Term</p>
            <p className="text-base font-bold text-slate-800">
              {formatTerm(product.termMax)}
            </p>
            <p className="text-xs text-slate-400">up to</p>
          </div>
        </div>

        {/* Rate range */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <span>Rate range: <span className="font-medium text-slate-700">{formatRate(product.rateMin)} – {formatRate(product.rateMax)}</span></span>
          <span>Limit: <span className="font-medium text-slate-700">{formatAmount(product.limitMin, product.currency)} – {formatAmount(product.limitMax, product.currency)}</span></span>
        </div>

        {/* Features */}
        <div className="space-y-1 mb-4">
          {product.features.slice(0, 3).map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Updated {new Date(product.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
          <button className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
