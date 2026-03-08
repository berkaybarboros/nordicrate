'use client';

import { useState } from 'react';
import { PROGRAMS, PROGRAM_TYPE_LABELS, PROGRAM_TYPE_ICONS } from '@/lib/programs-data';
import type { GovernmentProgram } from '@/lib/types';
import ProgramCard from '@/components/ProgramCard';

type Tab = 'all' | 'digital_nomad' | 'e_residency' | 'startup' | 'government' | 'eu';

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'all', label: 'All Programs', icon: '🌍', desc: `${PROGRAMS.length} programs` },
  { id: 'digital_nomad', label: 'Digital Nomad', icon: '🌐', desc: 'Visas & banking for remote workers' },
  { id: 'e_residency', label: 'e-Residency', icon: '🪪', desc: 'Digital identity & EU company' },
  { id: 'startup', label: 'Startup & SME', icon: '🚀', desc: 'Loans, grants & guarantees' },
  { id: 'government', label: 'Government Loans', icon: '🏦', desc: 'State-backed financing' },
  { id: 'eu', label: 'EU Funds', icon: '🇪🇺', desc: 'European investment programs' },
];

function filterByTab(programs: GovernmentProgram[], tab: Tab): GovernmentProgram[] {
  switch (tab) {
    case 'digital_nomad':
      return programs.filter(
        (p) =>
          p.isDigitalNomadFriendly ||
          p.type === 'digital_nomad_visa' ||
          p.type === 'startup_visa' ||
          p.audience.includes('digital_nomad') ||
          p.audience.includes('freelancer')
      );
    case 'e_residency':
      return programs.filter(
        (p) =>
          p.isEResidentFriendly ||
          p.type === 'e_residency' ||
          p.audience.includes('e_resident')
      );
    case 'startup':
      return programs.filter(
        (p) =>
          p.type === 'startup_loan' ||
          p.type === 'microloan' ||
          p.type === 'guarantee' ||
          p.type === 'grant' ||
          p.type === 'innovation_fund' ||
          p.audience.includes('startup') ||
          p.audience.includes('sme')
      );
    case 'government':
      return programs.filter(
        (p) =>
          p.type === 'government_loan' ||
          p.type === 'startup_loan' ||
          p.type === 'microloan' ||
          p.type === 'export_credit'
      );
    case 'eu':
      return programs.filter((p) => p.country === 'EU' || p.type === 'eu_fund');
    default:
      return programs;
  }
}

export default function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const countries = [
    { code: 'all', label: 'All Countries', flag: '🌍' },
    { code: 'EE', label: 'Estonia', flag: '🇪🇪' },
    { code: 'LV', label: 'Latvia', flag: '🇱🇻' },
    { code: 'LT', label: 'Lithuania', flag: '🇱🇹' },
    { code: 'FI', label: 'Finland', flag: '🇫🇮' },
    { code: 'NO', label: 'Norway', flag: '🇳🇴' },
    { code: 'SE', label: 'Sweden', flag: '🇸🇪' },
    { code: 'DK', label: 'Denmark', flag: '🇩🇰' },
    { code: 'IS', label: 'Iceland', flag: '🇮🇸' },
    { code: 'EU', label: 'EU-Wide', flag: '🇪🇺' },
  ];

  let filtered = filterByTab(PROGRAMS, activeTab);
  if (countryFilter !== 'all') {
    filtered = filtered.filter((p) => p.country === countryFilter);
  }

  const digitalNomadCount = PROGRAMS.filter((p) => p.isDigitalNomadFriendly || p.type === 'digital_nomad_visa').length;
  const eResidencyCount = PROGRAMS.filter((p) => p.isEResidentFriendly || p.type === 'e_residency').length;
  const startupCount = PROGRAMS.filter((p) => p.audience.includes('startup')).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🏛️</span>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Government & Startup Programs</h1>
            <p className="text-slate-500 mt-1">
              Financial support, visas, and digital services for digital nomads, e-residents, and entrepreneurs in Nordic & Baltic countries.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { value: PROGRAMS.length, label: 'Total Programs', icon: '📋' },
            { value: digitalNomadCount, label: 'Nomad-Friendly', icon: '🌐' },
            { value: eResidencyCount, label: 'e-Resident Services', icon: '🪪' },
            { value: startupCount, label: 'Startup Programs', icon: '🚀' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-extrabold text-slate-900">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Nomad / e-Residency Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        <div className="bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🌐</span>
            <h2 className="text-lg font-bold text-sky-900">Digital Nomad Hub</h2>
          </div>
          <p className="text-sm text-sky-800 leading-relaxed mb-4">
            The Nordic & Baltic region is one of the best in the world for digital nomads. Estonia leads globally with the first digital nomad visa (2020), Latvia and Lithuania followed. Pair your visa with an EU bank account and e-Residency for full remote business freedom.
          </p>
          <div className="flex flex-wrap gap-2">
            {['🇪🇪 Estonia #1', '🇱🇻 Latvia', '🇱🇹 Lithuania', '🇮🇸 Iceland', '🇳🇴 Svalbard'].map((t) => (
              <span key={t} className="text-xs bg-sky-200 text-sky-800 px-2.5 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-teal-100 border border-cyan-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🪪</span>
            <h2 className="text-lg font-bold text-cyan-900">e-Residency & Digital Business</h2>
          </div>
          <p className="text-sm text-cyan-800 leading-relaxed mb-4">
            Estonia's e-Residency program lets anyone in the world register an EU company and access banking remotely. Over 100,000 e-residents from 170+ countries use it. Open an LHV or Wise Business account with your digital ID card.
          </p>
          <div className="flex flex-wrap gap-2">
            {['🇪🇪 EU Company', '🏦 LHV Banking', '💳 Wise Business', '🔐 Digital ID', '⚡ Instant'].map((t) => (
              <span key={t} className="text-xs bg-cyan-200 text-cyan-800 px-2.5 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-1">
          {TABS.map((tab) => {
            const count = filterByTab(PROGRAMS, tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Country filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {countries.map((c) => (
          <button
            key={c.code}
            onClick={() => setCountryFilter(c.code)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              countryFilter === c.code
                ? 'bg-slate-800 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            <span>{c.flag}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{filtered.length}</span> programs found
        </p>
        {(activeTab !== 'all' || countryFilter !== 'all') && (
          <button
            onClick={() => { setActiveTab('all'); setCountryFilter('all'); }}
            className="text-xs text-sky-600 hover:text-sky-800 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Program cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-semibold text-slate-700 mb-2">No programs match your filters</p>
          <button
            onClick={() => { setActiveTab('all'); setCountryFilter('all'); }}
            className="text-sky-600 hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
        <strong>ℹ️ Disclaimer:</strong> Program details, eligibility criteria, and amounts are subject to change.
        Always verify directly with the institution or government body before applying.
        NordicRate is an independent information platform and does not provide legal or financial advice.
      </div>
    </div>
  );
}
