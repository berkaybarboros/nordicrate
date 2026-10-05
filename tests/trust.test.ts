/**
 * Site-wide honesty rules outside insurance (see tests/insurance-data.test.ts).
 * Each case was shown to users once: "updated just now" on rates that were never
 * fetched, and ranking claims ("Market-leading rates", "Latvia's leading…") with
 * no source behind them.
 */

import { describe, it, expect } from 'vitest';
import { PRODUCTS } from '../lib/data';
import { personalLoans, mortgageLoans, carLoans } from '../data/loans';
import { FALLBACK_RATES, describeEuribor, formatPeriod } from '../lib/rates';

const RANKING_CLAIM =
  /\b(largest|biggest|leader|leading|best|cheapest|most|competitive|great value|#1|number one)\b/i;

describe('loan catalogue', () => {
  it('has no ranking or value claims in features', () => {
    const offenders = [
      ...PRODUCTS.map((p) => ({ id: p.id, features: p.features })),
      ...[...personalLoans, ...mortgageLoans, ...carLoans].map((l) => ({ id: l.id, features: l.features })),
    ].flatMap(({ id, features }) => features.filter((f) => RANKING_CLAIM.test(f)).map((f) => `${id}: ${f}`));
    expect(offenders).toEqual([]);
  });
});

describe('reference rates', () => {
  // fetchedAt used to be new Date() even here, so every badge said "updated just now".
  it('never claims a fetch time for the static fallback', () => {
    expect(FALLBACK_RATES.fetchedAt).toBeNull();
    const all = [...Object.values(FALLBACK_RATES.euribor), ...Object.values(FALLBACK_RATES.centralBankRates)];
    expect(all.every((r) => r.source === 'fallback' && Boolean(r.period))).toBe(true);
  });

  it('labels fallback EURIBOR as static, with its period', () => {
    const { text, live } = describeEuribor(FALLBACK_RATES);
    expect(live).toBe(false);
    expect(text).toContain('static');
    expect(text).toContain(formatPeriod(FALLBACK_RATES.euribor.euribor3m.period));
  });

  it('labels live EURIBOR with its observation period, not a clock time', () => {
    const live = {
      euribor: {
        ...FALLBACK_RATES.euribor,
        euribor3m: { label: 'EURIBOR 3M', rate: 2.034, period: '2026-09', source: 'live' as const },
      },
    };
    expect(describeEuribor(live)).toEqual({ text: 'EURIBOR 3M 2.03% · Sep 2026 · ECB', live: true });
  });

  it('formats monthly and daily periods', () => {
    expect(formatPeriod('2026-09')).toBe('Sep 2026');
    expect(formatPeriod('2025-12-18')).toBe('18 Dec 2025');
    expect(formatPeriod(undefined)).toBe('');
  });
});
