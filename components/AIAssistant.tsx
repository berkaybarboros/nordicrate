'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { ChatMessage } from '@/app/api/chat/route';
import type { AssistantMode, OnboardingContext } from '@/lib/ai-context';
import type { UserProfile, EligibilityResult } from '@/lib/profile';
import { calculateEligibility } from '@/lib/profile';
import type { CorporateProfile, ProgramMatch } from '@/lib/corporate-profile';
import { matchPrograms } from '@/lib/corporate-profile';
import EligibilityPanel from '@/components/EligibilityPanel';
import ProgramMatchPanel from '@/components/ProgramMatchPanel';
import { supabase } from '@/lib/supabase';
import { getUserProfile, createLead } from '@/lib/db';
import { track } from '@/lib/tracker';
import { COUNTRIES } from '@/lib/data';
import { Bell } from 'lucide-react';

const DEFAULT_WELCOME: Record<AssistantMode, string> = {
  personal: `👋 Hi! I'm **NordicAI**, your personal finance assistant.

I can help you:
- 🔍 Find the best loan rates across 8 countries
- ✅ Check your loan eligibility
- 📊 Assess your financial risk
- 🌍 Compare personal loans, mortgages & auto loans

Tell me your situation — how much do you need, in which country, and what's your monthly income?`,

  corporate: `👋 Hi! I'm **NordicAI**, your corporate finance assistant.

I can help you:
- 🚀 Find startup & SME loans across 8 countries
- 🇪🇺 Navigate government programs & EU funds
- 🪪 Set up e-Residency & digital nomad visas
- 📋 Assess your business loan eligibility

Tell me about your business — stage, country, funding need & purpose.`,
};

function buildPersonalizedWelcome(profile: OnboardingContext, mode: AssistantMode): string {
  const firstName = profile.name?.split(' ')[0];
  const country = profile.country
    ? COUNTRIES.find(c => c.code === profile.country)
    : undefined;
  const loanType = profile.preferredLoanTypes?.[0];

  const greeting = firstName ? `👋 Hi **${firstName}**!` : '👋 Hi!';
  const context = [
    country  && `${country.flag} **${country.name}**`,
    loanType && `**${loanType} loan**`,
  ].filter(Boolean).join(' · ');

  if (mode === 'personal') {
    return `${greeting} I'm **NordicAI**, your personal finance assistant.

I've loaded your profile${context ? ` — ${context}` : ''}.

I can help you right now:
- 🔍 Show the best rates matching your profile
- ✅ Estimate your loan eligibility
- 📊 Calculate monthly payments

What would you like to know?`;
  }

  return `${greeting} I'm **NordicAI**, your corporate finance assistant.

I've loaded your profile${context ? ` — ${context}` : ''}.

I can help you right now:
- 🚀 Find the best business loans & programs
- 🇪🇺 Match EU funds & government grants
- 🪪 Guide you on e-Residency setup

What would you like to explore?`;
}

interface Message extends ChatMessage {
  id: string;
}

