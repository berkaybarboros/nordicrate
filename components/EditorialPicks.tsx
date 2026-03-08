import Link from 'next/link';
import { PRODUCTS, INSTITUTIONS } from '@/lib/data';
import { formatRate, formatAmount, getInstitution, getCountry } from '@/lib/utils';

const PICKS = [
  {
    id: 'best-rate',
    label: "🏆 Best Overall Rate",
    desc: "Lowest APR available across all 8 countries",
    color: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    border: "border-amber-200",
    textColor: "text-amber-700",
    filter: (p: typeof PRODUCTS[0]) => p.type === 'personal',
    sortFn: (a: typeof PRODUCTS[0], b: typeof PRODUCTS[0]) => a.rateMin - b.rateMin,
    href: '/loans',
  },
  {
    id: 'best-mortgage',
    label: "🏠 Best Mortgage Rate",
    desc: "Top home loan rate from leading Nordic banks",
    color: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50",
    border: "border-emerald-200",
    textColor: "text-emerald-700",
    filter: (p: typeof PRODUCTS[0]) => p.type === 'mortgage',
    sortFn: (a: typeof PRODUCTS[0], b: typeof PRODUCTS[0]) => a.rateMin - b.rateMin,
    href: '/mortgage',
  },
  {
    id: 'best-digital',
    label: "📱 Best for Digital Nomads",
    desc: "Fintech-friendly loans — apply 100% online",
    color: "from-sky-500 to-blue-600",
    lightBg: "bg-sky-50",
    border: "border-sky-200",
    textColor: "text-sky-700",
    filter: (p: typeof PRODUCTS[0]) => {
      const inst = INSTITUTIONS.find(i => i.id === p.institutionId);
      return !!(inst?.isDigitalFriendly);
    },
    sortFn: (a: typeof PRODUCTS[0], b: typeof PRODUCTS[0]) => a.rateMin - b.rateMin,
    href: '/loans',
  },
  {
    id: 'best-business',
    label: "🏢 Best Business Loan",
    desc: "Corporate financing from state-backed lenders",
    color: "from-purple-500 to-violet-600",
    lightBg: "bg-purple-50",
    border: "border-purple-200",
    textColor: "text-purple-700",
    filter: (p: typeof PRODUCTS[0]) => p.type === 'business',
    sortFn: (a: typeof PRODUCTS[0], b: typeof PRODUCTS[0]) => a.rateMin - b.rateMin,
    href: '/business',
  },
];

export default function EditorialPicks() {
  return (
    <section className="py-14 px-4 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full mb-3">
            Editor&apos;s Picks
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Our Top Recommendations</h2>
          <p className="text-slate-500 mt-2 text-sm max-w-xl mx-auto">
            Curated by our team — the best products in each category based on rate, flexibility, and eligibility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PICKS.map(({ id, label, desc, color, lightBg, border, textColor, filter, sortFn, href }) => {
            const sorted = [...PRODUCTS].filter(filter).sort(sortFn);
            const best = sorted[0];
            if (!best) return null;
            const inst = getInstitution(best.institutionId);
            const country = inst ? getCountry(inst.country) : null;

            return (
              <Link
                key={id}
                href={href}
                className={`group bg-white rounded-2xl border ${border} overflow-hidden hover:shadow-lg transition-all duration-200`}
              >
                {/* Top gradient bar */}
                <div className={`bg-gradient-to-r ${color} p-4 text-white`}>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-90 mb-1">{label}</p>
                  <p className="text-3xl font-extrabold">{formatRate(best.rateMin)}</p>
                  <p className="text-xs opacity-80 mt-0.5">APR from</p>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${lightBg} flex items-center justify-center text-xs font-extrabold ${textColor} shrink-0`}>
                      {inst?.shortName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{inst?.shortName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        {country?.flag} {country?.name}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{desc}</p>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">Up to {formatAmount(best.limitMax, best.currency)}</span>
                    <span className={`font-semibold ${textColor} group-hover:underline`}>View →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
