/**
 * Minimal, güvenli Markdown → HTML dönüştürücü (blog için).
 * Önce HTML escape edilir (XSS koruması — içerik LLM üretimi), sonra desenler uygulanır.
 * Desteklenen: h2/h3, paragraf, **bold**, *italik*, [link](url), - liste, > alıntı.
 * Yeni npm paketi eklememek için bilinçli olarak küçük tutuldu.
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

  for (const raw of lines) {
    const line = raw.trimEnd();

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
