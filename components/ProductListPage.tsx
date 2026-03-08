'use client';

import { useState, useMemo } from 'react';
import type { LoanProduct, LoanType } from '@/lib/types';
import { INSTITUTIONS, COUNTRIES } from '@/lib/data';
import { getInstitution, getCountry } from '@/lib/utils';
import RateCard from './RateCard';
import FilterSidebar, { type FilterState } from './FilterSidebar';

interface ProductListPageProps {
  title: string;
  subtitle: string;
  icon: string;
  allProducts: LoanProduct[];
  availableLoanTypes?: LoanType[];
  defaultFilters?: Partial<FilterState>;
}

const DEFAULT_FILTERS: FilterState = {
  region: 'all',
  countries: [],
  customerType: 'all',
  institutionTypes: [],
  loanTypes: [],
  sortBy: 'rateMin',
};

export default function ProductListPage({
  title,
  subtitle,
  icon,
  allProducts,
  availableLoanTypes,
  defaultFilters,
}: ProductListPageProps) {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, ...defaultFilters });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    // Customer type
    if (filters.customerType !== 'all') {
      result = result.filter((p) => p.customerType === filters.customerType);
    }

    // Loan types
    if (filters.loanTypes.length > 0) {
      result = result.filter((p) => filters.loanTypes.includes(p.type));
    }

    // Countries
    if (filters.countries.length > 0) {
      result = result.filter((p) => {
        const inst = INSTITUTIONS.find((i) => i.id === p.institutionId);
        return inst && filters.countries.includes(inst.country);
      });
    }

    // Institution types
    if (filters.institutionTypes.length > 0) {
      result = result.filter((p) => {
        const inst = INSTITUTIONS.find((i) => i.id === p.institutionId);
        return inst && filters.institutionTypes.includes(inst.type);
      });
    }

    // Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'rateMin') return a.rateMin - b.rateMin;
      if (filters.sortBy === 'limitMax') return b.limitMax - a.limitMax;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [allProducts, filters]);

  const hasActiveFilters =
    filters.countries.length > 0 ||
    filters.customerType !== 'all' ||
    filters.institutionTypes.length > 0 ||
    filters.loanTypes.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{icon}</span>
          <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
        </div>
        <p className="text-slate-500">{subtitle}</p>
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-sky-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters {hasActiveFilters && <span className="bg-sky-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">!</span>}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0`}>
          <div className="sticky top-20">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              availableLoanTypes={availableLoanTypes}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Results bar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{filtered.length}</span> products found
              {hasActiveFilters && ' (filtered)'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ ...DEFAULT_FILTERS, ...defaultFilters })}
                className="text-xs text-sky-600 hover:text-sky-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg font-semibold text-slate-700 mb-2">No products match your filters</p>
              <p className="text-slate-500 text-sm mb-4">Try adjusting or clearing your filters</p>
              <button
                onClick={() => setFilters({ ...DEFAULT_FILTERS, ...defaultFilters })}
                className="bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((product) => {
                const inst = getInstitution(product.institutionId);
                const country = inst ? getCountry(inst.country) : null;
                if (!inst || !country) return null;
                return (
                  <RateCard key={product.id} product={product} institution={inst} country={country} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
