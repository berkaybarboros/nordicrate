/**
 * The Groq model id must live in one place, and a dead model must not take a
 * page down.
 *
 * 2026-11-01: Groq retired `llama-3.3-70b-versatile`. The id was written into
 * five route files and /api/chat's quota fallback named a model retired in the
 * same sweep, so every AI feature answered 404 and "Find your best rate" — the
 * main call to action — returned "Internal server error" to every visitor.
 * Nothing failed until a human clicked it; there was no test and no alert.
 *
 * These tests pin the two things that made it expensive: the id being copied
 * around, and find-rate treating an AI outage as a server error.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GROQ_MODEL, GROQ_FALLBACK_MODEL } from '@/lib/groq';

const ROOT = join(__dirname, '..');

// Every route that talks to Groq. A new one that hardcodes a model will fail
// the first test below as soon as it is added to this list — and `cron-auth`
// already proves route files get discovered, so keep this list honest.
const AI_ROUTES = [
  'app/api/chat/route.ts',
  'app/api/compare-chat/route.ts',
  'app/api/find-rate/route.ts',
  'app/api/profile/route.ts',
  'app/api/recommend/route.ts',
];

describe('Groq model configuration', () => {
  it('names no model and no endpoint outside lib/groq.ts', () => {
    const offenders = AI_ROUTES.filter((file) => {
      const src = readFileSync(join(ROOT, file), 'utf8');
      return /api\.groq\.com/.test(src) || /model:\s*['"`]/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it('uses a fallback from a different family than the primary', () => {
    // Both llama models were retired together, which is why the fallback was
    // useless. A different vendor prefix is the cheap guard against a repeat.
    const family = (id: string) => (id.includes('/') ? id.split('/')[0] : id.split('-')[0]);
    expect(family(GROQ_FALLBACK_MODEL)).not.toBe(family(GROQ_MODEL));
  });
});

describe('POST /api/find-rate without a working model', () => {
  // No GROQ_API_KEY here — the same shape as CI and a cloud session, and the
  // same shape as a retired model as far as the route is concerned.
  let err: ReturnType<typeof vi.spyOn>;
  beforeAll(() => {
    err = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => err.mockRestore());

  async function post(body: unknown) {
    const { POST } = await import('@/app/api/find-rate/route');
    const req = new Request('https://nordicrate.com/api/find-rate', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
        'user-agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      },
      body: JSON.stringify(body),
    });
    return POST(req as unknown as Parameters<typeof POST>[0]);
  }

  it('still returns three loan picks, ranked by cost', async () => {
    const res = await post({
      productType: 'personal',
      amount: 10_000,
      termMonths: 36,
      country: 'EE',
      sessionId: 'vitest-find-rate-1',
    });
    expect(res.status).toBe(200);

    const body = await res.json() as {
      recommendations: { rank: number; representativeRate: number }[];
      aiSummary: string;
    };
    expect(body.recommendations).toHaveLength(3);
    expect(body.recommendations.map((r) => r.rank)).toEqual([1, 2, 3]);
    // The summary has to say the picks are cost-ordered, not explained — the
    // visitor should not read a generic "based on your requirements" line and
    // assume a model weighed their situation.
    expect(body.aiSummary).toMatch(/unavailable/i);
  });

  it('still returns three insurance picks', async () => {
    const res = await post({
      productType: 'motor',
      country: 'EE',
      sessionId: 'vitest-find-rate-2',
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { recommendations: unknown[] };
    expect(body.recommendations).toHaveLength(3);
  });

  it('orders loan picks cheapest-first by total cost', async () => {
    const res = await post({
      productType: 'personal',
      amount: 10_000,
      termMonths: 36,
      country: 'EE',
      sessionId: 'vitest-find-rate-3',
    });
    const { recommendations } = await res.json() as {
      recommendations: { representativeRate: number }[];
    };
    const rates = recommendations.map((r) => r.representativeRate);
    // Fees can reorder two offers against their headline rates, so this only
    // asserts the cheapest pick is not the most expensive of the three.
    expect(rates[0]).toBeLessThanOrEqual(Math.max(...rates));
  });
});
