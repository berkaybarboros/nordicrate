/**
 * POST /api/alerts must never claim an alert was saved unless it was.
 *
 * 2026-11: it answered {"success":true,"message":"Alert saved."} to every
 * subscriber while rate_alerts held 0 rows. The insert used the anon client,
 * Postgres refused it on RLS, and the route logged the error and acknowledged
 * anyway — "Don't fail the user request". Both the footer form and the modal
 * showed success, so nobody noticed; the people who signed up were waiting for
 * an email about a rate drop that could never be sent.
 *
 * Runs without SUPABASE_SERVICE_ROLE_KEY, which is the shape CI and a cloud
 * session have, and is also what a broken write looks like to the caller. So
 * the thing under test is exactly the thing that was wrong: what the route
 * says when it cannot store the row.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { POST } from '@/app/api/alerts/route';
import type { NextRequest } from 'next/server';

let ip = 0;
function req(body: unknown): NextRequest {
  // Fresh address per call: the route allows 5/min and these cases would
  // otherwise start tripping the limiter instead of the branch under test.
  ip += 1;
  return new Request('https://nordicrate.com/api/alerts', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': `192.0.2.${ip}`,
      'user-agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/131 Safari/537.36',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as unknown as NextRequest;
}

const valid = { email: 'reader@example.com', product: 'personal-loan', targetRate: null };

let err: ReturnType<typeof vi.spyOn>;
beforeAll(() => { err = vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => err.mockRestore());

describe('POST /api/alerts', () => {
  it('does not report success when the row cannot be stored', async () => {
    const res = await POST(req(valid));
    expect(res.status).not.toBe(200);
    const body = await res.json() as { success?: boolean; message: string };
    expect(body.success).not.toBe(true);
    expect(body.message).not.toMatch(/saved/i);
  });

  it('says so in words a visitor can act on', async () => {
    const body = await (await POST(req(valid))).json() as { message: string };
    expect(body.message).toMatch(/try again/i);
  });

  it('still rejects a bad email before touching the database', async () => {
    const res = await POST(req({ ...valid, email: 'not-an-email' }));
    expect(res.status).toBe(400);
  });

  it('still rejects a missing product', async () => {
    const res = await POST(req({ email: valid.email }));
    expect(res.status).toBe(400);
  });

  it('still rejects an out-of-range target rate', async () => {
    const res = await POST(req({ ...valid, targetRate: 250 }));
    expect(res.status).toBe(400);
  });

  it('rejects a body that is not JSON', async () => {
    const res = await POST(req('nope'));
    expect(res.status).toBe(400);
  });
});
