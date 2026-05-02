'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { LOCALE_FLAGS, LOCALE_NAMES, type Locale } from '@/locales';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const LOCALES: Locale[] = ['en', 'fi', 'et'];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { locale, t, setLocale } = useTranslation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

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

            {user ? (
              <div className="flex items-center gap-2.5 ml-1">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-200 font-medium truncate max-w-[100px]">
                    {user.user_metadata?.full_name ?? user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-xl px-3 py-1.5 transition-all"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 hover:bg-slate-800 rounded-xl px-3 py-1.5 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-sky-900/50 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get started
                </Link>
              </div>
            )}
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

            <div className="pt-2 px-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium leading-tight">
                        {user.user_metadata?.full_name ?? user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500 leading-tight">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="block w-full border border-red-500/30 text-red-400 text-sm font-medium py-2.5 rounded-xl text-center transition-colors hover:bg-red-500/10"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full border border-slate-700 text-slate-300 text-sm font-medium py-2.5 rounded-xl text-center transition-colors hover:bg-slate-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold py-2.5 rounded-xl text-center transition-all shadow-lg shadow-sky-900/40"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get started
                  </Link>
                </>
              )}
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
