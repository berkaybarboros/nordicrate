'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '@/app/api/chat/route';
import type { AssistantMode } from '@/lib/ai-context';
import type { UserProfile, EligibilityResult } from '@/lib/profile';
import { calculateEligibility } from '@/lib/profile';
import type { CorporateProfile, ProgramMatch } from '@/lib/corporate-profile';
import { matchPrograms } from '@/lib/corporate-profile';
import EligibilityPanel from '@/components/EligibilityPanel';
import ProgramMatchPanel from '@/components/ProgramMatchPanel';

const WELCOME_MESSAGES: Record<AssistantMode, string> = {
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

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: WELCOME_MESSAGES[mode],
      },
    ]);
  }, [mode]);

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

  const fetchProfile = useCallback(async (msgs: Array<{ role: string; content: string }>) => {
    if (msgs.length < 2) return;
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
          ...(mode === 'corporate' && Object.keys(corporateProfile).length > 0
            ? { corporateProfile }
            : {}),
        }),
        signal: abortRef.current.signal,
      });

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
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: '⚠️ Something went wrong. Please try again.' }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, mode, corporateProfile, fetchProfile]);

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
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-sm">
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">NordicAI</p>
                <p className="text-slate-400 text-xs mt-0.5">Credit & Loan Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400">Online</span>
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
                  ? [
                      'Best mortgage in Finland',
                      'Am I eligible for a loan?',
                      'Lowest personal loan rate',
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
