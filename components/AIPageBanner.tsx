"use client";

/**
 * AIPageBanner
 * Inline AI giriş kartı — her ürün sayfasının üstüne eklenir.
 * Kullanıcı bir chip'e tıkladığında veya input gönderdiğinde
 * 'ask-ai-product' event'i fırlatarak AIAssistant'ı açar + pre-fill yapar.
 */

import { useState, useRef } from "react";
import { Sparkles, Send, ChevronDown, ChevronUp } from "lucide-react";

type ProductType =
  | "personal-loan"
  | "mortgage"
  | "business-loan"
  | "motor-insurance"
  | "casco-insurance"
  | "home-insurance"
  | "health-insurance"
  | "travel-insurance"
  | "life-insurance"
  | "deposit"
  | "compare";

const PAGE_CONFIG: Record<
  ProductType,
  { title: string; subtitle: string; chips: string[]; gradient: string }
> = {
  "personal-loan": {
    title: "Ask NordicAI about Personal Loans",
    subtitle: "Get instant eligibility check, rate comparison & monthly payment calculations",
    gradient: "from-violet-600 to-sky-500",
    chips: [
      "Am I eligible for a personal loan?",
      "What's the lowest rate available?",
      "How much can I borrow on €2,500/month income?",
      "Compare LHV vs Swedbank for me",
    ],
  },
  mortgage: {
    title: "Ask NordicAI about Mortgages",
    subtitle: "LTV, fixed vs variable, EURIBOR impact — explained instantly",
    gradient: "from-[#1a3c6e] to-sky-600",
    chips: [
      "What LTV ratio do I qualify for?",
      "Fixed or variable rate — which is better now?",
      "How does EURIBOR affect my mortgage?",
      "First-time buyer programs in Estonia",
    ],
  },
  "business-loan": {
    title: "Ask NordicAI about Business Loans",
    subtitle: "EU programs, startup grants, SME financing — find what fits your business",
    gradient: "from-teal-600 to-emerald-500",
    chips: [
      "What funding is available for my startup?",
      "Do I qualify for EU SME programs?",
      "Best business loan rate in Estonia",
      "e-Residency + business banking guide",
    ],
  },
  "motor-insurance": {
    title: "Ask NordicAI about Motor Insurance",
    subtitle: "Compare liikluskindlustus prices, understand coverage & save",
    gradient: "from-orange-600 to-amber-500",
    chips: [
      "Who has the cheapest motor insurance?",
      "What does liikluskindlustus cover?",
      "Do I need extra CASCO cover?",
      "How to switch insurer mid-year?",
    ],
  },
  "casco-insurance": {
    title: "Ask NordicAI about CASCO",
    subtitle: "Is comprehensive cover worth it? Find out instantly",
    gradient: "from-teal-600 to-cyan-500",
    chips: [
      "Is CASCO worth it for my car age?",
      "What does CASCO cover vs motor insurance?",
      "Cheapest CASCO in Estonia",
      "How is CASCO premium calculated?",
    ],
  },
  "home-insurance": {
    title: "Ask NordicAI about Home Insurance",
    subtitle: "Building, contents, liability — understand what you actually need",
    gradient: "from-green-600 to-emerald-500",
    chips: [
      "What does home insurance cover?",
      "Do I need insurance if I rent?",
      "How much coverage do I need?",
      "Cheapest home insurance in Estonia",
    ],
  },
  "health-insurance": {
    title: "Ask NordicAI about Health Insurance",
    subtitle: "Private health cover, dental, international — compare plans",
    gradient: "from-rose-600 to-pink-500",
    chips: [
      "What does private health insurance cover?",
      "Health insurance for expats in Estonia",
      "Is dental cover included?",
      "Compare If vs ERGO health plans",
    ],
  },
  "travel-insurance": {
    title: "Ask NordicAI about Travel Insurance",
    subtitle: "Annual vs single trip, Schengen requirements, medical limits",
    gradient: "from-sky-600 to-blue-500",
    chips: [
      "Annual vs single trip — which is better?",
      "Does this meet Schengen visa requirements?",
      "What's the medical cover limit?",
      "Best travel insurance for frequent flyers",
    ],
  },
  "life-insurance": {
    title: "Ask NordicAI about Life Insurance",
    subtitle: "Term life, mortgage protection, critical illness — personalized advice",
    gradient: "from-violet-600 to-purple-500",
    chips: [
      "How much life insurance do I need?",
      "Is life insurance required for a mortgage?",
      "Does smoking affect my premium?",
      "Compare SEB vs Swedbank life plans",
    ],
  },
  deposit: {
    title: "Ask NordicAI about Term Deposits",
    subtitle: "Best rates, DGSD protection, early withdrawal penalties explained",
    gradient: "from-[#1a3c6e] to-indigo-500",
    chips: [
      "Which bank has the best deposit rate?",
      "Are deposits safe in Estonia?",
      "Can I withdraw early if needed?",
      "Compare 6-month vs 12-month term",
    ],
  },
  compare: {
    title: "Ask NordicAI to Analyse Your Selection",
    subtitle: "AI-powered side-by-side analysis — get a verdict in seconds",
    gradient: "from-[#1a3c6e] to-amber-600",
    chips: [
      "Which of these is the best deal for me?",
      "What are the hidden costs?",
      "Explain the rate difference",
      "Which should I apply for first?",
    ],
  },
};

function openAI(message: string) {
  window.dispatchEvent(
    new CustomEvent("ask-ai-product", { detail: { message } })
  );
}

interface Props {
  productType: ProductType;
  /** Pre-fill context e.g. "LHV 9.9% APR, monthly €220" */
  context?: string;
  className?: string;
}

export default function AIPageBanner({ productType, context, className = "" }: Props) {
  const cfg = PAGE_CONFIG[productType];
  const [input, setInput] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const msg = (context ? `${context}\n\n` : "") + (input.trim() || "Give me your best recommendation");
    openAI(msg);
    setInput("");
  };

  return (
    <div className={`rounded-2xl overflow-hidden border border-white/10 shadow-lg ${className}`}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${cfg.gradient} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* AI avatar */}
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-extrabold text-sm leading-tight">{cfg.title}</p>
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">AI</span>
              </div>
              <p className="text-white/75 text-xs mt-0.5 leading-tight">{cfg.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(v => !v)}
            className="text-white/60 hover:text-white transition shrink-0 ml-2"
            aria-label="Toggle"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="bg-slate-900 px-5 py-4 space-y-3">
          {/* Quick chips */}
          <div className="flex flex-wrap gap-2">
            {cfg.chips.map((chip) => (
              <button
                key={chip}
                onClick={() => openAI((context ? `Context: ${context}\n\n` : "") + chip)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white/85 hover:text-white border border-white/15 rounded-full px-3 py-1.5 transition-all text-left"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Free-text input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="Or type your own question…"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition"
            />
            <button
              onClick={submit}
              className="bg-white/15 hover:bg-white/25 text-white rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 text-sm font-semibold border border-white/20"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </div>

          <p className="text-[10px] text-white/30 text-center">
            Powered by NordicAI · llama-3.3-70b · Not financial advice
          </p>
        </div>
      )}
    </div>
  );
}
