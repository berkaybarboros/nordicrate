import { buildSystemPrompt, type AssistantMode } from '@/lib/ai-context';
import type { LiveRatesData } from '@/lib/types';
import { matchPrograms, type CorporateProfile } from '@/lib/corporate-profile';

export const runtime = 'nodejs';
export const maxDuration = 30;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function fetchLiveRates(): Promise<LiveRatesData | undefined> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';
    const res = await fetch(`${base}/api/rates`, { next: { revalidate: 3600 } });
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      mode = 'personal',
      corporateProfile,
    }: { messages: ChatMessage[]; mode: AssistantMode; corporateProfile?: CorporateProfile } = await req.json();

    if (!messages || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
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

    const systemPrompt = buildSystemPrompt(mode, liveRates, topProgramsText);

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
