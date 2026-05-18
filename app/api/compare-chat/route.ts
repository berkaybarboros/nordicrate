/**
 * POST /api/compare-chat
 * Karşılaştırma sayfası için bağlamsal AI sohbet.
 * Kullanıcının seçtiği ürünleri system prompt'a inject eder,
 * kişiye özel sorulara Groq SSE stream ile cevap verir.
 *
 * Body: { messages: ChatMessage[], compareItems: CompareItem[], userCtx?: string }
 */

import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CompareMetric {
  label: string;
  value: string | number;
}

interface CompareItem {
  id: string;
  name: string;
  logo: string;
  type: 'loan' | 'insurance' | 'deposit';
  metrics: CompareMetric[];
  rawRate?: number;
  rawMonthly?: number;
  rawTotal?: number;
  rawPremium?: number;
  rawInterest?: number;
  applyUrl: string;
}

function buildCompareSystemPrompt(items: CompareItem[], userCtx?: string): string {
  const type = items[0]?.type ?? 'loan';
  const productLines = items.map((item, i) => {
    const metricsText = item.metrics
      .map(m => `${m.label}: ${m.value}`)
      .join(', ');
    return `#${i + 1} ${item.logo} ${item.name} — ${metricsText}`;
  }).join('\n');

  const typeContext = type === 'loan'
    ? 'personal/mortgage/car loans from Nordic and Baltic banks'
    : type === 'insurance'
    ? 'insurance products (motor, casco, home, health)'
    : 'savings deposits and term accounts';

  return `You are a concise, expert financial advisor for NordicRate — a comparison platform for ${typeContext} across Nordic and Baltic countries.

The user is currently comparing these ${items.length} products side-by-side:
${productLines}

Your role:
- Answer questions specifically about THESE products only
- Make concrete recommendations — don't hedge excessively
- Use numbers from the product data above when relevant
- If asked which is better, give a direct opinion based on the data
- Keep answers under 150 words unless a detailed breakdown is explicitly requested
- For loans: consider total cost, monthly burden, processing speed
- For insurance: consider premium-to-excess ratio, features, claims reputation
- For deposits: consider effective yield, lock-in period, early withdrawal terms
${userCtx ? `\nUser context: ${userCtx}` : ''}

Respond in the same language the user writes in (English by default).
Never mention that you are an AI or have limitations.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      messages: ChatMessage[];
      compareItems: CompareItem[];
      userCtx?: string;
    };

    const { messages, compareItems, userCtx } = body;

    if (!messages?.length || !compareItems?.length) {
      return Response.json({ error: 'messages and compareItems required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'AI not configured' }, { status: 503 });
    }

    const systemPrompt = buildCompareSystemPrompt(compareItems, userCtx);

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.5,
        max_tokens: 400,
        stream: true,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('[compare-chat] Groq error:', err);
      return Response.json({ error: 'AI unavailable' }, { status: 502 });
    }

    // Pass Groq SSE stream directly to client
    return new Response(groqRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (err) {
    console.error('[compare-chat]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
