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
  calculateMonthlyPayment,
} from '@/lib/utils';

interface RateCardProps {
  product: LoanProduct;
  institution: Institution;
  country: CountryInfo;
}

// Star rating based on rate quality
function StarRating({ rate }: { rate: number }) {
  const stars = rate <= 5 ? 5 : rate <= 8 ? 4 : rate <= 12 ? 3 : rate <= 18 ? 2 : 1;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < stars ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1 font-medium">
        {stars}.0
      </span>
    </div>
  );
}

export default function RateCard({ product, institution, country }: RateCardProps) {
  // Representative example: €10,000 over 60 months at product's min rate
  const repPrincipal = Math.min(10000, product.limitMax);
  const repMonths = Math.min(60, product.termMax);
  const repMonthly = calculateMonthlyPayment(repPrincipal, product.rateMin, repMonths);
  const repTotal = repMonthly * repMonths;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col ${
        product.isPromoted
          ? 'border-sky-300 ring-2 ring-sky-100'
          : 'border-slate-200 hover:border-sky-200'
      }`}
    >
      {/* Promoted banner */}
      {product.isPromoted && (
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold text-center py-1.5 tracking-widest uppercase">
          ⭐ Featured Offer
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header: institution + country */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
              product.isPromoted
                ? 'bg-sky-100 text-sky-700'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {institution.shortName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate leading-tight">{institution.shortName}</p>
              <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-md ${getInstitutionTypeBadgeClass(institution.type)}`}>
                {INSTITUTION_TYPE_LABELS[institution.type]}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-lg">{country.flag}</span>
              <span className="text-xs font-semibold text-slate-500">{country.code}</span>
            </div>
            <StarRating rate={product.rateMin} />
          </div>
        </div>

        {/* Product name + type badge */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-1.5 line-clamp-1">{product.name}</h3>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getLoanTypeBadgeClass(product.type)}`}>
            {LOAN_TYPE_ICONS[product.type]} {LOAN_TYPE_LABELS[product.type]}
          </span>
        </div>

        {/* BIG rate number — the hero metric */}
        <div className="bg-slate-50 rounded-xl p-4 mb-4 text-center">
          <p className={`text-4xl font-extrabold ${getRateColor(product.rateMin)}`}>
            {formatRate(product.rateMin)}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">APR from</p>
          {product.rateMax > product.rateMin && (
            <p className="text-xs text-slate-400 mt-0.5">
              up to {formatRate(product.rateMax)}
            </p>
          )}
        </div>

        {/* Key stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400 mb-0.5">Loan Range</p>
            <p className="text-xs font-semibold text-slate-700">
              {formatAmount(product.limitMin, product.currency)} – {formatAmount(product.limitMax, product.currency)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400 mb-0.5">Term</p>
            <p className="text-xs font-semibold text-slate-700">
              {formatTerm(product.termMin)} – {formatTerm(product.termMax)}
            </p>
          </div>
        </div>

        {/* Representative example */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs font-bold text-emerald-800 mb-1">Representative Example</p>
          <p className="text-xs text-emerald-700 leading-relaxed">
            {formatAmount(repPrincipal, product.currency)} over {formatTerm(repMonths)} ={' '}
            <strong>€{Math.round(repMonthly)}/mo</strong> · Total: €{Math.round(repTotal).toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 mt-1">at {formatRate(product.rateMin)} APR</p>
        </div>

        {/* Features */}
        <div className="space-y-1.5 mb-4 flex-1">
          {product.features.slice(0, 3).map((f) => (
            <div key={f} className="flex items-start gap-2 text-xs text-slate-600">
              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{f}</span>
            </div>
          ))}
          {product.collateralRequired && (
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <span className="text-amber-500">⚠</span> Collateral required
            </div>
          )}
        </div>

        {/* CTA + date */}
        <div className="border-t border-slate-100 pt-3 mt-auto">
          <a
            href={institution.website ?? '#'}
            target={institution.website ? '_blank' : undefined}
            rel={institution.website ? 'noopener noreferrer' : undefined}
            className="block w-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold py-3 rounded-xl text-center transition-colors shadow-md shadow-sky-100 mb-2"
          >
            Apply Now →
          </a>
          <p className="text-center text-xs text-slate-400">
            Updated {new Date(product.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            {institution.isDigitalFriendly && (
              <span className="ml-2 text-sky-500 font-medium">· 📱 100% Online</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
