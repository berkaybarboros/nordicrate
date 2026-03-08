'use client';

import { useState } from 'react';
import { COUNTRIES } from '@/lib/data';
import { getCountryStats } from '@/lib/utils';
import CountryCard from '@/components/CountryCard';
import type { Region } from '@/lib/types';

export default function CountriesPage() {
  const [region, setRegion] = useState<Region | 'all'>('all');

  const displayed = COUNTRIES.filter((c) => region === 'all' || c.region === region);

  const countryStats = displayed.map((c) => ({
    country: c,
    ...getCountryStats(c.code),
  }));

  // Overview numbers
  const totalNordic = COUNTRIES.filter((c) => c.region === 'nordic').length;
  const totalBaltic = COUNTRIES.filter((c) => c.region === 'baltic').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          🌍 Countries Overview
        </h1>
        <p className="text-slate-500">
          Explore credit markets across {COUNTRIES.length} Nordic & Baltic countries — from Reykjavik to Vilnius.
        </p>
      </div>

      {/* Region info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">❄️</span>
            <h2 className="text-lg font-bold text-blue-900">Nordic Region</h2>
            <span className="ml-auto bg-blue-100 text-blue-700 text-sm font-semibold px-2.5 py-1 rounded-full">
              {totalNordic} countries
            </span>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed mb-3">
            Denmark, Finland, Iceland, Norway, and Sweden — characterised by high living standards, strong
            welfare systems, and mature, well-regulated financial markets. Mortgage markets are highly
            developed, with rates typically below the European average.
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.filter((c) => c.region === 'nordic').map((c) => (
              <span key={c.code} className="text-xl" title={c.name}>{c.flag}</span>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🌊</span>
            <h2 className="text-lg font-bold text-emerald-900">Baltic Region</h2>
            <span className="ml-auto bg-emerald-100 text-emerald-700 text-sm font-semibold px-2.5 py-1 rounded-full">
              {totalBaltic} countries
            </span>
          </div>
          <p className="text-sm text-emerald-800 leading-relaxed mb-3">
            Estonia, Latvia, and Lithuania — all EU and Eurozone members, with fast-growing economies and
            increasingly sophisticated credit markets. Consumer and business loan rates are generally
            higher than in the Nordics but are converging.
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.filter((c) => c.region === 'baltic').map((c) => (
              <span key={c.code} className="text-xl" title={c.name}>{c.flag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium text-slate-600">Show:</span>
        {(['all', 'nordic', 'baltic'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              region === r
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-400 bg-white'
            }`}
          >
            {r === 'all' ? 'All Countries' : `${r.charAt(0).toUpperCase() + r.slice(1)}`}
          </button>
        ))}
        <span className="text-sm text-slate-400 ml-auto">{displayed.length} countries</span>
      </div>

      {/* Country cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {countryStats.map(({ country, institutions, products, avgPersonalRate, avgMortgageRate, avgBusinessRate }) => (
          <CountryCard
            key={country.code}
            country={country}
            institutionCount={institutions}
            productCount={products}
            avgPersonalRate={avgPersonalRate}
            avgMortgageRate={avgMortgageRate}
            avgBusinessRate={avgBusinessRate}
          />
        ))}
      </div>

      {/* Currency overview */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Currencies at a Glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 font-semibold text-slate-600">Country</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-600">Currency</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-600">EU Member</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-600">Eurozone</th>
                <th className="text-left py-2 font-semibold text-slate-600">Population</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRIES.map((c) => (
                <tr key={c.code} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2">
                      {c.flag} <span className="font-medium text-slate-900">{c.name}</span>
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-slate-700">{c.currency}</td>
                  <td className="py-2.5 pr-4">
                    {c.inEU ? (
                      <span className="text-emerald-600 font-medium">✓ Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    {c.inEurozone ? (
                      <span className="text-emerald-600 font-medium">✓ Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="py-2.5 text-slate-600">{c.population}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
