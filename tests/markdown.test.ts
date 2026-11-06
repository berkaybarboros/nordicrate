/**
 * The blog's Markdown renderer.
 *
 * 2026-11: renderMarkdown had no table branch, so table rows fell through to
 * the paragraph branch and were joined with spaces into a single <p>. 34 of 71
 * published posts showed their rate-comparison table as a wall of pipes —
 * "|---|---|---| | SEB | 1,35% | 4,06% | | LHV | ..." — which is the one part
 * of a comparison article a reader actually came for. It was live for weeks and
 * nothing failed, because nothing checked the output.
 *
 * Escaping is pinned too: post bodies are LLM-generated, so the renderer is the
 * only thing standing between generated text and dangerouslySetInnerHTML.
 */

import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '@/lib/markdown';

const TABLE = [
  '| Bank | Advertised Margin (from) | Estimated client rate |',
  '|---|---|---|',
  '| SEB | 1,35% | 4,06% |',
  '| LHV | 1,49% | 4,20% |',
].join('\n');

describe('renderMarkdown tables', () => {
  it('renders a GFM table as a table, not a paragraph of pipes', () => {
    const html = renderMarkdown(TABLE);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Bank</th>');
    expect(html).toContain('<td>SEB</td>');
    expect(html).toContain('<td>1,35%</td>');
    // The exact shape that shipped to readers for weeks.
    expect(html).not.toContain('|---|');
    expect(html).not.toMatch(/<p>[^<]*\|/);
  });

  it('keeps every body row', () => {
    const html = renderMarkdown(TABLE);
    expect(html.match(/<tr>/g) ?? []).toHaveLength(3); // header + 2 rows
  });

  it('accepts alignment markers without emitting them as text', () => {
    const html = renderMarkdown('| A | B |\n|:---|---:|\n| 1 | 2 |');
    expect(html).toContain('<th>A</th>');
    expect(html).not.toContain(':---');
  });

  it('pads a short row instead of dropping the columns after it', () => {
    const html = renderMarkdown('| A | B | C |\n|---|---|---|\n| 1 | 2 |');
    expect(html.match(/<td>/g) ?? []).toHaveLength(3);
    expect(html).toContain('<td></td>');
  });

  it('wraps the table so a wide one scrolls instead of widening the page', () => {
    expect(renderMarkdown(TABLE)).toContain('nr-table-wrap');
  });

  it('leaves a pipe line with no delimiter row as ordinary prose', () => {
    // A lone "| maybe |" is likelier a typo than a table; it must not swallow
    // the rest of the article.
    const html = renderMarkdown('| not a table |\n\nNext paragraph.');
    expect(html).not.toContain('<table>');
    expect(html).toContain('<p>Next paragraph.</p>');
  });

  it('renders inline markup inside cells', () => {
    const html = renderMarkdown('| Bank | Note |\n|---|---|\n| SEB | **fixed** |');
    expect(html).toContain('<strong>fixed</strong>');
  });
});

describe('renderMarkdown escaping', () => {
  it('escapes HTML in a table cell', () => {
    const html = renderMarkdown('| A |\n|---|\n| <img src=x onerror=alert(1)> |');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('escapes HTML in prose', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).not.toContain('<script>');
  });

  it('allows only http(s) links', () => {
    const html = renderMarkdown('[x](javascript:alert(1)) and [y](https://nordicrate.com)');
    // A non-http scheme is left as literal text rather than becoming an anchor,
    // so what matters is that no href carries it.
    expect(html).not.toMatch(/href="\s*javascript:/i);
    expect(html).toContain('href="https://nordicrate.com"');
  });
});
