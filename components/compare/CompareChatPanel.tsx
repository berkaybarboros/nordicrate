'use client';

/**
 * CompareChatPanel
 * Karşılaştırma sayfasına gömülü bağlamsal AI sohbet paneli.
 * Karşılaştırılan ürünleri context olarak alır, sorulara gerçek zamanlı cevap verir.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, Sparkles, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { CompareItem } from '@/contexts/CompareContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  items: CompareItem[];
  userCtx?: string;
}

function getSuggestedQuestions(items: CompareItem[]): string[] {
  if (!items.length) return [];
  const type = items[0].type;
  const names = items.map(i => i.name);
  const first = names[0];
  const second = names[1] ?? names[0];

  if (type === 'loan') return [
    `Which has the lowest total cost over 5 years?`,
    `Is ${first} or ${second} better for a first-time borrower?`,
    `How much would I save by choosing the cheapest option?`,
    `Which has faster approval and disbursement?`,
  ];
  if (type === 'insurance') return [
    `Which gives better value for money?`,
    `What's the difference in excess between ${first} and ${second}?`,
    `Which is better for a young driver?`,
    `What does the cheapest option NOT cover?`,
  ];
  return [
    `Which gives the best return over 12 months?`,
    `Is there a penalty for early withdrawal?`,
    `Which is safest for large deposits?`,
    `How do their interest rates compare to inflation?`,
  ];
}

export default function CompareChatPanel({ items, userCtx }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const suggested = getSuggestedQuestions(items);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setStreaming(true);

    // Placeholder for assistant
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/compare-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          compareItems: items,
          userCtx,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Try again.' };
          return copy;
        });
        return;
      }

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
            setMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: 'assistant', content: accumulated };
              return copy;
            });
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: 'Connection interrupted. Please try again.' };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
    }
  }, [messages, items, userCtx, streaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
  };

  // ── Collapsed state ──────────────────────────────────────────────────────────
  if (!open) {
    return (
      <div
        className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 cursor-pointer hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-200"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">Ask AI about this comparison</p>
              <p className="text-white/70 text-xs">Get instant answers about these {items.length} products</p>
            </div>
          </div>
          <ChevronDown size={18} className="text-white/60" />
        </div>

        {/* Suggested question chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {suggested.slice(0, 3).map(q => (
            <span
              key={q}
              className="text-xs bg-white/10 hover:bg-white/20 text-white/90 px-3 py-1.5 rounded-full border border-white/10 transition"
            >
              {q}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ── Open state ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-xl shadow-violet-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-white" />
          <span className="font-bold text-white text-sm">AI Comparison Assistant</span>
          <span className="text-[10px] bg-white/15 text-white/80 px-2 py-0.5 rounded-full">
            Knows these {items.length} products
          </span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={reset} className="text-white/50 hover:text-white transition" title="Clear chat">
              <RotateCcw size={13} />
            </button>
          )}
          <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition">
            <ChevronUp size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
        {messages.length === 0 ? (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-slate-400 text-center mb-3">Suggested questions</p>
            {suggested.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="w-full text-left text-sm bg-white border border-slate-100 hover:border-violet-200 hover:bg-violet-50 text-slate-600 hover:text-violet-700 px-4 py-2.5 rounded-xl transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm'
              }`}>
                {msg.content || (
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-white">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about these products…"
          disabled={streaming}
          className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder:text-slate-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="w-10 h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 text-white rounded-xl transition-colors flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
