/**
 * lib/loan-cost — kartın gösterdiği aylık ödeme, ücret ve APR.
 * Pinned against the banks' own published examples (source audit 2026-10-08), and
 * against the two bugs it replaced: the card ignored `feePercent` (so "2% + €3.99/mo"
 * read as "No setup fee") and called calculateAPR with fee and term swapped.
 */

import { describe, it, expect } from 'vitest';
import { describeFee, loanCost, upfrontFee } from '@/lib/loan-cost';
import { personalLoans, mortgageLoans, carLoans } from '@/data/loans';

describe('loanCost — banks\' own sample terms', () => {
  // lhv.ee/en/consumer-loan: €2,400, 13.9% fixed on balance, contract fee 2% (min €29.90),
  // service fee €3.99/mo → monthly €64.02, annual rate of charge 19.67%
  it('reproduces LHV\'s consumer-loan example', () => {
    const c = loanCost({ representativeRate: 13.9, fee: 29.9, feePercent: 2, monthlyFee: 3.99 }, 2400, 54);
    expect(c.monthly).toBeCloseTo(64.02, 2);
    expect(c.upfront).toBe(48);
    expect(c.apr).toBeGreaterThan(19.5);
    expect(c.apr).toBeLessThan(19.9);
  });

  // cooppank.ee small loan: €2,250, 36 months, 17.9%, agreement fee €45, €1.50/mo → €82.73
  it('reproduces Coop Pank\'s small-loan example', () => {
    const c = loanCost({ representativeRate: 17.9, fee: 35, feePercent: 2, monthlyFee: 1.5 }, 2250, 36);
    expect(c.monthly).toBeCloseTo(82.73, 2);
    expect(c.upfront).toBe(45);
  });
});

describe('fees', () => {
  it('applies the minimum when the percentage is smaller', () => {
    expect(upfrontFee({ fee: 29.9, feePercent: 2 }, 500)).toBe(29.9);
    expect(upfrontFee({ fee: 29.9, feePercent: 2 }, 5000)).toBe(100);
  });

  it('never calls an unverified fee "None"', () => {
    expect(describeFee({ fee: null, feePercent: 0 })).toBeNull();
    expect(upfrontFee({ fee: null, feePercent: 0 }, 5000)).toBeNull();
  });

  it('describes percentage, minimum and monthly fee together', () => {
    expect(describeFee({ fee: 29.9, feePercent: 2, monthlyFee: 3.99 })).toBe('2% (min €29.90) + €3.99/mo');
    expect(describeFee({ fee: 0, feePercent: 0 })).toBe('None');
  });

  it('raises APR above the nominal rate when there are fees, and not otherwise', () => {
    expect(loanCost({ representativeRate: 9, fee: 0, feePercent: 0 }, 10000, 60).apr).toBeCloseTo(9.38, 1);
    const withFees = loanCost({ representativeRate: 9, fee: 50, feePercent: 2, monthlyFee: 3.9 }, 10000, 60);
    expect(withFees.apr).toBeGreaterThan(10.5);
    expect(withFees.total).toBeGreaterThan(loanCost({ representativeRate: 9, fee: 0, feePercent: 0 }, 10000, 60).total);
  });

  it('handles a zero rate', () => {
    const c = loanCost({ representativeRate: 0, fee: 0, feePercent: 0 }, 1200, 12);
    expect(c.monthly).toBe(100);
    expect(c.apr).toBeCloseTo(0, 1);
  });
});

describe('catalogue after the 2026-10-08 audit', () => {
  const all = [...personalLoans, ...mortgageLoans, ...carLoans];
  const byId = (id: string) => all.find((l) => l.id === id)!;

  // Each of these said "No one-time fee"; the bank's page lists a contract fee
  it.each(['lhv-personal', 'inbank-personal', 'inbank-car', 'coop-personal'])('%s carries its contract fee', (id) => {
    expect(byId(id).feePercent).toBeGreaterThan(0);
    expect(byId(id).monthlyFee).toBeGreaterThan(0);
  });

  it.each(['bigbank-car', 'ferratum-personal'])('%s no longer claims a zero fee', (id) => {
    expect(byId(id).fee).toBeNull();
  });

  it('lists Inbank\'s unsecured home small loan as personal, without another product\'s live rate', () => {
    expect(mortgageLoans.some((l) => l.applyUrl.includes('small-home-loan'))).toBe(false);
    const l = byId('inbank-home-small-loan');
    expect(l.type).toBe('personal');
    expect(l.liveRateType).toBeNull();
  });

  it('has no "No setup fee" feature on an offer that charges one', () => {
    for (const l of all) {
      if (l.fee !== 0 || l.feePercent > 0 || l.monthlyFee) {
        expect(l.features.join(' ').toLowerCase(), l.id).not.toMatch(/no (setup|one-time) fee|no fees/);
      }
    }
  });
});
