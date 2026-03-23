import type { GovernmentProgram } from '@/lib/types';
import { PROGRAM_TYPE_LABELS, PROGRAM_TYPE_ICONS, AUDIENCE_LABELS } from '@/lib/programs-data';
import CountryFlag from './CountryFlag';

interface ProgramCardProps {
  program: GovernmentProgram;
}

function typeBadgeClass(type: string) {
  const map: Record<string, string> = {
    government_loan: 'bg-blue-100 text-blue-800',
    grant: 'bg-emerald-100 text-emerald-800',
    guarantee: 'bg-purple-100 text-purple-800',
    e_residency: 'bg-cyan-100 text-cyan-800',
    digital_nomad_visa: 'bg-sky-100 text-sky-800',
    startup_visa: 'bg-indigo-100 text-indigo-800',
    eu_fund: 'bg-yellow-100 text-yellow-800',
    startup_loan: 'bg-orange-100 text-orange-800',
    microloan: 'bg-teal-100 text-teal-800',
    innovation_fund: 'bg-pink-100 text-pink-800',
    export_credit: 'bg-rose-100 text-rose-800',
  };
  return map[type] ?? 'bg-slate-100 text-slate-700';
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const icon = PROGRAM_TYPE_ICONS[program.type] ?? '📋';
  const label = PROGRAM_TYPE_LABELS[program.type] ?? program.type;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top stripe by region */}
      <div
        className={`h-1.5 ${
          program.country === 'EU'
            ? 'bg-yellow-400'
            : program.isDigitalNomadFriendly
            ? 'bg-sky-500'
            : program.isEResidentFriendly
            ? 'bg-cyan-500'
            : 'bg-slate-700'
        }`}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* EU uses 🇪🇺 emoji; country-specific programs use real flag image */}
            {program.country === 'EU' ? (
              <span className="text-2xl" aria-label="EU flag">🇪🇺</span>
            ) : (
              <CountryFlag code={program.country} size={36} rounded="sm" />
            )}
            <div>
              <p className="text-xs text-slate-500 font-medium">{program.institution}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            {program.isDigitalNomadFriendly && (
              <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">
                🌐 Nomad
              </span>
            )}
            {program.isEResidentFriendly && (
              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                🪪 e-Resident
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-2">{program.name}</h3>

        {/* Type badge + audiences */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${typeBadgeClass(program.type)}`}>
            {icon} {label}
          </span>
          {program.audience.slice(0, 3).map((a) => (
            <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {AUDIENCE_LABELS[a] ?? a}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1 line-clamp-3">
          {program.description}
        </p>

        {/* Key numbers */}
        {(program.maxAmount || program.rateMin || program.termMaxMonths) && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {program.maxAmount && (
              <div className="bg-slate-50 rounded-xl p-2 text-center">
                <p className="text-xs text-slate-500 mb-0.5">Max Amount</p>
                <p className="text-sm font-bold text-slate-800">
                  {program.currency === 'EUR' || program.currency === 'DKK'
                    ? `${program.currency === 'EUR' ? '€' : 'kr.'}`
                    : ''}
                  {program.maxAmount >= 1000000
                    ? `${(program.maxAmount / 1000000).toFixed(1)}M`
                    : program.maxAmount >= 1000
                    ? `${(program.maxAmount / 1000).toFixed(0)}K`
                    : program.maxAmount.toLocaleString()}
                  {program.currency && !['EUR', 'DKK'].includes(program.currency)
                    ? ` ${program.currency}`
                    : ''}
                </p>
              </div>
            )}
            {program.rateMin !== undefined && (
              <div className="bg-slate-50 rounded-xl p-2 text-center">
                <p className="text-xs text-slate-500 mb-0.5">Rate from</p>
                <p className="text-sm font-bold text-emerald-700">{program.rateMin.toFixed(1)}%</p>
              </div>
            )}
            {program.termMaxMonths && (
              <div className="bg-slate-50 rounded-xl p-2 text-center">
                <p className="text-xs text-slate-500 mb-0.5">Max Term</p>
                <p className="text-sm font-bold text-slate-800">
                  {program.termMaxMonths >= 12
                    ? `${Math.floor(program.termMaxMonths / 12)}y`
                    : `${program.termMaxMonths}m`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Top features */}
        <div className="space-y-1 mb-4">
          {program.features.slice(0, 3).map((f) => (
            <div key={f} className="flex items-start gap-2 text-xs text-slate-600">
              <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={program.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto block text-center bg-slate-900 hover:bg-sky-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          Learn More & Apply →
        </a>
      </div>
    </div>
  );
}
