'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { LOCALE_FLAGS, LOCALE_NAMES, type Locale } from '@/locales';

const LOCALES: Locale[] = ['en', 'fi', 'et'];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { locale, t, setLocale } = useTranslation();

  const navLinks = [
    { href: '/loans', label: t.nav.personalLoans },
    { href: '/mortgage', label: t.nav.mortgage },
    { href: '/business', label: t.nav.business },
    { href: '/countries', label: t.nav.countries },
    { href: '/programs', label: t.nav.programs, highlight: true },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:bg-sky-400 transition-colors">
              N
            </div>
            <span className="text-xl font-bold tracking-tight">
              Nordic<span className="text-sky-400">Rate</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-sky-600 text-white'
                    : link.highlight
                    ? 'text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: language + badge + CTA */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-xs text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg px-2 py-1.5 transition-colors"
              >
                <span className="text-lg leading-none">{LOCALE_FLAGS[locale]}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 min-w-[130px]">
                  {LOCALES.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                        locale === loc
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{LOCALE_FLAGS[loc]}</span>
                      <span>{LOCALE_NAMES[loc]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded px-2 py-1 font-medium">
              {t.nav.updatedDaily}
            </span>
            <Link
              href="/loans"
              className="ml-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-sky-900/40"
            >
              {t.nav.getQuote}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800 mt-1 pt-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-sky-600 text-white'
                    : link.highlight
                    ? 'text-amber-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile language switcher */}
            <div className="flex gap-2 px-4 pt-2">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    locale === loc
                      ? 'bg-sky-600 border-sky-500 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className="text-lg leading-none">{LOCALE_FLAGS[loc]}</span>
                  <span>{LOCALE_NAMES[loc]}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 px-4">
              <Link
                href="/loans"
                onClick={() => setMenuOpen(false)}
                className="block w-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold py-2.5 rounded-xl text-center transition-colors"
              >
                {t.nav.getQuote}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Close lang dropdown on outside click */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
    </header>
  );
}
