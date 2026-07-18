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

        {/* Kurum listesi InstitutionMarquee'ye taşındı (homepage'de TrustBar'ın hemen altında) */}
      </div>
    </section>
  );
}
