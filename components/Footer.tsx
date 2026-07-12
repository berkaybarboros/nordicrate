'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle } from 'lucide-react';
import CountryFlag from './CountryFlag';

const COUNTRY_CODES = [
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IS', name: 'Iceland' },
  { code: 'NO', name: 'Norway' },
  { code: 'SE', name: 'Sweden' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
];

const CURRENT_YEAR = new Date().getFullYear();

function RateAlertStrip() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || loading) return;
    setLoading(true);
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product: 'personal-loan', targetRate: null }),
      });
      setDone(true);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div className="border-b border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Get Rate Drop Alerts</p>
              <p className="text-slate-400 text-xs mt-0.5">Be first to know when loan rates fall across Nordic &amp; Baltic markets</p>
            </div>
          </div>

          {done ? (
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle size={18} />
              You&apos;re on the list!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 sm:w-56 bg-slate-800 border border-slate-700 focus:border-amber-400/60 focus:outline-none rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold text-sm px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
              >
                <Bell size={13} />
                {loading ? 'Saving…' : 'Notify Me'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <RateAlertStrip />
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
              The leading credit comparison platform for Nordic &amp; Baltic markets.
              Compare rates from 50+ banks and insurers.
            </p>
            {/* Real flag images — clickable shortcut to each country */}
            <div className="flex gap-1.5 mt-4 flex-wrap items-center">
              {COUNTRY_CODES.map(({ code, name }) => (
                <Link
                  key={code}
                  href={`/loans?country=${code}`}
                  title={`Loans in ${name}`}
                  aria-label={`View loans in ${name}`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <CountryFlag code={code} size={22} rounded="sm" alt={name} />
                </Link>
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
              <li><Link href="/programs" className="hover:text-white transition-colors">🚀 Gov. Programs</Link></li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Countries</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/countries?region=nordic" className="hover:text-white transition-colors">Nordic Region</Link></li>
              <li><Link href="/countries?region=baltic" className="hover:text-white transition-colors">Baltic Region</Link></li>
              <li><Link href="/countries" className="hover:text-white transition-colors">All Countries</Link></li>
              <li><Link href="/programs?tab=e_residency" className="hover:text-white transition-colors">🪪 e-Residency Hub</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/programs" className="hover:text-white transition-colors">About NordicRate</Link></li>
              <li><Link href="/partners" className="hover:text-white transition-colors font-semibold text-sky-400">For Partners (B2B)</Link></li>
              <li><span className="cursor-default opacity-50">Methodology</span></li>
              <li><span className="cursor-default opacity-50">Privacy Policy</span></li>
              <li><span className="cursor-default opacity-50">Terms of Use</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {CURRENT_YEAR} NordicRate. All rights reserved.</p>
          <p className="text-center text-slate-500">
            Rates are indicative only. Always verify directly with the institution before applying.
          </p>
        </div>
      </div>
    </footer>
  );
}
