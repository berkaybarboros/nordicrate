/**
 * The bank-page parsers, pinned to the mistakes they already made once.
 *
 * Every case here is a real page shape copied from the site it came from, not an
 * invented example: a wrong rate on a comparison site is worse than a missing one,
 * so these tests exist to keep specific wrong readings from coming back.
 */

import { describe, it, expect } from 'vitest';
// The scraper's pure parsing core: plain JS, no Playwright, so it imports here.
import {
  extractSeListRates,
  extractIsFixedRates,
  extract,
  RATE_PATTERNS,
  APRC_PATTERNS,
} from '../deploy/scraper/parsers.mjs';

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

// ─── Failure evidence and register crawl (no SSH: this is all we see) ─────────

import {
  candidateProductLinks,
  failureSnippet,
  findPdfLink,
  pdfLinks,
  pickRegisterCategories,
  registerCandidateLinks,
  registerEntities,
  REGISTER_CATEGORIES,
} from '../deploy/scraper/parsers.mjs';

describe('failureSnippet', () => {
  it('keeps the rate sentences, not the cookie banner that opens the page', () => {
    const page = `Kasutame küpsiseid. ${'Nõustu kõigiga. '.repeat(30)} Kodulaen Intress alates 1,9% + 6 kuu Euribor. Lepingutasu 0,5%.`;
    const s = failureSnippet(page);
    expect(s.startsWith('[parse failed]')).toBe(true);
    expect(s).toContain('1,9%');
    expect(s.length).toBeLessThanOrEqual(1500);
  });

  it('falls back to the page start when nothing rate-like is there', () => {
    expect(failureSnippet('Access denied')).toBe('[parse failed] Access denied');
  });
});

describe('findPdfLink', () => {
  const page = 'https://www.landsbankinn.is/en/interest-rates-and-fees';
  const file = /\/vaxtaakvordun-[0-9]{6}-enska\.pdf$/i;

  it('resolves a relative href against the page', () => {
    expect(findPdfLink('<a href="/vextir/vaxtaakvordun-260901-enska.pdf">EN</a>', page, file)).toBe(
      'https://www.landsbankinn.is/vextir/vaxtaakvordun-260901-enska.pdf',
    );
  });

  it('finds a link escaped inside embedded JSON', () => {
    const html = '{"file":{"url":"https:\\/\\/cdn.landsbankinn.is\\/media\\/vaxtaakvordun-261001-enska.pdf"}}';
    expect(findPdfLink(html, page, file)).toBe('https://cdn.landsbankinn.is/media/vaxtaakvordun-261001-enska.pdf');
  });

  it('ignores other PDFs and reports what it saw', () => {
    const html = '<a href="/gjaldskra.pdf">fees</a><a href="/vaxtaakvordun-260901-islenska.pdf">IS</a>';
    expect(findPdfLink(html, page, file)).toBeNull();
    expect(pdfLinks(html, page).map((u) => u.split('/').pop())).toEqual(['gjaldskra.pdf', 'vaxtaakvordun-260901-islenska.pdf']);
  });
});

describe('fi.ee register', () => {
  it('follows the category links, not the headers on the landing page', () => {
    const links = [
      { text: 'Insurance', href: 'https://www.fi.ee/en/supervised-entities/insurance' },
      { text: ' Licensed credit institutions in Estonia ', href: 'https://www.fi.ee/en/x/credit-institutions' },
      { text: 'Insurance companies', href: 'https://www.fi.ee/en/x/insurance-companies' },
      { text: 'Insurance intermediaries', href: 'https://www.fi.ee/en/x/intermediaries' },
    ];
    expect(pickRegisterCategories(links).map((c) => c.label)).toEqual([
      'Licensed credit institutions in Estonia',
      'Insurance companies',
    ]);
  });

  // 2026-10-16: insurers came through, credit institutions did not — the heading is not a
  // link on the landing page, so the crawl looks one level down, on "Credit institutions"
  it('finds a category on its parent page when the landing page only shows it as text', () => {
    const credit = REGISTER_CATEGORIES.filter((c) => c.key.startsWith('credit'));
    const parentPage = [
      { text: 'Licensed credit institutions in Estonia', href: 'https://www.fi.ee/en/x/credit/licensed' },
      { text: 'Affiliated branches of foreign credit institutions', href: 'https://www.fi.ee/en/x/credit/branches' },
    ];
    expect(pickRegisterCategories(parentPage, credit).map((c) => c.key)).toEqual(['credit', 'credit-branches']);
    expect(credit.every((c) => c.via.test('Credit institutions'))).toBe(true);
  });

  it('reports candidate links when a category is still missing', () => {
    const links = [
      { text: 'Home', href: '/' },
      { text: ' Credit  institutions ', href: '/a' },
      { text: 'Credit institutions', href: '/a' },
      { text: 'Krediidiasutused', href: '/b' },
    ];
    expect(registerCandidateLinks(links)).toEqual([
      { text: 'Credit institutions', href: '/a' },
      { text: 'Krediidiasutused', href: '/b' },
    ]);
  });

  // Lines as the 2026-10-08 run captured them, plus the names it missed
  it('reads institution names by legal form, skipping headers and prose', () => {
    const text = [
      'Licensed credit institutions in Estonia',
      'AS LHV Pank',
      'Bigbank AS',
      'AS Citadele banka Eesti filiaal',
      'Branches of foreign E-money institutions',
      'ERGO Insurance SE',
      'We use cookies as described in our policy',
      'info@fi.ee',
    ].join('\n');
    expect(registerEntities(text)).toEqual(['AS LHV Pank', 'Bigbank AS', 'AS Citadele banka Eesti filiaal', 'ERGO Insurance SE']);
  });
});

