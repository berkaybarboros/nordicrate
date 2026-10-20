/**
 * Insurance catalogue honesty rules. Premiums are examples, so the data must not
 * claim more than it knows — each rule here was broken in data/insurance.ts once.
 */

import { describe, it, expect } from 'vitest';
import { INSURANCE_BY_TYPE, listedInsurers, lowestExamplePremium, UNPRICED_INSURERS, unpricedInsurersFor } from '../data/insurance';
import { isAllowedApplyUrl } from '../lib/affiliate';
import { personalLoans, mortgageLoans, carLoans } from '../data/loans';

const allOffers = Object.values(INSURANCE_BY_TYPE).flat();

describe('insurance catalogue', () => {
  // "Largest insurer in Estonia", "Most affordable in Baltic", "Best price on single
  // trips" — ranking claims with no source behind them (unfair commercial practice
  // risk, the same reason the Best Rate badges were removed).
  it('has no ranking or value claims in features', () => {
    const claim = /\b(largest|biggest|leader|leading|best|cheapest|most|affordable|competitive|great value|#1|number one)\b/i;
    const offenders = allOffers.flatMap((o) =>
      o.features.filter((f) => claim.test(f)).map((f) => `${o.id}: ${f}`),
    );
    expect(offenders).toEqual([]);
  });

  // One insurer had two ids (lhv / lhv-insurance), which broke companyId filtering
  // and affiliate matching.
  it('maps every companyId to one insurer name', () => {
    const names = new Map<string, Set<string>>();
    for (const o of allOffers) {
      names.set(o.companyId, (names.get(o.companyId) ?? new Set()).add(o.companyName));
    }
    const conflicts = [...names].filter(([, n]) => n.size > 1).map(([id, n]) => `${id}: ${[...n].join(' / ')}`);
    expect(conflicts).toEqual([]);
  });

  // Swedbank Life used the bank's id "swedbank", so /go treated an insurance click as
  // a bank click. Insurers are separate legal entities and need their own id.
  it('never reuses a bank id for an insurer', () => {
    const bankIds = new Set([...personalLoans, ...mortgageLoans, ...carLoans].map((l) => l.bankId));
    const clashes = [...new Set(allOffers.map((o) => o.companyId))].filter((id) => bankIds.has(id));
    expect(clashes).toEqual([]);
  });

  it('marks a premium verified only together with its source', () => {
    const half = allOffers.filter((o) => Boolean(o.verifiedAt) !== Boolean(o.sourceUrl)).map((o) => o.id);
    expect(half).toEqual([]);
  });

  it('derives hub figures from the catalogue', () => {
    expect(lowestExamplePremium('casco')).toBe(Math.min(...INSURANCE_BY_TYPE.casco.map((o) => o.representativePremium)));
    const ids = listedInsurers().map((i) => i.companyId);
    expect(new Set(ids).size).toBe(ids.length);
    // An insurer is listed under a type only if it really has an offer there.
    for (const ins of listedInsurers()) {
      for (const t of ins.types) {
        expect(INSURANCE_BY_TYPE[t].some((o) => o.companyId === ins.companyId)).toBe(true);
      }
    }
  });
});

// Balcia and PZU are licensed in Estonia but we have no example premium for them (2026-10-20).
// They are listed apart from priced offers; a made-up premium is the failure this prevents.
describe('insurers listed without price data', () => {
  it('never appear among priced offers, so they cannot be ranked or priced', () => {
    const priced = new Set(allOffers.map((o) => o.companyId));
    expect(UNPRICED_INSURERS.filter((i) => priced.has(i.companyId)).map((i) => i.companyId)).toEqual([]);
    expect(listedInsurers().some((i) => UNPRICED_INSURERS.some((u) => u.companyId === i.companyId))).toBe(false);
  });

  it('name a cover type only with a source from the insurer', () => {
    for (const ins of UNPRICED_INSURERS) {
      expect(ins.types.length, ins.companyId).toBeGreaterThan(0);
      expect(ins.sources.length, ins.companyId).toBeGreaterThan(0);
      const site = new URL(ins.websiteUrl).hostname.replace(/^www\./, '');
      for (const src of ins.sources) expect(new URL(src).hostname.replace(/^www\./, '')).toBe(site);
    }
  });

  it('can be reached through /go', () => {
    for (const ins of UNPRICED_INSURERS) expect(isAllowedApplyUrl(ins.websiteUrl), ins.companyId).toBe(true);
  });

  it('are filtered by type', () => {
    expect(unpricedInsurersFor('casco').map((i) => i.companyId).sort()).toEqual(['balcia', 'pzu']);
    expect(unpricedInsurersFor('life')).toEqual([]);
  });
});
