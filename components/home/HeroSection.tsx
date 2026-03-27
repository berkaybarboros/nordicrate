"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, TrendingDown, Clock, CheckCircle } from "lucide-react";
import { calculateMonthlyPayment, formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(5000);
  const [termMonths, setTermMonths] = useState(36);

  const monthlyPayment = useMemo(
    () => calculateMonthlyPayment(amount, 9.9, termMonths),
    [amount, termMonths]
  );

  const totalCost = monthlyPayment * termMonths;
  const totalInterest = totalCost - amount;

  const amountPercent = ((amount - 500) / (30000 - 500)) * 100;
  const termPercent = ((termMonths - 6) / (84 - 6)) * 100;

  return (
    <section className="bg-gradient-to-br from-[#1a3c6e] via-[#1e4d8c] to-[#2563eb] text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: Headline */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {t.hero.badge}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              {t.hero.title.split("Loan & Insurance").length > 1 ? (
                <>
                  Find the Best
                  <span className="text-[#f97316]"> Loan & Insurance</span>
                  <br />in Estonia
                </>
              ) : (
                t.hero.title
              )}
            </h1>

            <p className="text-white/80 text-lg leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { icon: CheckCircle, text: t.hero.freeService },
                { icon: TrendingDown, text: t.hero.savings },
                { icon: Clock, text: t.hero.speed },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={16} className="text-green-400" />
                  <span className="text-white/90">{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/loans/personal"
                className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-orange-500/25"
              >
                {t.hero.compareLoans} <ArrowRight size={16} />
              </Link>
              <Link
                href="/insurance/motor"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-xl transition backdrop-blur-sm border border-white/20"
              >
                {t.hero.getQuote}
              </Link>
            </div>
          </div>

          {/* Right: Calculator */}
          <div className="bg-white rounded-2xl p-6 text-gray-800 shadow-2xl">
            <h3 className="font-bold text-lg text-[#1a3c6e] mb-1">{t.hero.calc.title}</h3>
            <p className="text-gray-500 text-sm mb-5">See how much you&apos;d pay monthly</p>

            {/* Amount Slider */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">{t.hero.calc.amount}</label>
                <span className="text-[#1a3c6e] font-bold text-lg">{formatCurrency(amount)}</span>
              </div>
              <input
                type="range"
                min={500}
                max={30000}
                step={500}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ "--value": `${amountPercent}%` } as React.CSSProperties}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>€500</span>
                <span>€30,000</span>
              </div>
            </div>

            {/* Term Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">{t.hero.calc.term}</label>
                <span className="text-[#1a3c6e] font-bold text-lg">
                  {termMonths} {t.hero.calc.months}
                </span>
              </div>
              <input
                type="range"
                min={6}
                max={84}
                step={6}
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                style={{ "--value": `${termPercent}%` } as React.CSSProperties}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>6 mo</span>
                <span>84 mo (7yr)</span>
              </div>
            </div>

            {/* Result Box */}
            <div className="bg-gradient-to-r from-[#1a3c6e] to-[#2563eb] rounded-xl p-4 text-white mb-4">
              <div className="text-center mb-3">
                <p className="text-white/70 text-xs uppercase tracking-wide">{t.hero.calc.estimated}</p>
                <p className="text-4xl font-extrabold mt-1">{formatCurrency(monthlyPayment)}<span className="text-lg font-normal text-white/70">/mo</span></p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm border-t border-white/20 pt-3">
                <div>
                  <p className="text-white/60 text-xs">{t.hero.calc.totalCost}</p>
                  <p className="font-semibold">{formatCurrency(totalCost)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t.hero.calc.totalInterest}</p>
                  <p className="font-semibold">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-3">
              {t.hero.calc.disclaimer}
            </p>

            <Link
              href={`/loans/personal?amount=${amount}&term=${termMonths}`}
              className="block text-center bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-3 rounded-xl transition w-full"
            >
              {t.hero.calc.seeOffers}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
