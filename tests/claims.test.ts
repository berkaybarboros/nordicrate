/**
 * Keeps deploy/scraper/claims-to-verify.json in step with the catalogue.
 * The server-side source audit reads that file (it cannot import TypeScript), so a
 * claim added to lib/data.ts or data/loans.ts without regenerating it would never be
 * checked. Regenerate with: UPDATE_CLAIMS=1 npm test
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { collectClaims } from '../lib/claims';
import { evidenceSnippets, EVIDENCE_TERMS } from '../deploy/scraper/parsers.mjs';

const FILE = resolve(__dirname, '../deploy/scraper/claims-to-verify.json');

describe('claims-to-verify.json', () => {
  const claims = collectClaims();

  it('matches the catalogue (run UPDATE_CLAIMS=1 npm test after changing product data)', () => {
    const json = JSON.stringify(claims, null, 2) + '\n';
    if (process.env.UPDATE_CLAIMS === '1') writeFileSync(FILE, json);
    expect(readFileSync(FILE, 'utf8')).toBe(json);
  });

  it('gives every claim a unique id and a source to check', () => {
    expect(new Set(claims.map((c) => c.id)).size).toBe(claims.length);
    const sourceless = claims.filter((c) => !c.sourceUrl).map((c) => c.id);
    expect(sourceless).toEqual([]);
  });

  it('classifies speed and fee wording', () => {
    const texts = (kind: string) => claims.filter((c) => c.kind === kind && c.field === 'feature').map((c) => c.text);
    expect(texts('speed')).toContain('Instant decision');
    expect(texts('fee')).toContain('No fees');
  });
});

// Mechanics only (synthetic text): the real-page parser cases live in
// tests/scraper-parsers.test.ts. A snippet is evidence for a human to read.

describe('evidenceSnippets', () => {
  it('returns the sentence around a local-language term, without overlapping windows', () => {
    const page = `${'x '.repeat(200)}Laenuotsuse saad kohe pärast taotluse esitamist. Lepingutasu 1% laenusummast, min 30 €. ${'y '.repeat(200)}`;
    const speed = evidenceSnippets(page, EVIDENCE_TERMS.speed);
    expect(speed.some((s) => s.includes('saad kohe'))).toBe(true);
    const fee = evidenceSnippets(page, EVIDENCE_TERMS.fee);
    expect(fee.some((s) => s.includes('Lepingutasu 1%'))).toBe(true);
    // "otsus" and "kohe" sit in one window — reported once, not twice
    expect(speed.length).toBe(1);
  });

  it('returns nothing when the page never mentions the topic', () => {
    expect(evidenceSnippets('Contact us · Careers · Cookies', EVIDENCE_TERMS.fee)).toEqual([]);
  });
});
