'use client';

import type { CountryCode, InstitutionType, LoanType, CustomerType, Region } from '@/lib/types';
import { COUNTRIES } from '@/lib/data';
import { LOAN_TYPE_LABELS, LOAN_TYPE_ICONS } from '@/lib/utils';

export interface FilterState {
  region: Region | 'all';
  countries: CountryCode[];
  customerType: CustomerType | 'all';
  institutionTypes: InstitutionType[];
  loanTypes: LoanType[];
  sortBy: 'rateMin' | 'limitMax' | 'updatedAt';
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableLoanTypes?: LoanType[];
}

const INSTITUTION_TYPE_OPTIONS: { value: InstitutionType; label: string }[] = [
  { value: 'bank', label: '🏦 Bank' },
  { value: 'insurance', label: '🛡️ Insurance' },
];

export default function FilterSidebar({ filters, onChange, availableLoanTypes }: FilterSidebarProps) {
  const nordicCountries = COUNTRIES.filter((c) => c.region === 'nordic');
  const balticCountries = COUNTRIES.filter((c) => c.region === 'baltic');

  function toggleCountry(code: CountryCode) {
    const next = filters.countries.includes(code)
      ? filters.countries.filter((c) => c !== code)
      : [...filters.countries, code];
    onChange({ ...filters, countries: next });
  }

  function toggleInstType(type: InstitutionType) {
    const next = filters.institutionTypes.includes(type)
      ? filters.institutionTypes.filter((t) => t !== type)
      : [...filters.institutionTypes, type];
    onChange({ ...filters, institutionTypes: next });
  }

  function toggleLoanType(type: LoanType) {
    const next = filters.loanTypes.includes(type)
      ? filters.loanTypes.filter((t) => t !== type)
      : [...filters.loanTypes, type];
    onChange({ ...filters, loanTypes: next });
  }

  function setRegion(region: Region | 'all') {
    if (region === 'all') {
      onChange({ ...filters, region: 'all', countries: [] });
    } else {
      const countryCodes = COUNTRIES.filter((c) => c.region === region).map((c) => c.code);
      onChange({ ...filters, region, countries: countryCodes });
    }
  }

  function clearAll() {
    onChange({
      region: 'all',
      countries: [],
      customerType: 'all',
      institutionTypes: [],
      loanTypes: [],
      sortBy: 'rateMin',
    });
  }

  const loanTypeOptions = (availableLoanTypes ?? (Object.keys(LOAN_TYPE_LABELS) as LoanType[]));

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Filters</h2>
        <button onClick={clearAll} className="text-xs text-sky-600 hover:text-sky-800 font-medium">
          Clear all
        </button>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Sort by
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <option value="rateMin">Lowest Rate First</option>
          <option value="limitMax">Highest Limit First</option>
          <option value="updatedAt">Recently Updated</option>
        </select>
      </div>

      {/* Customer type */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Customer Type
        </label>
        <div className="flex gap-2">
          {(['all', 'individual', 'corporate'] as const).map((ct) => (
            <button
              key={ct}
              onClick={() => onChange({ ...filters, customerType: ct })}
              className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors ${
                filters.customerType === ct
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {ct === 'all' ? 'All' : ct === 'individual' ? '👤 Individual' : '🏢 Corporate'}
            </button>
          ))}
        </div>
      </div>

      {/* Loan types (if multiple available) */}
      {loanTypeOptions.length > 1 && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Loan Type
          </label>
          <div className="space-y-2">
            {loanTypeOptions.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.loanTypes.includes(type)}
                  onChange={() => toggleLoanType(type)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                  {LOAN_TYPE_ICONS[type]} {LOAN_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Institution type */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Institution Type
        </label>
        <div className="space-y-2">
          {INSTITUTION_TYPE_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.institutionTypes.includes(value)}
                onChange={() => toggleInstType(value)}
                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Region quick filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Region
        </label>
        <div className="flex gap-2">
          {(['all', 'nordic', 'baltic'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors capitalize ${
                filters.region === r
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Countries */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Countries
        </label>
        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-medium mb-1">Nordic</p>
          {nordicCountries.map((c) => (
            <label key={c.code} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.countries.includes(c.code)}
                onChange={() => toggleCountry(c.code)}
                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 flex items-center gap-1.5">
                {c.flag} {c.name}
              </span>
            </label>
          ))}
          <p className="text-xs text-slate-400 font-medium mt-2 mb-1">Baltic</p>
          {balticCountries.map((c) => (
            <label key={c.code} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.countries.includes(c.code)}
                onChange={() => toggleCountry(c.code)}
                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 flex items-center gap-1.5">
                {c.flag} {c.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