describe('candidateProductLinks', () => {
  // Holm Bank / TF Bank: in the register, not in the catalogue. The audit follows the
  // site's own menu instead of guessing URL paths it cannot see from the cloud.
  it('keeps same-site product links from the menu, once, and nothing else', () => {
    const links = [
      { text: 'Väikelaen', href: 'https://holmbank.ee/eraklient/vaikelaen' },
      { text: 'Väikelaen', href: 'https://holmbank.ee/eraklient/vaikelaen#calc' },
      { text: 'Hoius', href: 'https://www.holmbank.ee/eraklient/hoius' },
      { text: 'Kontakt', href: 'https://holmbank.ee/kontakt' },
      { text: 'Loan on Facebook', href: 'https://facebook.com/holmbank' },
      { text: 'Avaleht', href: 'https://holmbank.ee/' },
    ];
    expect(candidateProductLinks(links, 'https://holmbank.ee/')).toEqual([
      { text: 'Väikelaen', href: 'https://holmbank.ee/eraklient/vaikelaen' },
      { text: 'Hoius', href: 'https://www.holmbank.ee/eraklient/hoius' },
    ]);
  });

  it('stops at the limit', () => {
    const links = Array.from({ length: 10 }, (_, i) => ({ text: `Laen ${i}`, href: `https://tfbank.ee/laen-${i}` }));
    expect(candidateProductLinks(links, 'https://tfbank.ee/', 3)).toHaveLength(3);
  });
});

describe('Estonian loan pages added 2026-10-27 (Holm, TF Bank)', () => {
  // Both pages are in Estonian and lead with a campaign rate, so they are the
  // first targets where the headline number has an expiry date printed next to
  // it. The parser must take the advertised rate, not the one buried in the
  // representative example, and the APRC must come from the example.
  const BAND_RATE: [number, number] = [4, 25];
  const rateOf = (text: string) => extract(text, RATE_PATTERNS, BAND_RATE);
  // Same call the scraper makes: the fee filter is off for APRC, because an APRC
  // is the all-in rate and always sits in a sentence full of fee words.
  const aprcOf = (text: string) => extract(text, APRC_PATTERNS, [0.5, 35], { feeGuard: false });

  // holmbank.ee/et/eraklient/laenud/holm-vaikelaen, as innerText gave it.
  // The rate sits on its own line under its label, and "Lepingutasu 0 €" (a fee)
  // is the very next line — close enough to swallow the rate if the fee filter
  // worked on a fixed character window instead of the line.
  const holm = [
    'Väikelaen',
    'Kampaania kehtib kuni 30.10.2026',
    'Laenusumma',
    'kuni 25 000 €',
    'Fikseeritud intress',
    '7,99%',
    'Lepingutasu',
    '0 €',
    'Lepingu pikkus',
    '6–120 kuud',
    'Haldustasu',
    '0 €',
    'Väikelaenu intress on fikseeritud kogu laenuperioodi ajaks ning Euribori muutumine Sinu laenumakseid ei mõjuta.',
    'Krediidi kulukuse määr on 15,54% aastas järgmistel näidistingimustel: laenusumma 4 500 €, lepingutasu 0 €, haldustasu 0 € kuus, lepingu kestus 48 kuud, fikseeritud intressimäär 7,99% laenusummalt aastas, makstav kogusumma 5 923,42 €, tagasimaksete summa 5 923,42 € ja tagasimaksete arv 48.',
  ].join('\n');

  it('reads Holm’s advertised rate and the APRC from its own example', () => {
    expect(rateOf(holm)?.value).toBe(7.99);
    expect(aprcOf(holm)?.value).toBe(15.54);
  });

  // tfbank.ee/vaikelaen. The bullet list carries the advertised rate; further
  // down a worked example quotes 9,9% for a different product mix. Reading the
  // example would quote a rate two points above what the bank advertises.
  const tfbank = [
    'LEPINGUTASU 0€ · KUNI 25 000 € · LAEN 12-120 KUUKS',
    'Miks valida väikelaen?',
    '✔ Ei vaja tagatist',
    '✔ 0 € lepingutasu oktoobris',
    '✔ Intress alates 7,90%. Intress on fikseeritud ja Euribori muutus ei suurenda laenumakset',
    '✔ Laenusumma 1000–25 000 €',
    '✔ Lepingutasu on 5% laenu summast',
    '✔ Haldustasu 5,9 €',
    '✔ Tagasimaksmise periood 12–120 kuud',
    'Näiteks, 9000 € laenu puhul 60 kuuks fikseeritud intressiga 9,9%, lepingutasuga 250 € ja igakuise laenuhaldustasuga 5,9 € on krediidi kulukuse määr 13,12%, tagasimaksete arv 60 makset, tarbija poolt makstav kogusumma ja laenu tagasimaksete summa 12 118,80€.',
  ].join('\n');

  it('takes TF Bank’s advertised rate, not the example further down the page', () => {
    expect(rateOf(tfbank)?.value).toBe(7.9);
    expect(aprcOf(tfbank)?.value).toBe(13.12);
  });

  it('never reads a contract fee percentage as the interest rate', () => {
    // "Lepingutasu on 5% laenu summast" is the only percentage on this page.
    const feeOnly = ['Miks valida väikelaen?', '✔ Lepingutasu on 5% laenu summast'].join('\n');
    expect(rateOf(feeOnly)).toBeNull();
  });
});
