'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, BarChart2, Lightbulb, ChevronRight } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TabKey = 'summary' | 'suggestions' | 'compare';

interface Props {
  /** e.g. "motor insurance", "personal loans", "mortgage", "home insurance" */
  productType: string;
  /** e.g. "Estonia", "Finland" – optional */
  country?: string;
  /** Tailwind gradient class for the header */
  accentGradient?: string;
}

// ─── Prompt templates ──────────────────────────────────────────────────────────
function buildPrompt(tab: TabKey, productType: string, country?: string): string {
  const ctx = country ? `in ${country}` : 'in the Nordic & Baltic region';
  switch (tab) {
    case 'summary':
      return `Write a concise market overview (4-5 sentences, no headers, no bullet points) for ${productType} ${ctx}. Cover: current rate/premium ranges, market trends in 2024-2025, what consumers should know. Be specific with numbers where possible.`;
    case 'suggestions':
      return `Give exactly 5 practical tips for someone comparing ${productType} ${ctx}. Format as a numbered list (1. 2. 3. 4. 5.). Each tip should be one to two sentences. Be actionable and specific.`;
    case 'compare':
      return `Explain the 4 most important metrics to compare when choosing ${productType} ${ctx}. Format as a numbered list (1. 2. 3. 4.). Include: what each metric means, why it matters, and a quick red-flag warning. Keep each point under 3 sentences.`;
  }
}

// ─── Hook: stream AI response ──────────────────────────────────────────────────
function useAIStream(prompt: string | null) {
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);
  const abortRef              = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!prompt) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setText('');
    setLoading(true);
    setError(false);

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        mode: 'personal',
      }),
    })
      .then(async res => {
        const reader = res.body?.getReader();
        if (!reader) throw new Error('no body');
        const dec = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') break;
            try {
              const parsed = JSON.parse(raw) as { type?: string; text?: string; delta?: { text?: string } };
              const chunk =
                parsed.text ??
                parsed.delta?.text ??
                '';
              if (chunk) setText(prev => prev + chunk);
            } catch {
              /* non-JSON line, skip */
            }
          }
        }
        setLoading(false);
      })
      .catch(err => {
        if ((err as Error).name !== 'AbortError') {
          setError(true);
          setLoading(false);
        }
      });

    return () => ctrl.abort();
  }, [prompt]);

  return { text, loading, error };
}

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS: { key: TabKey; icon: React.ReactNode; label: string }[] = [
  { key: 'summary',     icon: <BarChart2 size={14} />,  label: 'Market Summary'  },
  { key: 'suggestions', icon: <Lightbulb size={14} />,  label: 'AI Suggestions'  },
  { key: 'compare',     icon: <ChevronRight size={14} />, label: 'Compare Guide'  },
];

// ─── Main component ────────────────────────────────────────────────────────────
export default function AIProductSection({ productType, country, accentGradient = 'from-[#1a3c6e] to-[#2563eb]' }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [triggered, setTriggered] = useState<Partial<Record<TabKey, string>>>({});

  // Fetch summary automatically on mount
  useEffect(() => {
    const prompt = buildPrompt('summary', productType, country);
    setTriggered(prev => ({ ...prev, summary: prompt }));
  }, [productType, country]);

  const { text, loading, error } = useAIStream(triggered[activeTab] ?? null);

  function activateTab(tab: TabKey) {
    setActiveTab(tab);
    if (!triggered[tab]) {
      const prompt = buildPrompt(tab, productType, country);
      setTriggered(prev => ({ ...prev, [tab]: prompt }));
    }
  }

  // Format text: detect numbered lists and render nicely
  function renderContent(raw: string) {
    if (!raw) return null;
    // Split on numbered list items: "1. " at start of line
    const lines = raw.split('\n').filter(l => l.trim());
    const isNumbered = lines.some(l => /^\d+\./.test(l.trim()));

    if (isNumbered) {
      return (
        <ol className="space-y-3">
          {lines.map((line, i) => {
            const match = line.match(/^(\d+)\.\s+(.*)$/);
            if (!match) return <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>;
            return (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {match[1]}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{match[2]}</p>
              </li>
            );
          })}
        </ol>
      );
    }

    return (
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{raw}</p>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${accentGradient} px-5 py-4 flex items-center gap-2.5`}>
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">AI Insights</p>
          <p className="text-white/60 text-xs">Powered by Groq · {productType}{country ? ` · ${country}` : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => activateTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'text-sky-700 border-b-2 border-sky-600 bg-sky-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 min-h-[120px]">
        {loading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-3.5 bg-gray-100 rounded-full animate-pulse ${i === 3 ? 'w-2/3' : 'w-full'}`} />
            ))}
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
              AI is generating insights…
            </p>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 flex items-center gap-2">
            <span>⚠️</span> Could not load AI insights. Please try again.
          </div>
        )}

        {!loading && !error && text && renderContent(text)}
      </div>

      <div className="px-5 pb-4">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          AI-generated content is for informational purposes only and may not reflect real-time market conditions. Always verify rates directly with providers.
        </p>
      </div>
    </div>
  );
}
