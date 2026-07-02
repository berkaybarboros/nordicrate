import { BadgeCheck, Landmark, Activity, SearchCheck } from 'lucide-react';
import { INSTITUTIONS } from '@/lib/data';

const TRUST_ITEMS = [
  { Icon: BadgeCheck, label: 'Always free', sub: 'No fees for borrowers', color: 'bg-emerald-50 text-emerald-600' },
  { Icon: Landmark, label: `${INSTITUTIONS.length}+ institutions`, sub: 'Banks, insurers, fintechs', color: 'bg-sky-50 text-sky-600' },
  { Icon: Activity, label: 'Live market data', sub: 'ECB & Norges Bank feeds', color: 'bg-violet-50 text-violet-600' },
  { Icon: SearchCheck, label: 'No credit impact', sub: 'Comparison only — no checks', color: 'bg-amber-50 text-amber-600' },
];

const PARTNER_NAMES = [
  'SEB', 'Swedbank', 'Nordea', 'DNB', 'Handelsbanken',
  'LHV', 'OP Group', 'Aktia', 'SBAB', 'Revolut',
  'Wise', 'Inbank', 'Citadele', 'Luminor',
];

export default function TrustBar() {
  return (
    <section className="bg-white border-b border-slate-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Trust items */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6">
          {TRUST_ITEMS.map(({ Icon, label, sub, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={17} strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-none">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Banks &amp; institutions we compare</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Partner chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {PARTNER_NAMES.map((name) => (
            <span
              key={name}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full"
            >
              {name}
            </span>
          ))}
          <span className="text-xs text-slate-400 font-medium self-center">&amp; 40+ more</span>
        </div>
      </div>
    </section>
  );
}
