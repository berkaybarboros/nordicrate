'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingDown, Info } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type InsuranceKind = 'motor' | 'casco' | 'home' | 'health';
type CoverageLevel = 'basic' | 'standard' | 'premium';

interface Props {
  kind: InsuranceKind;
}

// ─── Pricing models (representative indicative ranges) ─────────────────────────
const MOTOR_BASE   = 79;   // € / year — mandatory TPL
const CASCO_BASE   = 250;  // € / year
const HOME_BASE    = 99;   // € / year
const HEALTH_BASE  = 150;  // € / month

// Multipliers per coverage level
const COVERAGE_MULT: Record<CoverageLevel, number> = {
  basic:    1.0,
  standard: 1.45,
  premium:  2.1,
};

// Age risk factor (younger → higher premium)
function ageRiskFactor(age: number): number {
  if (age < 25) return 1.55;
  if (age < 30) return 1.25;
  if (age < 50) return 1.0;
  if (age < 65) return 1.1;
  return 1.25;
}

// Vehicle age factor
function vehicleAgeFactor(vehicleYear: number): number {
  const age = new Date().getFullYear() - vehicleYear;
  if (age <= 2)  return 0.9;
  if (age <= 5)  return 1.0;
  if (age <= 10) return 1.15;
  if (age <= 15) return 1.3;
  return 1.5;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function InsurancePremiumCalc({ kind }: Props) {
  const [coverage, setCoverage]       = useState<CoverageLevel>('standard');
  const [driverAge, setDriverAge]     = useState(30);
  const [vehicleYear, setVehicleYear] = useState(2019);
  const [vehicleValue, setVehicleValue] = useState(15_000); // for casco
  const [homeValue, setHomeValue]     = useState(120_000);  // for home
  const [healthAge, setHealthAge]     = useState(30);       // for health

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 25 }, (_, i) => currentYear - i);

  // ─── Calculate ───────────────────────────────────────────────────────────────
  const { minPremium, maxPremium, unit, breakdown } = useMemo(() => {
    const cov = COVERAGE_MULT[coverage];

    if (kind === 'motor') {
      const age  = ageRiskFactor(driverAge);
      const vAge = vehicleAgeFactor(vehicleYear);
      const base = MOTOR_BASE * cov * age * vAge;
      return {
        minPremium: Math.round(base * 0.85),
        maxPremium: Math.round(base * 1.2),
        unit: '/year',
        breakdown: [
          { label: 'Base TPL premium',   value: `€${MOTOR_BASE}` },
          { label: 'Coverage level',     value: `×${cov.toFixed(2)}` },
          { label: 'Driver age factor',  value: `×${age.toFixed(2)}` },
          { label: 'Vehicle age factor', value: `×${vAge.toFixed(2)}` },
        ],
      };
    }

    if (kind === 'casco') {
      const rate  = kind === 'casco' ? 0.018 : 0; // ~1.8% of vehicle value for standard
      const base  = vehicleValue * rate * cov * vehicleAgeFactor(vehicleYear);
      const floor = CASCO_BASE * cov;
      const effective = Math.max(base, floor);
      return {
        minPremium: Math.round(effective * 0.85),
        maxPremium: Math.round(effective * 1.2),
        unit: '/year',
        breakdown: [
          { label: 'Vehicle value',    value: `€${vehicleValue.toLocaleString()}` },
          { label: 'Rate (~1.8% p.a.)', value: `×${rate}` },
          { label: 'Coverage level',   value: `×${cov.toFixed(2)}` },
          { label: 'Vehicle age',      value: `×${vehicleAgeFactor(vehicleYear).toFixed(2)}` },
        ],
      };
    }

    if (kind === 'home') {
      const rate    = 0.00085; // 0.085% of home value
      const base    = homeValue * rate * cov;
      const floor   = HOME_BASE * cov;
      const effective = Math.max(base, floor);
      return {
        minPremium: Math.round(effective * 0.85),
        maxPremium: Math.round(effective * 1.2),
        unit: '/year',
        breakdown: [
          { label: 'Property value',  value: `€${homeValue.toLocaleString()}` },
          { label: 'Rate (0.085%)',   value: `×${rate}` },
          { label: 'Coverage level',  value: `×${cov.toFixed(2)}` },
        ],
      };
    }

    // health
    const age   = ageRiskFactor(healthAge);
    const base  = HEALTH_BASE * cov * age;
    return {
      minPremium: Math.round(base * 0.85),
      maxPremium: Math.round(base * 1.2),
      unit: '/month',
      breakdown: [
        { label: 'Base health premium', value: `€${HEALTH_BASE}` },
        { label: 'Coverage level',      value: `×${cov.toFixed(2)}` },
        { label: 'Age risk factor',     value: `×${age.toFixed(2)}` },
      ],
    };
  }, [kind, coverage, driverAge, vehicleYear, vehicleValue, homeValue, healthAge]);

  const midPremium = Math.round((minPremium + maxPremium) / 2);

  // ─── Config per kind ─────────────────────────────────────────────────────────
  const config: Record<InsuranceKind, { title: string; color: string }> = {
    motor:  { title: 'Motor Insurance Estimator',  color: '#ea580c' },
    casco:  { title: 'CASCO Estimator',            color: '#0d9488' },
    home:   { title: 'Home Insurance Estimator',   color: '#16a34a' },
    health: { title: 'Health Insurance Estimator', color: '#e11d48' },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <Calculator size={18} style={{ color: config[kind].color }} />
        <div>
          <p className="font-bold text-gray-900 text-sm">{config[kind].title}</p>
          <p className="text-xs text-gray-400">Indicative estimate · Not a formal quote</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Coverage level */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Coverage Level</label>
          <div className="grid grid-cols-3 gap-2">
            {(['basic', 'standard', 'premium'] as CoverageLevel[]).map(c => (
              <button
                key={c}
                onClick={() => setCoverage(c)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                  coverage === c
                    ? 'text-white border-transparent'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                style={coverage === c ? { backgroundColor: config[kind].color } : {}}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Motor: driver age + vehicle year */}
        {kind === 'motor' && (
          <>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex justify-between">
                <span>Driver Age</span>
                <span style={{ color: config[kind].color }} className="font-bold normal-case">{driverAge} yrs</span>
              </label>
              <input type="range" min={18} max={75} step={1} value={driverAge}
                onChange={e => setDriverAge(Number(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer"
                style={{ accentColor: config[kind].color }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Vehicle Year</label>
              <select value={vehicleYear} onChange={e => setVehicleYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200">
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </>
        )}

        {/* CASCO: vehicle value + year */}
        {kind === 'casco' && (
          <>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex justify-between">
                <span>Vehicle Value</span>
                <span style={{ color: config[kind].color }} className="font-bold normal-case">€{vehicleValue.toLocaleString()}</span>
              </label>
              <input type="range" min={2_000} max={100_000} step={1_000} value={vehicleValue}
                onChange={e => setVehicleValue(Number(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer"
                style={{ accentColor: config[kind].color }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Vehicle Year</label>
              <select value={vehicleYear} onChange={e => setVehicleYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200">
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Home: property value */}
        {kind === 'home' && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex justify-between">
              <span>Property Value</span>
              <span style={{ color: config[kind].color }} className="font-bold normal-case">€{homeValue.toLocaleString()}</span>
            </label>
            <input type="range" min={30_000} max={500_000} step={5_000} value={homeValue}
              onChange={e => setHomeValue(Number(e.target.value))}
              className="w-full h-2 rounded-lg cursor-pointer"
              style={{ accentColor: config[kind].color }}
            />
          </div>
        )}

        {/* Health: age */}
        {kind === 'health' && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex justify-between">
              <span>Your Age</span>
              <span style={{ color: config[kind].color }} className="font-bold normal-case">{healthAge} yrs</span>
            </label>
            <input type="range" min={18} max={75} step={1} value={healthAge}
              onChange={e => setHealthAge(Number(e.target.value))}
              className="w-full h-2 rounded-lg cursor-pointer"
              style={{ accentColor: config[kind].color }}
            />
          </div>
        )}

        {/* Result */}
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: config[kind].color + '10', border: `1px solid ${config[kind].color}30` }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estimated Premium</p>
          <p className="text-3xl font-extrabold" style={{ color: config[kind].color }}>
            ~€{midPremium.toLocaleString()}
            <span className="text-base font-bold ml-1 text-gray-400">{unit}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Range: €{minPremium.toLocaleString()} – €{maxPremium.toLocaleString()}</p>
        </div>

        {/* Breakdown */}
        <div>
          <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2 transition-colors">
            <Info size={11} />
            <span>How this is calculated</span>
          </button>
          <div className="space-y-1">
            {breakdown.map((row, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-gray-400">{row.label}</span>
                <span className="font-semibold text-gray-700">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <TrendingDown size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Actual quotes may differ. Compare real offers below to find the best price for your situation.
          </p>
        </div>
      </div>
    </div>
  );
}
