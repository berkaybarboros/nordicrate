"use client";

import Link from "next/link";
import { Shield, Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#1a3c6e] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center text-sm">
                BR
              </div>
              <span>Baltic<span className="text-[#f97316]">Rate</span></span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Shield size={14} className="text-[#f97316]" />
              <span>Licensed financial intermediary</span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{t.footer.products}</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/loans/personal" className="hover:text-[#f97316] transition">{t.footer.personalLoans}</Link></li>
              <li><Link href="/loans/mortgage" className="hover:text-[#f97316] transition">{t.footer.mortgage}</Link></li>
              <li><Link href="/loans/car" className="hover:text-[#f97316] transition">{t.footer.carLoans}</Link></li>
              <li><Link href="/deposits" className="hover:text-[#f97316] transition">{t.footer.termDeposits}</Link></li>
            </ul>
          </div>

          {/* Insurance */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{t.nav.insurance}</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/insurance/motor" className="hover:text-[#f97316] transition">{t.footer.motorInsurance}</Link></li>
              <li><Link href="/insurance/casco" className="hover:text-[#f97316] transition">{t.footer.casco}</Link></li>
              <li><Link href="/insurance/home" className="hover:text-[#f97316] transition">{t.footer.homeInsurance}</Link></li>
              <li><Link href="/insurance/health" className="hover:text-[#f97316] transition">{t.footer.healthInsurance}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{t.footer.contact}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#f97316] flex-shrink-0" />
                <span>+372 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#f97316] flex-shrink-0" />
                <span>info@balticrate.ee</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-[#f97316] flex-shrink-0 mt-0.5" />
                <span>Tartu mnt 2, 10145 Tallinn, Estonia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Partners */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <p className="text-white/50 text-xs text-center mb-4">Our partner banks & insurers</p>
          <div className="flex flex-wrap justify-center gap-6 text-white/40 text-sm font-medium">
            {["Swedbank", "SEB Bank", "LHV Pank", "Luminor", "Bigbank", "Coop Pank", "If P&C", "ERGO", "Gjensidige"].map((name) => (
              <span key={name} className="hover:text-white/70 transition cursor-default">{name}</span>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-white/10 mt-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 BalticRate OÜ. {t.footer.rights} Registration: 16XXXXXX</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/70 transition">{t.footer.privacy}</Link>
            <Link href="/terms" className="hover:text-white/70 transition">Terms of Use</Link>
            <Link href="/cookies" className="hover:text-white/70 transition">Cookie Policy</Link>
          </div>
        </div>
        <p className="text-center text-xs text-white/30 mt-4">
          {t.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
