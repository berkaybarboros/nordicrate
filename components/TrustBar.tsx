const TRUST_ITEMS = [
  { icon: '✓', label: 'Always Free', sub: 'No fees, ever', color: 'bg-emerald-100 text-emerald-600' },
  { icon: '🏦', label: '50+ Banks', sub: 'All in one place', color: 'bg-sky-100 text-sky-600' },
  { icon: '🔒', label: 'SSL Secured', sub: 'Bank-level encryption', color: 'bg-purple-100 text-purple-600' },
  { icon: '✓', label: 'No Credit Impact', sub: 'Soft check only', color: 'bg-amber-100 text-amber-600' },
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
          {TRUST_ITEMS.map(({ icon, label, sub, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-sm font-bold shrink-0`}>
                {icon}
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
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Banks & institutions we compare</span>
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
          <span className="text-xs text-slate-400 font-medium self-center">& 40+ more</span>
        </div>
      </div>
    </section>
  );
}
