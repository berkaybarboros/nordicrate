/**
 * The data-layer rules that reporting and application forms depend on.
 * Each test corresponds to a bug that reached production once.
 */

import { describe, it, expect } from 'vitest';
import { fetchAllRows } from '../lib/supabase-paginate';
import { collectMissing, buildBoilerplate } from '../lib/company-profile';

describe('fetchAllRows', () => {
  // PostgREST caps a response at 1000 rows and .limit(5000) does not raise it.
  // /admin counted 1000 of 1495 events and founder-facts reported "4 sessions in
  // 60 days" from 3966 rows.
  const page = (from: number, to: number, total: number) => ({
    data: Array.from({ length: Math.max(0, Math.min(to, total - 1) - from + 1) }, (_, i) => ({ id: from + i })),
    error: null,
  });

  it('keeps paging past the 1000-row cap', async () => {
    const { data, error } = await fetchAllRows<{ id: number }>((from, to) =>
      Promise.resolve(page(from, to, 2500)),
    );
    expect(error).toBeNull();
    expect(data).toHaveLength(2500);
    expect(data[0].id).toBe(0);
    expect(data[2499].id).toBe(2499);
  });

  it('stops on a short page instead of looping forever', async () => {
    let calls = 0;
    const { data } = await fetchAllRows<{ id: number }>((from, to) => {
      calls++;
      return Promise.resolve(page(from, to, 10));
    });
    expect(data).toHaveLength(10);
    expect(calls).toBe(1);
  });

  it('returns what it read plus the error, so a partial read is visible', async () => {
    let calls = 0;
    const { data, error } = await fetchAllRows<{ id: number }>((from, to) => {
      calls++;
      if (calls === 2) return Promise.resolve({ data: null, error: { message: 'boom' } });
      return Promise.resolve(page(from, to, 5000));
    });
    expect(error).toBe('boom');
    expect(data).toHaveLength(1000);
  });
});

describe('company profile boilerplate', () => {
  const profile = {
    trading_name: 'NordicRate',
    legal_name: 'MISSING — sole proprietorship registered name (TR)',
    phone: 'MISSING',
    founder_name: 'Berkay Barboros',
    target_raise_eur: 200000,
  };

  it('lists the fields an application form would have to invent', () => {
    expect(collectMissing(profile).sort()).toEqual(['legal_name', 'phone']);
  });

  it('uses the live figures it is given', () => {
    const b = buildBoilerplate(profile, {
      catalogue: { countries: 8, institutions: 58, products: 110, liveRateFeeds: 31, liveRateOffersShown: 36 },
      traction60d: { sessions: 186, sessionsReachedOffers: 23, sessionsClickedToBank: 14, clickThroughOfOffersPct: 60.9 },
      leadsTotal: 3,
      company: { revenueEur: 0 },
    });
    expect(b.traction).toContain('186 sessions');
    expect(b.traction).toContain('31 live bank feeds');
    expect(b.traction).toContain('60.9%');
  });

  // A form filled with a confident-sounding number nobody can source is the
  // failure mode this endpoint exists to prevent.
  it('says the figures are unavailable rather than inventing them', () => {
    const b = buildBoilerplate(profile, {});
    expect(b.traction).toContain('unavailable');
    expect(b.traction).not.toMatch(/\d+ sessions/);
  });
});