function MarkdownText({ text }: { text: string }) {
  // Simple markdown renderer for bold, bullets, and line breaks
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Bold text
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        });

        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-sky-400 mt-0.5 shrink-0">•</span>
              <span>{rendered}</span>
            </div>
          );
        }

        // Headers (lines starting with ##)
        if (line.startsWith('## ') || line.startsWith('### ')) {
          return <p key={i} className="font-bold text-slate-900">{rendered}</p>;
        }

        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  // Teaser tercihi kalıcı — bir kez kapatan kullanıcı her yenilemede tekrar görmez
  const [teaserDismissed, setTeaserDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('nr-teaser-dismissed') === 'true';
  });
  const [mode, setMode] = useState<AssistantMode>('personal');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [corporateProfile, setCorporateProfile] = useState<CorporateProfile>({});
  const [programMatches, setProgramMatches] = useState<ProgramMatch[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingContext | null>(null);
  // Lead capture
  const [leadCaptured, setLeadCaptured] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('nr-lead-captured') === 'true';
  });
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  // Load Supabase profile once on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const profile = await getUserProfile(data.session.user.id);
      if (!profile?.onboardingCompleted) return;
      const ctx: OnboardingContext = {
        name:               profile.name,
        country:            profile.country,
        preferredLoanTypes: profile.preferredLoanTypes,
        monthlyIncome:      profile.monthlyIncome,
        preferredMode:      profile.preferredMode,
      };
      setOnboardingData(ctx);
      if (profile.preferredMode) setMode(profile.preferredMode);
    });
  }, []);

  // Initialize messages for current mode — restore from localStorage or show welcome
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`nr-chat-${mode}`);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch { /* ignore */ }
    setMessages([{ id: 'welcome', role: 'assistant', content: DEFAULT_WELCOME[mode] }]);
  }, [mode]); // Only re-run on mode switch — intentionally omits onboardingData

  // When onboardingData arrives, upgrade the welcome message (only if no real conversation yet)
  useEffect(() => {
    if (!onboardingData) return;
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ id: 'welcome', role: 'assistant', content: buildPersonalizedWelcome(onboardingData, mode) }];
      }
      return prev;
    });
  }, [onboardingData, mode]);

  // Persist conversation to localStorage on every message update
  useEffect(() => {
    if (messages.length <= 1) return; // Don't save solo welcome message
    try {
      localStorage.setItem(`nr-chat-${mode}`, JSON.stringify(messages));
    } catch { /* ignore quota errors */ }
  }, [messages, mode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show unread dot when closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasUnread(true);
    }
  }, [messages, isOpen]);

  // Teaser balonu 4s sonra — SADECE hiç konuşma yoksa.
  // Mevcut konuşma varsa kırmızı "okunmamış" noktası zaten sinyal veriyor;
  // ikisini birden göstermek çelişkili ("yeni başla" vs "devam et").
  useEffect(() => {
    if (isOpen || teaserDismissed || hasUnread || messages.length > 1) return;
    const timer = setTimeout(() => setShowTeaser(true), 4000);
    return () => clearTimeout(timer);
  }, [isOpen, teaserDismissed, hasUnread, messages.length]);

  const dismissTeaser = useCallback(() => {
    setShowTeaser(false);
    setTeaserDismissed(true);
    try { localStorage.setItem('nr-teaser-dismissed', 'true'); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (Object.keys(userProfile).length === 0) {
      setEligibilityResult(null);
      return;
    }
    const result = calculateEligibility(userProfile);
    setEligibilityResult(result.score !== 'insufficient_data' ? result : null);
  }, [userProfile]);

  useEffect(() => {
    if (Object.keys(corporateProfile).length === 0) {
      setProgramMatches([]);
      return;
    }
    setProgramMatches(matchPrograms(corporateProfile, 5));
  }, [corporateProfile]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // "Ask AI about this" — kart butonlarından gelen pre-fill eventi
  useEffect(() => {
    const handler = (e: Event) => {
      const { message } = (e as CustomEvent<{ message: string }>).detail;
      setInput(message);
      setIsOpen(true);
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    };
    window.addEventListener('ask-ai-product', handler);
    return () => window.removeEventListener('ask-ai-product', handler);
  }, []);

  const fetchProfile = useCallback(async (msgs: Array<{ role: string; content: string }>) => {
    if (msgs.length < 2) return;

    // Broadcast messages to EligibilityPanel on loan pages (even before API call)
    window.dispatchEvent(new CustomEvent('ai-messages-updated', { detail: { messages: msgs, mode } }));

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs, mode }),
      });
      if (!res.ok) return;
      const extracted = await res.json() as Record<string, unknown>;
      if (Object.keys(extracted).length === 0) return;
      if (mode === 'personal') {
        setUserProfile(prev => ({ ...prev, ...(extracted as UserProfile) }));
      } else {
        setCorporateProfile(prev => ({ ...prev, ...(extracted as CorporateProfile) }));
      }
    } catch { /* silent — profile is best-effort */ }
  }, [mode]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const currentMessages = [...messages.filter(m => m.id !== 'welcome'), userMessage];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Placeholder for streaming assistant message
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      abortRef.current = new AbortController();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
          mode,
          ...(onboardingData ? { onboardingProfile: onboardingData } : {}),
          ...(mode === 'corporate' && Object.keys(corporateProfile).length > 0
            ? { corporateProfile }
            : {}),
        }),
        signal: abortRef.current.signal,
      });

      if (res.status === 429) throw new Error('rate_limited');
      if (!res.ok) throw new Error('API error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const { text } = JSON.parse(data);
              fullContent += text;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + text }
                    : m
                )
              );
            } catch {
              // ignore parse errors
            }
          }
        }
      }
      if (fullContent) {
        fetchProfile([
          ...currentMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'assistant' as const, content: fullContent },
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const friendly = err.message === 'rate_limited'
          ? '⏳ NordicAI is at capacity right now — please wait ~30 seconds and send your message again.'
          : '⚠️ Something went wrong. Please try again.';
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: friendly }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, mode, corporateProfile, onboardingData, fetchProfile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleModeSwitch = (newMode: AssistantMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setUserProfile({});
    setEligibilityResult(null);
    setCorporateProfile({});
    setProgramMatches([]);
    // History is preserved per-mode in localStorage — init effect will restore it
  };

  const handleClearConversation = useCallback(() => {
    localStorage.removeItem(`nr-chat-${mode}`);
    const content = onboardingData
      ? buildPersonalizedWelcome(onboardingData, mode)
      : DEFAULT_WELCOME[mode];
    setMessages([{ id: 'welcome', role: 'assistant', content }]);
    setUserProfile({});
    setEligibilityResult(null);
    setCorporateProfile({});
    setProgramMatches([]);
  }, [mode, onboardingData]);

  const handleLeadSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail.includes('@') || leadSaving) return;
    setLeadSaving(true);
    try {
      await createLead({
        email:          leadEmail,
        mode,
        country:        mode === 'personal' ? userProfile.country : corporateProfile.country,
        loanType:       userProfile.loanType,
        loanAmount:     userProfile.loanAmount,
        monthlyIncome:  userProfile.monthlyIncome,
        employmentType: userProfile.employmentType,
        businessStage:  corporateProfile.businessStage,
        fundingNeeded:  corporateProfile.fundingNeeded,
        sector:         corporateProfile.sector,
        source:         'ai_chat',
      });
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:   leadEmail,
          product: mode === 'personal' ? (userProfile.loanType ?? 'personal-loan') : 'business-loan',
        }),
      });
      setLeadSaved(true);
      setLeadCaptured(true);
      localStorage.setItem('nr-lead-captured', 'true');
      track('find_rate_submit', { mode, source: 'ai_chat' });
    } catch { /* silent */ }
    finally { setLeadSaving(false); }
  }, [leadEmail, leadSaving, mode, userProfile, corporateProfile]);

  return (
    <>
      {/* Teaser bubble — 4s sonra, tek satır. Maskot/başlık yok: hemen altındaki
          FAB zaten "Ask NordicAI" + maskot gösteriyor, tekrar etmiyoruz. */}
      {showTeaser && !isOpen && !teaserDismissed && (
        <div className="fixed bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl px-4 py-3 max-w-[220px] relative">
            <button
              onClick={dismissTeaser}
              aria-label="Dismiss"
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-300 hover:bg-slate-400 text-white rounded-full text-xs flex items-center justify-center transition"
            >
              ×
            </button>
            <p className="text-[13px] text-slate-700 leading-snug">
              👋 Need help comparing loans or checking your eligibility?
            </p>
            <button
              onClick={() => { dismissTeaser(); handleOpen(); }}
              className="mt-2 text-xs font-bold text-violet-600 hover:text-violet-700"
            >
              Chat now →
            </button>
            {/* Tail — FAB'a doğru ok */}
            <div className="absolute -bottom-2 right-8 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
          </div>
        </div>
      )}

      {/* Floating button — pill on desktop, circle on mobile */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Pulse ring — visible when chat is closed and no conversation yet */}
        {!isOpen && messages.length <= 1 && (
          <span className="absolute inset-0 rounded-full bg-violet-500 opacity-20 animate-ping pointer-events-none" />
        )}
        <button
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          aria-label="Open AI Assistant"
          className={`relative flex items-center gap-2.5 text-white font-bold shadow-2xl transition-all active:scale-95 select-none
            ${isOpen
              ? 'bg-slate-700 hover:bg-slate-600 rounded-full w-12 h-12 justify-center'
              : 'bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 rounded-full md:rounded-2xl h-14 px-5 hover:shadow-violet-500/40 hover:shadow-lg'
            }`}
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              {/* Tilki maskot — FAB avatarı */}
              <Image
                src="/nordicai-fab.png"
                alt="NordicAI"
                width={32}
                height={32}
                className="shrink-0 rounded-full bg-white ring-2 ring-white/60"
              />
              {/* Label — hidden on mobile */}
              <span className="hidden md:inline text-sm">Ask NordicAI</span>
              {/* Unread or "AI" badge */}
              {hasUnread ? (
                <span className="w-2 h-2 bg-red-400 rounded-full shrink-0" />
              ) : (
                <span className="hidden md:inline text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold shrink-0">AI</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-[88px] right-6 z-50 w-[400px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Image src="/nordicai.png" alt="NordicAI" width={32} height={32} className="rounded-full bg-white" />
              <div>
                <p className="text-white font-bold text-sm leading-none">NordicAI</p>
                <p className="text-slate-400 text-xs mt-0.5">Credit & Loan Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button
                  onClick={handleClearConversation}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition px-2 py-1 rounded-lg hover:bg-white/10"
                  title="Clear conversation"
                >
                  Clear
                </button>
              )}
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">Online</span>
              </div>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex border-b border-slate-100 shrink-0">
            {(['personal', 'corporate'] as AssistantMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeSwitch(m)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  mode === m
                    ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {m === 'personal' ? '👤 Personal' : '🏢 Corporate'}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-xs shrink-0 mr-2 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    msg.content ? (
                      <MarkdownText text={msg.content} />
                    ) : (
                      <div className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {(mode === 'personal'
                  ? onboardingData?.country && onboardingData?.preferredLoanTypes?.[0]
                    ? [
                        `Best ${onboardingData.preferredLoanTypes[0]} rates in ${COUNTRIES.find(c => c.code === onboardingData.country)?.name ?? onboardingData.country}`,
                        'Am I eligible based on my profile?',
                        'Compare my top options',
                      ]
                    : [
                        'Best mortgage in Finland',
                        'Am I eligible for a loan?',
                        'Lowest personal loan rate',
                      ]
                  : onboardingData?.country
                    ? [
                        `Business loans in ${COUNTRIES.find(c => c.code === onboardingData.country)?.name ?? onboardingData.country}`,
                        'e-Residency guide',
                        'EU funding options for me',
                      ]
                    : [
                        'Startup loans in Estonia',
                        'e-Residency guide',
                        'EU funding for my startup',
                      ]
                ).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-full px-3 py-1 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility Panel — personal mode */}
          {eligibilityResult && mode === 'personal' && (
            <EligibilityPanel profile={userProfile} result={eligibilityResult} />
          )}

          {/* Program Match Panel — corporate mode */}
          {programMatches.length > 0 && mode === 'corporate' && (
            <ProgramMatchPanel matches={programMatches} />
          )}

          {/* Lead capture nudge — appears after 2+ user messages */}
          {messages.filter(m => m.role === 'user').length >= 2 && !leadCaptured && (
            <div className="mx-3 mb-2 shrink-0 bg-gradient-to-r from-violet-50 to-sky-50 border border-violet-200 rounded-xl p-3">
              {leadSaved ? (
                <p className="text-xs font-semibold text-emerald-700 text-center py-0.5">
                  ✓ Saved! We&apos;ll alert you when rates improve.
                </p>
              ) : (
                <>
                  <p className="text-[11px] font-bold text-violet-800 mb-2 flex items-center gap-1.5">
                    <Bell size={11} className="text-violet-600" />
                    Save your results &amp; get rate alerts
                  </p>
                  <form onSubmit={handleLeadSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={e => setLeadEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 text-xs border border-violet-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-400 min-w-0"
                    />
                    <button
                      type="submit"
                      disabled={leadSaving}
                      className="text-xs bg-violet-600 hover:bg-violet-700 text-white font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-60 shrink-0"
                    >
                      {leadSaving ? '…' : 'Save →'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-100 px-3 py-3 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'personal' ? 'Ask about loans, eligibility, rates...' : 'Ask about business loans, programs...'}
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-slate-400 disabled:opacity-50 max-h-24"
                style={{ minHeight: '38px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              Rates are indicative — always verify with the bank
            </p>
          </div>
        </div>
      )}
    </>
  );
}
