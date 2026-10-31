/**
 * POST /api/demand — what it accepts, and what it refuses to store.
 *
 * This endpoint exists because the survey widget we shipped in September has
 * collected one row in six weeks, while the same period saw 493 sessions and
 * 741 product views. The whole point is that a row is written without the
 * visitor typing anything, so the validation matters: a signal nobody filled in
 * is only worth having if it is accurate.
 *
 * Runs without SUPABASE_SERVICE_ROLE_KEY, which is how CI and a cloud session
 * run — the handler answers 200 and logs that the row was dropped, so these
 * tests check the request contract, not the insert.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { POST } from '@/app/api/demand/route';
import type { NextRequest } from 'next/server';

function req(body: unknown, ip = '203.0.113.1'): NextRequest {
  return new Request('https://nordicrate.com/api/demand', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
      'user-agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/131 Safari/537.36',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as unknown as NextRequest;
}

const valid = { page: '/loans/personal', productType: 'personal', resultCount: 0 };

let warn: ReturnType<typeof vi.spyOn>;
beforeAll(() => {
  // The handler logs "service role missing" on every call here; that is the
  // expected path without secrets and should not clutter the test output.
  warn = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => warn.mockRestore());

describe('POST /api/demand', () => {
  it('accepts a signal with nothing the visitor had to type', async () => {
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
  });

  it('refuses a body with no page', async () => {
    const res = await POST(req({ productType: 'personal', resultCount: 0 }));
    expect(res.status).toBe(400);
  });

  it('refuses a page that is not a path', async () => {
    // Guards against a caller sending a full URL or something worse.
    const res = await POST(req({ ...valid, page: 'https://evil.example/x' }));
    expect(res.status).toBe(400);
  });

  it('refuses a signal with no result count', async () => {
    // Without it we cannot tell "we had nothing" from "we had plenty".
    const res = await POST(req({ page: valid.page, productType: valid.productType }));
    expect(res.status).toBe(400);
  });

  it('refuses a body that is not JSON', async () => {
    const res = await POST(req('not json at all'));
    expect(res.status).toBe(400);
  });

  it('answers 200 to an obvious bot without storing anything', async () => {
    const botReq = new Request('https://nordicrate.com/api/demand', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.9',
        'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      },
      body: JSON.stringify(valid),
    }) as unknown as NextRequest;
    expect((await POST(botReq)).status).toBe(200);
  });

  it('rate limits a single address', async () => {
    // One visitor nudging a slider should not be able to write hundreds of rows.
    const ip = '203.0.113.50';
    const codes: number[] = [];
    for (let i = 0; i < 14; i++) codes.push((await POST(req(valid, ip))).status);
    expect(codes).toContain(429);
  });
});
