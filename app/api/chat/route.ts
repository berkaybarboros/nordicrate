import { buildSystemPrompt, type AssistantMode, type OnboardingContext } from '@/lib/ai-context';
import type { LiveRatesData } from '@/lib/types';
import { matchPrograms, type CorporateProfile } from '@/lib/corporate-profile';
import { enforceRateLimit, sanitizeChatMessages } from '@/lib/security';

export const runtime = 'nodejs';
export const maxDuration = 30;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Live rates module-level cache — her mesajda HTTP round-trip yapmamak için.
// PM2 cluster'da worker başına ayrı cache; 1 saat TTL.
const RATES_TTL_MS = 60 * 60 * 1000;
let ratesCache: { data: LiveRatesData; fetchedAt: number } | null = null;

async function fetchLiveRates(): Promise<LiveRatesData | undefined> {
  if (ratesCache && Date.now() - ratesCache.fetchedAt < RATES_TTL_MS) {
    return ratesCache.data;
  }
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';
    const res = await fetch(`${base}/api/rates`, { next: { revalidate: 3600 } });
    if (!res.ok) return ratesCache?.data;
    const data = (await res.json()) as LiveRatesData;
    ratesCache = { data, fetchedAt: Date.now() };
    return data;
  } catch {
    return ratesCache?.data;
  }
}

export async function POST(req: Request) {
  try {
    // 20 istek/dk/IP — Groq maliyet + DoS koruması
    const limited = enforceRateLimit(req, 'chat', 20);
    if (limited) return limited;

    const {
      messages: rawMessages,
      mode = 'personal',
      corporateProfile,
      onboardingProfile,
    }: { messages: unknown; mode: AssistantMode; corporateProfile?: CorporateProfile; onboardingProfile?: OnboardingContext } = await req.json();

    const messages = sanitizeChatMessages(rawMessages);
    if (!messages) {
      return Response.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const liveRates = await fetchLiveRates();

    let topProgramsText: string | undefined;
    if (mode === 'corporate' && corporateProfile && Object.keys(corporateProfile).length > 0) {
      const matches = matchPrograms(corporateProfile, 5);
      if (matches.length > 0) {
        topProgramsText = matches
          .map((m, i) => {
            const amtStr = m.program.maxAmount
              ? ` | max: ${m.program.maxAmount.toLocaleString()} ${m.program.currency ?? 'EUR'}`
              : '';
            const rateStr = m.program.rateMin != null
              ? ` | rate: ${m.program.rateMin}${m.program.rateMax ? `–${m.program.rateMax}` : ''}%`
              : '';
            return `${i + 1}. ${m.program.flag} ${m.program.name} [${m.program.country}] (relevance: ${m.score}/100)\n   Why: ${m.matchReasons.join(' · ')}${amtStr}${rateStr}`;
          })
          .join('\n');
      }
    }

    const systemPrompt = buildSystemPrompt(mode, liveRates, topProgramsText, onboardingProfile);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Groq error:', err);
      return Response.json({ error: 'AI service error' }, { status: 502 });
    }

    // Forward Groq SSE stream, converting to our format
    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const json = trimmed.slice(5).trim();
              if (json === '[DONE]') {
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                continue;
              }
              try {
                const parsed = JSON.parse(json);
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`)
                  );
                }
              } catch {
                // skip malformed chunk
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
