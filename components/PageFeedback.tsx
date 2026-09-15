'use client';

/**
 * PageFeedback — her içerik sayfasının altında tek soruluk mikro-anket.
 *
 * "Did you find what you were looking for?" → Yes: teşekkür. No: "What was
 * missing?" + isteğe bağlı e-posta (geri dönebilmek için). Tek tık cevabı bile
 * kaydedilir; yazı zorunlu değil — sürtünme düşük tutulursa cevap oranı yükselir.
 *
 * Aynı sayfa için oturumda bir kez sorulur (sessionStorage). Admin/auth
 * sayfalarında gösterilmez.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { getSessionContext, track } from '@/lib/tracker';

const HIDDEN_PREFIXES = ['/admin', '/login', '/register', '/onboarding', '/go'];

type Stage = 'ask' | 'details' | 'done';

function storageKey(path: string) {
  return `nr_fb:${path}`;
}

async function send(payload: Record<string, unknown>) {
  const ctx = getSessionContext();
  try {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, sessionId: ctx.sessionId, source: ctx.source }),
      keepalive: true,
    });
  } catch {
    // Ağ hatası kullanıcı akışını bozmamalı
  }
}

export default function PageFeedback() {
  const pathname = usePathname() || '/';
  const [stage, setStage] = useState<Stage>('ask');
  const [answered, setAnswered] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setStage('ask');
    setMessage('');
    setEmail('');
    try {
      setAnswered(sessionStorage.getItem(storageKey(pathname)) === '1');
    } catch {
      setAnswered(false);
    }
  }, [pathname]);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  if (answered && stage === 'ask') return null;

  const markAnswered = () => {
    try { sessionStorage.setItem(storageKey(pathname), '1'); } catch { /* yok say */ }
  };

  const answer = (helpful: boolean) => {
    markAnswered();
    void send({ kind: 'page_helpful', page: pathname, helpful });
    void track('feedback', { page: pathname, helpful });
    setStage(helpful ? 'done' : 'details');
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || email.trim()) {
      void send({ kind: 'missing', page: pathname, message, email: email.trim() || undefined });
    }
    setStage('done');
  };

  return (
    <section aria-label="Page feedback" className="max-w-3xl mx-auto px-4 my-10">
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
        {stage === 'ask' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">
              Did you find what you were looking for?
              <span className="block text-xs font-normal text-slate-500">
                NordicRate is new — your answer directly decides what we build next.
              </span>
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => answer(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700"
              >
                <ThumbsUp size={14} /> Yes
              </button>
              <button
                onClick={() => answer(false)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700"
              >
                <ThumbsDown size={14} /> No
              </button>
            </div>
          </div>
        )}

        {stage === 'details' && (
          <form onSubmit={submitDetails} className="space-y-3">
            <label htmlFor="fb-msg" className="block text-sm font-semibold text-slate-800">
              What was missing? A bank, a country, a product, a wrong number?
            </label>
            <textarea
              id="fb-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="e.g. I'm an expat in Tallinn and couldn't see which banks accept a temporary residence permit"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={200}
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Email (optional — only to tell you when it's fixed)"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Send size={14} /> Send
              </button>
            </div>
          </form>
        )}

        {stage === 'done' && (
          <p className="text-sm text-slate-600">
            Thank you — this goes straight to the founder. Rates or data wrong? Write to{' '}
            <a href="mailto:info@nordicrate.com" className="text-sky-700 underline">info@nordicrate.com</a>.
          </p>
        )}
      </div>
    </section>
  );
}
