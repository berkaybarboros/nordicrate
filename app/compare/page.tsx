"use client";

import { useCompare, CompareItem } from "@/contexts/CompareContext";
import { BarChart2, X, ExternalLink, ArrowLeft, CheckCircle, XCircle, TrendingDown, Award, Sparkles, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import CompareChatPanel from "@/components/compare/CompareChatPanel";
import { calculateMonthlyPayment } from "@/lib/utils";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function bestIndex(items: CompareItem[], key: keyof CompareItem): number {
  const values = items.map((it) => (it[key] as number | undefined) ?? Infinity);
  const min = Math.min(...values);
  return values.indexOf(min);
}

function bestIndexMax(items: CompareItem[], key: keyof CompareItem): number {
  const values = items.map((it) => (it[key] as number | undefined) ?? -Infinity);
  const max = Math.max(...values);
  return values.indexOf(max);
}

// ─── AI Verdict ───────────────────────────────────────────────────────────────
function AIVerdict({ items }: { items: CompareItem[] }) {
  const [verdicts, setVerdicts] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchVerdict() {
      try {
        const res = await fetch('/api/compare-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `Give a one-sentence verdict for EACH product. Format exactly as:
#1 [ProductName]: [verdict in max 15 words]
#2 [ProductName]: [verdict in max 15 words]
${items.length === 3 ? '#3 [ProductName]: [verdict in max 15 words]\n' : ''}Then add: "Winner: [ProductName] — [reason in 10 words]"
Be direct and concrete. No fluff.`,
            }],
            compareItems: items,
          }),
        });
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data) as { choices: { delta: { content?: string } }[] };
              const delta = parsed.choices?.[0]?.delta?.content ?? '';
              accumulated += delta;
              if (!cancelled) setVerdicts(accumulated);
            } catch { /* skip */ }
          }
        }
      } catch { /* silent fail */ } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchVerdict();
    return () => { cancelled = true; };
  }, [items]);

  if (!verdicts && !loading) return null;

  return (
    <div className="mt-6 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
          <Sparkles size={14} className="text-violet-600" />
        </div>
        <span className="font-extrabold text-sm text-slate-800">AI Verdict</span>
        <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-semibold">Instant analysis</span>
      </div>
      {loading && !verdicts ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-4 bg-indigo-100/60 rounded animate-pulse" />)}
        </div>
      ) : (
        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{verdicts}</pre>
      )}
    </div>
  );
}

// ─── Scenario Slider ──────────────────────────────────────────────────────────
function ScenarioSlider({ items }: { items: CompareItem[] }) {
  const loanItems = items.filter(it => it.rawRate != null);
  if (loanItems.length < 2) return null;

  const [amount, setAmount] = useState(10000);
  const [termMonths, setTermMonths] = useState(36);
  const colColors = ["#1a3c6e", "#b45309", "#16a34a"];

  const scenarios = loanItems.map((item, i) => {
    const monthly = calculateMonthlyPayment(amount, item.rawRate!, termMonths);
    const total = Math.round(monthly * termMonths);
    return { name: item.name, logo: item.logo, rate: item.rawRate!, monthly: Math.round(monthly), total, color: colColors[i], applyUrl: item.applyUrl };
  });
  const cheapest = scenarios.reduce((a, b) => a.total < b.total ? a : b);

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={16} className="text-sky-600" />
        <span className="font-extrabold text-sm text-slate-800">Scenario Calculator</span>
        <span className="text-xs text-gray-400">Adjust to see live cost changes</span>
      </div>

      {/* Sliders */}
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Loan Amount</span>
            <span className="font-bold text-[#1a3c6e]">€{amount.toLocaleString()}</span>
          </div>
          <input type="range" min={1000} max={50000} step={500} value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full accent-[#1a3c6e]" />
          <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
            <span>€1,000</span><span>€50,000</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Term</span>
            <span className="font-bold text-[#1a3c6e]">{termMonths} months</span>
          </div>
          <input type="range" min={12} max={120} step={6} value={termMonths}
            onChange={e => setTermMonths(Number(e.target.value))}
            className="w-full accent-[#1a3c6e]" />
          <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
            <span>12 mo</span><span>120 mo</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${scenarios.length}, 1fr)` }}>
        {scenarios.map((s) => {
          const isBest = s.name === cheapest.name;
          return (
            <div key={s.name} className={`rounded-xl p-3 border text-center ${isBest ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}>
              <p className="text-lg mb-0.5">{s.logo}</p>
              <p className="text-[11px] font-semibold text-gray-600 truncate">{s.name}</p>
              <p className={`text-xl font-extrabold mt-1 ${isBest ? 'text-emerald-600' : 'text-gray-900'}`}>
                €{s.monthly.toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span>
              </p>
              <p className="text-xs text-gray-400">Total: €{s.total.toLocaleString()}</p>
              {isBest && <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">CHEAPEST</span>}
            </div>
          );
        })}
      </div>

      {scenarios.length >= 2 && (
        <p className="text-xs text-center text-gray-400 mt-3">
          Choosing <strong>{cheapest.name}</strong> saves €{(Math.max(...scenarios.map(s => s.total)) - cheapest.total).toLocaleString()} over {termMonths} months
        </p>
      )}
    </div>
  );
}

// ─── Financial Analysis ────────────────────────────────────────────────────────
function FinancialAnalysis({ items }: { items: CompareItem[] }) {
  // Only meaningful for loans with rawRate + rawMonthly
  const loanItems = items.filter(it => it.rawRate != null && it.rawMonthly != null);
  if (loanItems.length < 2) return null;

  // Assume 60-month term for analysis (standard personal loan benchmark)
  // Use rawMonthly × 60 as total cost proxy
  const TERM = 60;

  const costs = loanItems.map(it => ({
    name: it.name,
    logo: it.logo,
    rate: it.rawRate!,
    monthly: it.rawMonthly!,
    totalCost: Math.round(it.rawMonthly! * TERM),
    totalInterest: it.rawTotal != null ? Math.round(it.rawTotal) : Math.round(it.rawMonthly! * TERM - (it.rawMonthly! * TERM / (1 + it.rawRate! / 100 / 12 * TERM))),
    applyUrl: it.applyUrl,
  }));

  const cheapest   = costs.reduce((a, b) => a.totalCost < b.totalCost ? a : b);
  const mostExpensive = costs.reduce((a, b) => a.totalCost > b.totalCost ? a : b);
  const maxSaving  = mostExpensive.totalCost - cheapest.totalCost;
  const maxMonthly = Math.max(...costs.map(c => c.monthly));
  const colColors  = ["#1a3c6e", "#b45309", "#16a34a"];

  return (
    <div className="mt-6 space-y-4">

      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        <TrendingDown size={18} className="text-sky-600" />
        <h2 className="text-lg font-extrabold text-gray-900">Financial Analysis</h2>
        <span className="text-xs text-gray-400 font-normal ml-1">Based on {TERM}-month benchmark</span>
      </div>

      {/* Total cost bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Total Cost of Borrowing ({TERM} months)</p>
        <div className="space-y-3">
          {costs.map((c, i) => {
            const pct = maxSaving > 0 ? (c.totalCost / mostExpensive.totalCost) * 100 : 100;
            const isBest = c.name === cheapest.name;
            return (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.logo}</span>
                    <span className="text-sm font-semibold text-gray-700">{c.name}</span>
                    {isBest && (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award size={10} /> BEST
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-extrabold ${isBest ? 'text-emerald-600' : 'text-gray-900'}`}>
                      €{c.totalCost.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">total</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: isBest ? '#16a34a' : colColors[i] }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>€{Math.round(c.monthly).toLocaleString()}/mo</span>
                  <span>{c.rate}% APR</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly payment comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Monthly Payment Comparison</p>
        <div className="flex items-end gap-3 h-24">
          {costs.map((c, i) => {
            const pct = (c.monthly / maxMonthly) * 100;
            const isBest = c.monthly === Math.min(...costs.map(x => x.monthly));
            return (
              <div key={c.name} className="flex-1 flex flex-col items-center gap-1">
                <span className={`text-xs font-bold ${isBest ? 'text-emerald-600' : 'text-gray-600'}`}>
                  €{Math.round(c.monthly).toLocaleString()}
                </span>
                <div className="w-full rounded-t-lg transition-all duration-700"
                  style={{ height: `${pct * 0.7}%`, backgroundColor: isBest ? '#16a34a' : colColors[i], minHeight: '8px' }}
                />
                <span className="text-xs text-gray-400 truncate w-full text-center">{c.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings recommendation */}
      {maxSaving > 50 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <Award size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-emerald-900 mb-1">
                {cheapest.logo} {cheapest.name} saves you the most
              </p>
              <p className="text-sm text-emerald-700">
                Choosing <strong>{cheapest.name}</strong> over <strong>{mostExpensive.name}</strong> saves{' '}
                <strong className="text-emerald-900">€{maxSaving.toLocaleString()}</strong> over {TERM} months —{' '}
                that&apos;s <strong>€{Math.round(maxSaving / TERM).toLocaleString()}/month</strong> back in your pocket.
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                Rate difference: {Math.abs(cheapest.rate - mostExpensive.rate).toFixed(2)} percentage points
                {costs.length === 2 && (
                  <> · Break-even at month {Math.ceil(maxSaving / Math.abs(costs[0].monthly - costs[1].monthly))}</>
                )}
              </p>
              <a href={cheapest.applyUrl} target="_blank" rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 mt-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Apply for {cheapest.name} <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) {
    return (
      <div className="bg-[#f8fafc] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BarChart2 size={64} className="mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-extrabold text-[#1a3c6e] mb-2">
            No items to compare yet
          </h1>
          <p className="text-gray-500 mb-6">
            Browse loans, insurance or deposits and click{" "}
            <span className="font-semibold text-[#1a3c6e]">+ Compare</span> to add up to 3 items.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/loans/personal"
              className="bg-[#1a3c6e] text-white font-bold rounded-xl px-5 py-2.5 hover:bg-[#152e55] transition"
            >
              Personal Loans
            </Link>
            <Link
              href="/insurance/motor"
              className="bg-[#1a3c6e] text-white font-bold rounded-xl px-5 py-2.5 hover:bg-[#152e55] transition"
            >
              Motor Insurance
            </Link>
            <Link
              href="/deposits"
              className="bg-[#1a3c6e] text-white font-bold rounded-xl px-5 py-2.5 hover:bg-[#152e55] transition"
            >
              Deposits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine comparison type from first item
  const type = items[0].type;

  // Build metric rows dynamically from first item's metrics
  const metricLabels = items[0].metrics.map((m) => m.label);

  // Pick "best" column for numeric metrics
  const rateIdx = type === "deposit" ? bestIndexMax(items, "rawRate") : bestIndex(items, "rawRate");
  const monthlyIdx = bestIndex(items, "rawMonthly");
  const premiumIdx = bestIndex(items, "rawPremium");
  const interestIdx = bestIndexMax(items, "rawInterest");
  const totalIdx = bestIndexMax(items, "rawTotal");

  const bestMap: Record<string, number> = {
    "Interest Rate": rateIdx,
    "Rate p.a.": rateIdx,
    "Representative Rate": rateIdx,
    "Annual Rate": rateIdx,
    "Monthly Payment": monthlyIdx,
    "Monthly Premium": premiumIdx,
    "Annual Premium": premiumIdx,
    "You Earn": interestIdx,
    "Total at Maturity": totalIdx,
  };

  const colColors = ["#1a3c6e", "#b45309", "#16a34a"];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#b45309] text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Link
            href={
              type === "loan"
                ? "/loans/personal"
                : type === "insurance"
                ? "/insurance/motor"
                : "/deposits"
            }
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition"
          >
            <ArrowLeft size={14} /> Back to results
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-1 flex items-center gap-2">
                <BarChart2 size={28} />
                Side-by-Side Comparison
              </h1>
              <p className="text-white/80">
                Comparing {items.length} {type}
                {items.length > 1 ? "s" : ""} ·{" "}
                <button
                  onClick={clear}
                  className="underline text-white/60 hover:text-white transition text-sm"
                >
                  Clear all
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Product header row */}
        <div
          className="grid gap-3 mb-1"
          style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}
        >
          <div />
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border p-4 text-center relative"
              style={{ borderColor: colColors[idx] + "33" }}
            >
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition"
                aria-label="Remove"
              >
                <X size={14} />
              </button>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mx-auto mb-2 border"
                style={{ borderColor: colColors[idx] + "44", backgroundColor: colColors[idx] + "0A" }}
              >
                {item.logo}
              </div>
              <p className="font-bold text-gray-900 text-sm">{item.name}</p>
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 capitalize"
                style={{
                  backgroundColor: colColors[idx] + "1A",
                  color: colColors[idx],
                }}
              >
                {item.type}
              </span>
            </div>
          ))}
        </div>

        {/* Metric rows */}
        {metricLabels.map((label, mIdx) => {
          const bestCol = bestMap[label];
          return (
            <div
              key={label}
              className={`grid gap-3 mb-1 items-center ${
                mIdx % 2 === 0 ? "bg-white" : "bg-white/60"
              } rounded-xl`}
              style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}
            >
              {/* Row label */}
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {label}
                </p>
              </div>

              {/* Values */}
              {items.map((item, colIdx) => {
                const metric = item.metrics[mIdx];
                const isBest = bestCol === colIdx && items.length > 1;
                const rawVal = metric?.value ?? "—";
                const isCheck =
                  rawVal === "Yes" ||
                  rawVal === "✓" ||
                  rawVal === "Instant";
                const isCross = rawVal === "No";

                return (
                  <div key={item.id} className="px-4 py-3 text-center">
                    {isCheck ? (
                      <CheckCircle size={18} className="text-green-500 mx-auto" />
                    ) : isCross ? (
                      <XCircle size={18} className="text-red-400 mx-auto" />
                    ) : (
                      <p
                        className={`font-extrabold text-lg ${
                          isBest ? "text-green-600" : "text-gray-900"
                        }`}
                      >
                        {String(rawVal)}
                        {isBest && (
                          <span className="ml-1 text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full align-middle">
                            BEST
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* CTA row */}
        <div
          className="grid gap-3 mt-4 items-center"
          style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}
        >
          <div className="px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Apply</p>
          </div>
          {items.map((item, idx) => (
            <div key={item.id} className="px-2 py-2 text-center">
              <a
                href={item.applyUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 font-bold text-sm text-white rounded-xl px-4 py-2.5 transition w-full justify-center"
                style={{ backgroundColor: colColors[idx] }}
              >
                {item.type === "insurance" ? "Get Quote" : item.type === "deposit" ? "Open Deposit" : "Apply Now"}
                <ExternalLink size={13} />
              </a>
            </div>
          ))}
        </div>

        {/* AI Verdict */}
        <AIVerdict items={items} />

        {/* Scenario Calculator (loans only) */}
        <ScenarioSlider items={items} />

        {/* Financial Analysis */}
        <FinancialAnalysis items={items} />

        {/* AI Compare Chat */}
        <div className="mt-6">
          <CompareChatPanel items={items} />
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed max-w-2xl mx-auto">
          Rates and premiums shown are representative examples. Final rates depend on your credit
          profile and the provider&apos;s assessment. NordicRate is a comparison service — we do not
          provide financial products directly.
        </p>
      </div>
    </div>
  );
}
