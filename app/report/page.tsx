import type { Metadata } from 'next';
import { FileText, TrendingDown, Landmark, Globe2 } from 'lucide-react';
import ReportGate from '@/components/marketing/ReportGate';

export const metadata: Metadata = {
  title: 'Nordic & Baltic Rate Report Q3 2026 — Free PDF | NordicRate',
  description:
    'Free quarterly report: consumer loan, mortgage and deposit rates across 8 Nordic & Baltic countries, EURIBOR outlook, and bank-by-bank comparison tables.',
  alternates: { canonical: 'https://nordicrate.com/report' },
};

const HIGHLIGHTS = [
  { icon: TrendingDown, title: 'EURIBOR outlook', desc: 'Where the 3M/6M curve is heading and what it means for variable-rate borrowers.' },
  { icon: Landmark, title: 'Bank-by-bank tables', desc: 'Personal loan, mortgage margin and deposit rates from 15+ institutions, verified against bank websites.' },
  { icon: Globe2, title: '8 markets, one view', desc: 'Estonia, Latvia, Lithuania, Finland, Sweden, Norway, Denmark, Iceland — side by side.' },
];

export default function ReportPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — pitch */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-sky-200 text-sky-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 shadow-sm">
              <FileText size={13} />
              Free quarterly report · Q3 2026
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              Nordic &amp; Baltic<br />Rate Report
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              The quarterly snapshot of consumer lending and savings rates across the Nordic
              and Baltic region — the same data that powers NordicRate, packaged for
              analysts, journalists and expats planning a move.
            </p>
            <div className="space-y-4">
              {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{title}</p>
                    <p className="text-sm text-slate-500 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-8">
              Sources: bank websites (daily scrape), ECB SDMX, Norges Bank. Methodology at{' '}
              <a href="/methodology" className="underline">nordicrate.com/methodology</a>.
              Journalists: quote freely with attribution to NordicRate.
            </p>
          </div>

          {/* Right — gate */}
          <div className="lg:sticky lg:top-24">
            <ReportGate />
          </div>
        </div>
      </div>
    </div>
  );
}
