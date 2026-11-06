/**
 * Internal links must point at the canonical path, not the filtered query URL.
 *
 * 2026-11 SEO audit: it reported that category and country filtering used
 * query strings instead of hierarchical paths and recommended building route
 * rewrites. The rewrites were already built — /loans/car, /loans/latvia and
 * the other six country pages exist, are in the sitemap and carry their own
 * canonical. What was actually wrong is narrower and was not in the report:
 * the site linked to `/loans?country=LV` and `/loans?type=auto` from the
 * footer, the home page, the country cards and the country landing page
 * itself, and `?country=LV` canonicalises to `/loans`. So every internal link
 * pushed authority to the generic list instead of the page built to rank for
 * that country.
 *
 * This pins the links, not the routes: a new `?country=`/`?type=` href in a
 * component is the regression to catch.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COUNTRY_LANDINGS, COUNTRY_SLUG_BY_CODE } from '@/lib/country-content';

const ROOT = join(__dirname, '..');

// Files that link into the catalogue. Reading a fixed list keeps the test fast
// and the failure readable; a new nav surface should be added here.
const LINKING_FILES = [
  'app/page.tsx',
  'app/loans/[country]/page.tsx',
  'components/Footer.tsx',
  'components/Header.tsx',
  'components/CountryCard.tsx',
  'components/home/LocalizedHome.tsx',
];

describe('catalogue links', () => {
  it('never links to a filtered query URL that has a real path', () => {
    const offenders: string[] = [];
    for (const file of LINKING_FILES) {
      const src = readFileSync(join(ROOT, file), 'utf8');
      src.split('\n').forEach((line, i) => {
        // Only hrefs: a `searchParams.get('country')` read is how the page
        // still honours a link someone else published, and must keep working.
        if (/href=[^\n]*\/loans\?(country|type)=/.test(line)) {
          offenders.push(`${file}:${i + 1}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it('has a landing page slug for every country code it links', () => {
    // The footer and the home page index the slug map by code, so a country
    // added to one without the other would produce `/loans/undefined`.
    for (const landing of COUNTRY_LANDINGS) {
      expect(COUNTRY_SLUG_BY_CODE[landing.code]).toBe(landing.slug);
    }
    expect(Object.values(COUNTRY_SLUG_BY_CODE).every(Boolean)).toBe(true);
    expect(COUNTRY_LANDINGS).toHaveLength(8);
  });
});
