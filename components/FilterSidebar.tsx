'use client';

import type { CountryCode, InstitutionType, LoanType, CustomerType, Region } from '@/lib/types';
import { COUNTRIES } from '@/lib/data';
import { LOAN_TYPE_LABELS } from '@/lib/utils';
import CountryFlag from './CountryFlag';

export interface FilterState {
  region: Region | 'all';
  countries: CountryCode[];
  customerType: CustomerType | 'all';
  institutionTypes: InstitutionType[];
  loanTypes: LoanType[];
  sortBy: 'rateMin' | 'limitMax' | 'updatedAt';
  amountMin: number;
  amountMax: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableLoanTypes?: LoanType[];
}

const INSTITUTION_TYPE_OPTIONS: { value: InstitutionType; label: string }[] = [
  { value: 'bank', label: 'Bank' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'government', label: 'Government' },
];

/** Bölüm başlığı — tutarlı tipografi tek yerden */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
      {children}
    </p>
  );
}

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
      amountMin: 0,
      amountMax: 1000000,
    });
  }

  const loanTypeOptions = (availableLoanTypes ?? (Object.keys(LOAN_TYPE_LABELS) as LoanType[]));
  const activeCount =
    filters.countries.length +
    filters.institutionTypes.length +
    filters.loanTypes.length +
    (filters.customerType !== 'all' ? 1 : 0) +
    (filters.amountMin > 0 ? 1 : 0) +
    (filters.amountMax < 1000000 ? 1 : 0);

  const countryChip = (c: (typeof COUNTRIES)[number]) => {
    const active = filters.countries.includes(c.code);
    return (
      <button
        key={c.code}
        onClick={() => toggleCountry(c.code)}
        aria-pressed={active}
        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
          active
            ? 'bg-sky-50 border-sky-300 text-sky-800'
            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <CountryFlag code={c.code} size={16} rounded="sm" />
        {c.code}
      </button>
    );
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          Filters
          {activeCount > 0 && (
            <span className="bg-sky-600 text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-[11px] font-bold">
              {activeCount}
            </span>
          )}
        </h2>
        <button
          onClick={clearAll}
          className="text-xs text-slate-400 hover:text-sky-700 font-medium transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Sort — en çok kullanılan kontrol en üstte */}
      <div>
        <SectionLabel>Sort by</SectionLabel>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <option value="rateMin">Lowest rate first</option>
          <option value="limitMax">Highest limit first</option>
          <option value="updatedAt">Recently updated</option>
        </select>
      </div>

      {/* Loan amount range */}
      <div>
        <SectionLabel>Loan amount</SectionLabel>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Min</span>
              <span className="font-semibold text-slate-800">
                {filters.amountMin > 0 ? `€${(filters.amountMin / 1000).toFixed(0)}K` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={200000}
              step={5000}
              value={filters.amountMin}
              onChange={(e) => onChange({ ...filters, amountMin: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Max</span>
              <span className="font-semibold text-slate-800">
                {filters.amountMax < 1000000 ? `€${(filters.amountMax / 1000).toFixed(0)}K` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={1000000}
              step={5000}
              value={filters.amountMax}
              onChange={(e) => onChange({ ...filters, amountMax: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>
        </div>
      </div>

      {/* Customer type */}
      <div>
        <SectionLabel>Customer type</SectionLabel>
        <div className="grid grid-cols-3 gap-1.5">
          {(['all', 'individual', 'corporate'] as const).map((ct) => (
            <button
              key={ct}
              onClick={() => onChange({ ...filters, customerType: ct })}
              aria-pressed={filters.customerType === ct}
              className={`text-xs font-semibold py-2 rounded-lg border transition-colors ${
                filters.customerType === ct
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {ct === 'all' ? 'All' : ct === 'individual' ? 'Personal' : 'Business'}
            </button>
          ))}
        </div>
      </div>

      {/* Loan types */}
      {loanTypeOptions.length > 1 && (
        <div>
          <SectionLabel>Loan type</SectionLabel>
          <div className="space-y-1">
            {loanTypeOptions.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2.5 cursor-pointer group rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.loanTypes.includes(type)}
                  onChange={() => toggleLoanType(type)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                  {LOAN_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Institution type */}
      <div>
        <SectionLabel>Institution</SectionLabel>
        <div className="space-y-1">
          {INSTITUTION_TYPE_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 transition-colors"
            >
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

      {/* Region + countries */}
      <div>
        <SectionLabel>Region</SectionLabel>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {(['all', 'nordic', 'baltic'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              aria-pressed={filters.region === r}
              className={`text-xs font-semibold py-2 rounded-lg border transition-colors capitalize ${
                filters.region === r
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 font-medium mb-1.5">Nordic</p>
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {nordicCountries.map(countryChip)}
        </div>
        <p className="text-xs text-slate-400 font-medium mb-1.5">Baltic</p>
        <div className="grid grid-cols-3 gap-1.5">
          {balticCountries.map(countryChip)}
        </div>
      </div>
    </aside>
  );
}
