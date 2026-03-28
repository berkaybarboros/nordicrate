"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Shield, CreditCard, PiggyBank, Globe, BarChart2 } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { LOCALE_NAMES, LOCALE_FLAGS, type Locale } from "@/locales";
import { useCompare } from "@/contexts/CompareContext";

export default function Navbar() {
  const { t, locale, setLocale } = useTranslation();
  const { items } = useCompare();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const loanLinks = [
    { href: "/loans/personal", label: t.nav.personalLoans, icon: "💳", desc: "Up to €30,000" },
    { href: "/loans/mortgage", label: t.nav.mortgage, icon: "🏠", desc: "Home financing" },
    { href: "/loans/car", label: t.nav.carLoans, icon: "🚗", desc: "New & used vehicles" },
    { href: "/loans/business", label: t.nav.businessLoans, icon: "🏢", desc: "For entrepreneurs" },
  ];

  const insuranceLinks = [
    { href: "/insurance/motor", label: t.nav.motorInsurance, icon: "🚗", desc: "Mandatory liability" },
    { href: "/insurance/casco", label: t.nav.casco, icon: "🛡️", desc: "Comprehensive cover" },
    { href: "/insurance/home", label: t.nav.homeInsurance, icon: "🏠", desc: "Protect your home" },
    { href: "/insurance/health", label: t.nav.healthInsurance, icon: "❤️", desc: "Private healthcare" },
  ];

  const locales: Locale[] = ["en", "et", "fi"];

  return (
    <>
      <nav className="bg-[#1a3c6e] text-white shadow-lg relative z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                BR
              </div>
              <span>
                Baltic<span className="text-[#f97316]">Rate</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {/* Loans Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("loans")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm font-medium">
                  <CreditCard size={15} />
                  {t.nav.loans}
                  <ChevronDown size={14} className={`transition-transform ${activeDropdown === "loans" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "loans" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 text-gray-800">
                    {loanLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition"
                      >
                        <span className="text-xl">{link.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{link.label}</div>
                          <div className="text-xs text-gray-500">{link.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Insurance Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("insurance")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm font-medium">
                  <Shield size={15} />
                  {t.nav.insurance}
                  <ChevronDown size={14} className={`transition-transform ${activeDropdown === "insurance" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "insurance" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 text-gray-800">
                    {insuranceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition"
                      >
                        <span className="text-xl">{link.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{link.label}</div>
                          <div className="text-xs text-gray-500">{link.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Deposits */}
              <Link
                href="/deposits"
                className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm font-medium"
              >
                <PiggyBank size={15} />
                {t.nav.deposits}
              </Link>
            </div>

            {/* Right: Language + Compare chip + CTA + Mobile */}
            <div className="flex items-center gap-2">
              {/* Compare pill (desktop) — visible when items > 0 */}
              {items.length > 0 && (
                <Link
                  href="/compare"
                  className="hidden md:flex items-center gap-1.5 bg-[#f97316]/20 border border-[#f97316]/40 text-[#f97316] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#f97316]/30 transition"
                >
                  <BarChart2 size={13} />
                  {items.length} to compare
                </Link>
              )}

              {/* Language Switcher */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition text-sm font-medium"
                  aria-label="Select language"
                >
                  <Globe size={15} />
                  <span>{LOCALE_FLAGS[locale]}</span>
                  <span className="text-xs uppercase">{locale}</span>
                  <ChevronDown size={12} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 text-gray-800 z-50">
                    {locales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => { setLocale(loc); setLangOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-sm ${locale === loc ? "font-bold text-[#1a3c6e]" : ""}`}
                      >
                        <span className="text-base">{LOCALE_FLAGS[loc]}</span>
                        <span>{LOCALE_NAMES[loc]}</span>
                        {locale === loc && <span className="ml-auto text-[#f97316] text-xs font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <Link
                href="/loans/personal"
                className="hidden md:block bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                {t.nav.compareNow}
              </Link>

              {/* Compare chip on mobile */}
              {items.length > 0 && (
                <Link
                  href="/compare"
                  className="md:hidden flex items-center gap-1 bg-[#f97316] text-white text-xs font-bold px-2.5 py-1.5 rounded-full"
                >
                  <BarChart2 size={12} />
                  {items.length}
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5">
                  <Menu
                    size={20}
                    className={`absolute inset-0 transition-all duration-200 ${
                      mobileOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <X
                    size={20}
                    className={`absolute inset-0 transition-all duration-200 ${
                      mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile menu panel — slides down from top */}
      <div
        className={`fixed top-16 left-0 right-0 z-50 md:hidden bg-[#122d54] border-t border-white/10 shadow-2xl overflow-y-auto max-h-[calc(100vh-4rem)] transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          {/* Loans */}
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2 px-2">{t.nav.loans}</p>
          {loanLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 active:bg-white/20 transition"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl w-8 text-center">{link.icon}</span>
              <div>
                <p className="text-sm font-semibold">{link.label}</p>
                <p className="text-xs text-white/50">{link.desc}</p>
              </div>
            </Link>
          ))}

          {/* Insurance */}
          <p className="text-xs text-white/50 uppercase tracking-wider mt-4 mb-2 px-2">{t.nav.insurance}</p>
          {insuranceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 active:bg-white/20 transition"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl w-8 text-center">{link.icon}</span>
              <div>
                <p className="text-sm font-semibold">{link.label}</p>
                <p className="text-xs text-white/50">{link.desc}</p>
              </div>
            </Link>
          ))}

          {/* Deposits */}
          <p className="text-xs text-white/50 uppercase tracking-wider mt-4 mb-2 px-2">Savings</p>
          <Link
            href="/deposits"
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 active:bg-white/20 transition"
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-xl w-8 text-center">🏦</span>
            <div>
              <p className="text-sm font-semibold">{t.nav.deposits}</p>
              <p className="text-xs text-white/50">Up to 4.3% p.a.</p>
            </div>
          </Link>

          {/* Language switcher */}
          <div className="pt-4 border-t border-white/10 mt-4">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-3 px-2">{t.nav.language}</p>
            <div className="grid grid-cols-4 gap-2">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { setLocale(loc); setMobileOpen(false); }}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition text-xs font-medium ${
                    locale === loc
                      ? "bg-[#f97316] text-white shadow-md"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  <span className="text-lg">{LOCALE_FLAGS[loc]}</span>
                  <span className="uppercase text-[10px] tracking-wide">{loc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Compare button */}
          {items.length > 0 && (
            <div className="pt-3">
              <Link
                href="/compare"
                className="flex items-center justify-center gap-2 bg-white/10 border border-[#f97316]/40 text-[#f97316] font-bold py-3 rounded-xl"
                onClick={() => setMobileOpen(false)}
              >
                <BarChart2 size={16} />
                Compare {items.length} selected
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="pt-3 pb-2">
            <Link
              href="/loans/personal"
              className="block text-center bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-3.5 rounded-xl transition text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.compareNow}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
