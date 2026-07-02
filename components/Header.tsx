'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell, Menu, X, LogIn, UserRound, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { LOCALE_NAMES, type Locale } from '@/locales';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import RateAlertModal from './alerts/RateAlertModal';

const LOCALES: Locale[] = ['en', 'fi', 'et'];

const LOCALE_FLAG_CODES: Record<Locale, string> = { en: 'gb', fi: 'fi', et: 'ee' };

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
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
    { href: '/loans',     label: t.nav.loans },
    { href: '/mortgage',  label: t.nav.mortgage },
    { href: '/business',  label: t.nav.business },
    { href: '/insurance', label: t.nav.insurance },
    { href: '/deposits',  label: t.nav.deposits },
    { href: '/countries', label: t.nav.countries },
    { href: '/startup',   label: t.nav.programs, highlight: true },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:bg-sky-500 transition-colors">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Nordic<span className="text-sky-600">Rate</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-sky-50 text-sky-700'
                    : link.highlight
                    ? 'text-sky-700 hover:bg-sky-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: language + alert + auth */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                <img
                  src={`https://flagcdn.com/20x15/${LOCALE_FLAG_CODES[locale]}.png`}
                  width={20} height={15} alt={locale}
                  className="rounded-sm object-cover"
                />
                <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[130px]">
                  {LOCALES.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                        locale === loc
                          ? 'bg-sky-50 text-sky-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={`https://flagcdn.com/20x15/${LOCALE_FLAG_CODES[loc]}.png`}
                        width={20} height={15} alt={loc}
                        className="rounded-sm object-cover"
                      />
                      <span>{LOCALE_NAMES[loc]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rate Alert bell */}
            <button
              onClick={() => setAlertOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 border border-slate-200 hover:border-sky-200 hover:bg-sky-50 rounded-lg px-3 py-1.5 transition-all"
              title="Get notified when rates drop"
            >
              <Bell size={13} />
              Rate Alert
            </button>

            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-700 font-medium truncate max-w-[100px]">
                    {user.user_metadata?.full_name ?? user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-all"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-1.5 transition-all"
                >
                  <LogIn size={13} />
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-bold px-4 py-2 rounded-lg transition-colors bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right: user icon + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            {user ? (
              <button
                onClick={() => setMenuOpen(true)}
                className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold"
                aria-label="Account"
              >
                {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
              </button>
            ) : (
              <Link
                href="/login"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Sign in"
              >
                <UserRound size={20} />
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 mt-1 pt-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-sky-50 text-sky-700'
                    : link.highlight
                    ? 'text-sky-700 hover:bg-sky-50'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Rate Alert */}
            <button
              onClick={() => { setAlertOpen(true); setMenuOpen(false); }}
              className="mx-4 flex items-center justify-center gap-2 w-[calc(100%-2rem)] border border-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-xl transition-colors hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200"
            >
              <Bell size={15} />
              Get Rate Drop Alert
            </button>

            {/* Mobile language switcher */}
            <div className="flex gap-2 px-4 pt-2">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    locale === loc
                      ? 'bg-sky-50 border-sky-200 text-sky-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/20x15/${LOCALE_FLAG_CODES[loc]}.png`}
                    width={20} height={15} alt={loc}
                    className="rounded-sm object-cover"
                  />
                  <span>{LOCALE_NAMES[loc]}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 px-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-slate-900 font-medium leading-tight">
                        {user.user_metadata?.full_name ?? user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500 leading-tight">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="block w-full border border-red-200 text-red-600 text-sm font-medium py-2.5 rounded-xl text-center transition-colors hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-xl text-center transition-colors hover:bg-slate-50"
                  >
                    <LogIn size={15} />
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold py-2.5 rounded-xl text-center transition-colors"
                  >
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

      <RateAlertModal open={alertOpen} onClose={() => setAlertOpen(false)} />
    </header>
  );
}
