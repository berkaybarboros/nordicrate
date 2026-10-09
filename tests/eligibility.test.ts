/**
 * calculateEligibility() — the "Estimated eligibility" users see in onboarding and in
 * the AI assistant. It is a rough signal, never a credit decision, so the rule that
 * matters most is: no score without the numbers behind it.
 */

import { describe, it, expect } from 'vitest';
import { calculateEligibility } from '@/lib/profile';
import { INSTITUTIONS } from '@/lib/data';

const base = { loanType: 'personal' as const, loanAmount: 10_000, loanTermMonths: 60 };

describe('calculateEligibility', () => {
  it('returns insufficient_data with nothing to go on', () => {
    expect(calculateEligibility({}).score).toBe('insufficient_data');
  });

  // Onboarding makes income optional; a user who skipped it was shown "Good".
  it('does not score without income, even when the amount is known', () => {
    const r = calculateEligibility(base);
    expect(r.score).toBe('insufficient_data');
    expect(r.dti).toBeUndefined();
  });

  it('does not score without an amount, even when income is known', () => {
    expect(calculateEligibility({ loanType: 'personal', monthlyIncome: 3000 }).score).toBe('insufficient_data');
  });

  it('scores from DTI once income and amount are both known', () => {
    const r = calculateEligibility({ ...base, monthlyIncome: 4000 });
    expect(r.dti).toBeTypeOf('number');
    expect(['excellent', 'good', 'fair', 'poor']).toContain(r.score);
  });

  it('gets worse, never better, as existing debt grows', () => {
    const order = ['excellent', 'good', 'fair', 'poor'];
    const at = (debt: number) => calculateEligibility({ ...base, monthlyIncome: 3000, existingMonthlyDebt: debt });
    const scores = [0, 500, 900, 1500].map((d) => order.indexOf(at(d).score));
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
    expect(at(1500).dti!).toBeGreaterThan(at(0).dti!);
  });

  it('caps the suggested max loan at the 35% DTI ceiling', () => {
    const income = 3000;
    const r = calculateEligibility({ ...base, monthlyIncome: income });
    const rate = r.matchedProducts[0]?.rateMin ?? 8;
    const i = rate / 100 / 12;
    const n = 60;
    const payment = (r.maxLoanDTI! * i * (1 + i) ** n) / ((1 + i) ** n - 1);
    expect(payment).toBeLessThanOrEqual(income * 0.35 + 1);
    expect(payment).toBeGreaterThan(income * 0.35 - 1);
  });

  it('marks unemployed as poor even without income figures', () => {
    expect(calculateEligibility({ ...base, employmentType: 'unemployed' }).score).toBe('poor');
  });

  it('never rates self-employed as excellent', () => {
    const r = calculateEligibility({ ...base, monthlyIncome: 20_000, employmentType: 'self_employed' });
    expect(r.score).not.toBe('excellent');
  });

  it('respects country, collateral and non-resident filters', () => {
    const r = calculateEligibility({ ...base, monthlyIncome: 3000, country: 'EE', hasCollateral: false, isResident: false });
    expect(r.matchedProducts.length).toBeGreaterThan(0);
    for (const p of r.matchedProducts) {
      const inst = INSTITUTIONS.find((x) => x.id === p.institutionId);
      expect(inst?.country).toBe('EE');
      expect(p.collateralRequired).toBe(false);
      expect(inst?.isEResidentFriendly || inst?.isDigitalFriendly).toBe(true);
    }
  });

  it('returns at most three matches, cheapest first', () => {
    const r = calculateEligibility({ ...base, monthlyIncome: 3000 });
    expect(r.matchedProducts.length).toBeLessThanOrEqual(3);
    const rates = r.matchedProducts.map((p) => p.rateMin);
    expect(rates).toEqual([...rates].sort((a, b) => a - b));
  });
});
