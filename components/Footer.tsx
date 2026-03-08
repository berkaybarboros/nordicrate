import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <span className="text-white font-bold text-lg">
                Nordic<span className="text-sky-400">Rate</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              The leading credit comparison platform for Nordic & Baltic markets. Compare rates from 40+ banks and insurers.
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {['🇩🇰', '🇫🇮', '🇮🇸', '🇳🇴', '🇸🇪', '🇪🇪', '🇱🇻', '🇱🇹'].map((flag) => (
                <span key={flag} className="text-lg">{flag}</span>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/loans" className="hover:text-white transition-colors">Personal Loans</Link></li>
              <li><Link href="/mortgage" className="hover:text-white transition-colors">Mortgage Rates</Link></li>
              <li><Link href="/business" className="hover:text-white transition-colors">Business Loans</Link></li>
              <li><Link href="/loans?type=auto" className="hover:text-white transition-colors">Auto Finance</Link></li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Countries</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/countries?region=nordic" className="hover:text-white transition-colors">Nordic Region</Link></li>
              <li><Link href="/countries?region=baltic" className="hover:text-white transition-colors">Baltic Region</Link></li>
              <li><Link href="/countries" className="hover:text-white transition-colors">All Countries</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">About NordicRate</span></li>
              <li><span className="cursor-default">Methodology</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Use</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 NordicRate. All rights reserved.</p>
          <p className="text-center">
            Rates are indicative only. Always verify directly with the institution before applying.
          </p>
        </div>
      </div>
    </footer>
  );
}
