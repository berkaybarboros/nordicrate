/**
 * The bank-page parsers, pinned to the mistakes they already made once.
 *
 * Every case here is a real page shape copied from the site it came from, not an
 * invented example: a wrong rate on a comparison site is worse than a missing one,
 * so these tests exist to keep specific wrong readings from coming back.
 */

import { describe, it, expect } from 'vitest';
// The scraper's pure parsing core: plain JS, no Playwright, so it imports here.
import { extractSeListRates, extractIsFixedRates } from '../deploy/scraper/parsers.mjs';

interface RateResult {
  min: number;
  snippet: string;
}

/** Fails the test with a clear message instead of a null-deref further down. */
function parsed(value: RateResult | null): RateResult {
  expect(value, 'parser returned null').not.toBeNull();
  return value as RateResult;
}

describe('Swedish mortgage pages', () => {
  // Swedbank prints both columns on one row: snittränta (what customers got in the
  // past) then listränta (the advertised price). Reading the first percentage gave
  // 2.70% instead of 3.62% — a rate the bank does not advertise.
  const swedbank = [
    'Snittränta bolån – våra genomsnittliga bolåneräntor',
    'Aktuella bolåneräntor',
    'Bindningstid\tSnittränta (augusti 2026)\tListränta (ändrad 18 september 2026)',
    '3 månader\t2,70 %\t3,89 %',
    '1 år\t2,92 %\t3,62 %',
    '2 år\t3,16 %\t3,89 %',
    '10 år\t3,82 %\t4,39 %',
    'Banklån*\t3,61 %',
  ].join('\n');

  it('takes the advertised list rate, never the average', () => {
    const r = parsed(extractSeListRates(swedbank));
    expect(r.min).toBe(3.62);
    expect(r.snippet).toContain('3m 3.89%');
    expect(r.snippet).not.toContain('2.7');
  });

  // Länsförsäkringar puts the two tables one after the other and adds a change
  // column (+0,25 %) next to the rate; the change must not be read as a rate.
  const lansforsakringar = [
    'Snitträntor - våra genomsnittliga bolåneräntor förra månaden',
    'Bindningstid',
    'Genomsnittlig ränta augusti 2026',
    '3 mån\t2,70 %',
    '1 år\t2,93 %',
    'Listräntor - våra aktuella bolåneräntor just nu',
    'Bindningstid\tRänta\tÄndring\tDatum',
    '3 månader\t3,94 %\t-0,05 %\t2026-06-15',
    '1 år\t3,74 %\t+0,15 %\t2026-09-18',
    '2 år\t3,99 %\t+0,30 %\t2026-09-18',
  ].join('\n');

  it('reads the list table that follows a heading, skipping the average table', () => {
    const r = parsed(extractSeListRates(lansforsakringar));
    expect(r.min).toBe(3.74);
    expect(r.snippet).toContain('12m 3.74%');
    expect(r.snippet).not.toContain('2.7');
  });

  it('returns null rather than guessing when no list table is present', () => {
    const averageOnly = [
      'Snittränta bolån',
      'Bindningstid\tGenomsnittlig ränta',
      '3 mån\t2,70 %',
      '1 år\t2,92 %',
      '2 år\t3,16 %',
    ].join('\n');
    expect(extractSeListRates(averageOnly)).toBeNull();
  });

  it('needs more than a single row to accept a table', () => {
    expect(extractSeListRates('Listränta\nBindningstid\tListränta\n3 mån\t3,15 %')).toBeNull();
  });
});

describe('Icelandic rate tables (PDF text)', () => {
  // Iceland sells two different mortgages: indexed (verðtryggð, ~4-5% plus CPI) and
  // non-indexed (~8-9%). Quoting one as the other is the same class of error as
  // printing an Estonian rate on a Latvian product.
  const landsbankinn = [
    '1. Housing mortgages',
    '   Non-indexed',
    '   Fixed rate14,15                          1-year      3-year      5-year',
    '       Loan to value up to 55%               9,20%       8,75%       8,35%',
    '       Loan to value up to 90%               9,90%       9,45%       9,05%',
    '   Loans granted before 23.10.2025',
    '      Loan to value up to 70%. New loans not available            9,50%',
    '   Indexed',
    '       Loan to value up to 55%               4,55%       4,45%       4,35%',
  ].join('\n');

  const config = {
    sectionStart: /1\.\s*Housing mortgages/i,
    sectionEnd: /Loans granted before|\n\s*Indexed mortgage/i,
    rowLabel: /Loan to value up to 55%/i,
    note: 'non-indexed fixed, LTV<=55%',
  };

  it('reads the non-indexed row and ignores the indexed table below it', () => {
    const r = parsed(extractIsFixedRates(landsbankinn, config));
    expect(r.min).toBe(8.35);
    expect(r.snippet).toContain('non-indexed');
    expect(r.snippet).not.toContain('4.35');
  });

  it('stops at the legacy block so withdrawn products are never quoted', () => {
    const r = parsed(extractIsFixedRates(landsbankinn, config));
    expect(r.snippet).not.toContain('9.5%');
  });

  it('returns null when the section heading is missing', () => {
    expect(extractIsFixedRates('Some other document', config)).toBeNull();
  });
});
