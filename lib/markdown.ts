/**
 * Minimal, güvenli Markdown → HTML dönüştürücü (blog için).
 * Önce HTML escape edilir (XSS koruması — içerik LLM üretimi), sonra desenler uygulanır.
 * Desteklenen: h2/h3, paragraf, **bold**, *italik*, [link](url), - liste, > alıntı,
 * | tablo |.
 * Yeni npm paketi eklememek için bilinçli olarak küçük tutuldu.
 *
 * 2026-11: tablo desteği yoktu ve satırlar paragraf dalına düşüyordu — 71 blog
 * yazısının 34'ü oran karşılaştırma tablosunu tek <p> içinde boru işareti duvarı
 * olarak gösteriyordu ("|---|---|---| | SEB | 1,35% | ..."). Yazının en değerli
 * kısmı tam olarak okunamayan kısımdı.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Sadece http(s) linklerine izin ver
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-sky-600 underline underline-offset-2 hover:text-sky-800">$1</a>');
}

/** "| a | b |" → ['a', 'b'] (baştaki/sondaki boru işaretleri atılır) */
function cells(line: string): string[] {
  return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
}

/** GFM ayraç satırı: |---|:--:|---:| — hizalama kabul edilir, uygulanmaz. */
function isDelimiterRow(line: string): boolean {
  const c = cells(line);
  return c.length > 0 && c.every(x => /^:?-{1,}:?$/.test(x));
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md.replace(/\r\n/g, '\n')).split('\n');
  const out: string[] = [];
  let inList = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (inList) { out.push('</ul>'); inList = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();

    // Tablo: "| ... |" satırı ve ardından ayraç satırı. Tanınmazsa satırlar eskisi
    // gibi paragrafa düşer — yani kısmi/bozuk tablo yazıyı kırmaz.
    if (/^\s*\|/.test(line) && i + 1 < lines.length && isDelimiterRow(lines[i + 1])) {
      flushParagraph(); closeList();
      const head = cells(line);
      const body: string[][] = [];
      let j = i + 2;
      for (; j < lines.length && /^\s*\|/.test(lines[j]); j++) {
        if (isDelimiterRow(lines[j])) continue;
        body.push(cells(lines[j]));
      }
      const th = head.map(c => `<th>${inline(c)}</th>`).join('');
      const rows = body
        .map(r => `<tr>${head.map((_, k) => `<td>${inline(r[k] ?? '')}</td>`).join('')}</tr>`)
        .join('');
      // Sarmalayıcı div: telefonda geniş oran tablosu sayfayı yatay kaydırtmasın.
      out.push(
        `<div class="nr-table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${rows}</tbody></table></div>`
      );
      i = j - 1;
      continue;
    }

    if (/^###\s+/.test(line)) {
      flushParagraph(); closeList();
      out.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`);
    } else if (/^##\s+/.test(line)) {
      flushParagraph(); closeList();
      out.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`);
    } else if (/^#\s+/.test(line)) {
      // H1 başlık sayfada ayrıca render ediliyor — h2'ye indir
      flushParagraph(); closeList();
      out.push(`<h2>${inline(line.replace(/^#\s+/, ''))}</h2>`);
    } else if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
    } else if (/^&gt;\s?/.test(line)) {
      flushParagraph(); closeList();
      out.push(`<blockquote>${inline(line.replace(/^&gt;\s?/, ''))}</blockquote>`);
    } else if (line.trim() === '') {
      flushParagraph(); closeList();
    } else {
      closeList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph(); closeList();
  return out.join('\n');
}
