/**
 * Every /api/cron/* handler refuses a request without the right x-cron-secret.
 *
 * These endpoints publish posts, write outreach state and read lead/funnel data
 * with the service-role key. The guard is one line at the top of each handler;
 * a new route or a refactor that drops it would expose that silently. This test
 * imports every route module and calls every exported method — so a new route is
 * covered the day it is added.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { safeCompareSecret } from '@/lib/security';

const CRON_DIR = resolve(__dirname, '../app/api/cron');
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
const SECRET = 'test-cron-secret-0123456789';

type Handler = (req: Request) => Promise<Response> | Response;

const routes = readdirSync(CRON_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(resolve(CRON_DIR, d.name, 'route.ts')))
  .map((d) => d.name)
  .sort();

describe('safeCompareSecret', () => {
  it('accepts only an exact, non-empty match', () => {
    expect(safeCompareSecret(SECRET, SECRET)).toBe(true);
    expect(safeCompareSecret(`${SECRET}x`, SECRET)).toBe(false);
    expect(safeCompareSecret(SECRET.slice(0, -1) + 'X', SECRET)).toBe(false);
    expect(safeCompareSecret(null, SECRET)).toBe(false);
    expect(safeCompareSecret('', SECRET)).toBe(false);
  });

  // An unset CRON_SECRET must lock the endpoints, not open them to an empty header
  it('refuses everything when the expected secret is missing or empty', () => {
    expect(safeCompareSecret('', '')).toBe(false);
    expect(safeCompareSecret('anything', undefined)).toBe(false);
    expect(safeCompareSecret('', undefined)).toBe(false);
  });
});

describe('/api/cron/* handlers', () => {
  const previous = process.env.CRON_SECRET;
  beforeAll(() => {
    process.env.CRON_SECRET = SECRET;
  });
  afterAll(() => {
    process.env.CRON_SECRET = previous;
  });

  it('finds the cron routes', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  for (const route of routes) {
    it(`${route}: every handler returns 401 without the secret or with a wrong one`, async () => {
      const mod = (await import(resolve(CRON_DIR, route, 'route.ts'))) as Partial<Record<(typeof METHODS)[number], Handler>>;
      const handlers = METHODS.filter((m) => typeof mod[m] === 'function');
      expect(handlers.length).toBeGreaterThan(0);

      for (const method of handlers) {
        const url = `http://localhost/api/cron/${route}`;
        const init = (headers: Record<string, string>): RequestInit =>
          method === 'GET' || method === 'DELETE'
            ? { method, headers }
            : { method, headers: { 'content-type': 'application/json', ...headers }, body: '{}' };

        const none = await mod[method]!(new Request(url, init({})));
        expect(none.status, `${method} /api/cron/${route} without secret`).toBe(401);

        const wrong = await mod[method]!(new Request(url, init({ 'x-cron-secret': 'wrong' })));
        expect(wrong.status, `${method} /api/cron/${route} with wrong secret`).toBe(401);
      }
    });
  }
});
