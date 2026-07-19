/**
 * Apply-link denetçisi — data/loans.ts + data/insurance.ts + lib/data.ts (website)
 * içindeki tüm outbound URL'leri haftalık test eder, kırıkları raporlar.
 *
 * Kırık tanımı: HTTP >= 400 (403 hariç — çoğu banka bot koruması) VEYA
 * final URL'in soft-404 pattern'i içermesi (/404, 404LV.html vb.).
 *
 * Cron (VPS): 0 5 * * 1  node /var/www/nordicrate/deploy/scraper/check-apply-links.mjs
 * Çıktı: stdout → /var/log/nordicrate-linkcheck.log (cron yönlendirmesi)
 * Kırık varsa exit 1 — log'da "BROKEN" ara.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const SOFT_404 = /\/404|404[A-Z]{2}\.html|page-not-found|not-found/i;

async function extractUrls() {
  const files = ['data/loans.ts', 'data/insurance.ts', 'lib/data.ts'];
  const urls = new Set();
  for (const f of files) {
    const src = await readFile(join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/(?:applyUrl|website):\s*["'](https:\/\/[^"']+)["']/g)) {
      urls.add(m[1]);
    }
  }
  return [...urls];
}

async function check(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      redirect: 'follow',
      signal: ctrl.signal,
    });
    const finalUrl = res.url || url;
    if (SOFT_404.test(finalUrl)) return { url, status: res.status, finalUrl, broken: true, reason: 'soft-404 redirect' };
    if (res.status === 403) return { url, status: 403, finalUrl, broken: false, reason: 'bot-protected (assumed OK)' };
    if (res.status >= 400) return { url, status: res.status, finalUrl, broken: true, reason: `http ${res.status}` };
    return { url, status: res.status, finalUrl, broken: false };
  } catch (e) {
    return { url, status: 0, finalUrl: url, broken: true, reason: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const urls = await extractUrls();
  console.log(`[linkcheck] ${new Date().toISOString()} — testing ${urls.length} outbound URLs`);

  const broken = [];
  // Sıralı + hafif gecikme — banka sitelerini floodlamayalım
  for (const url of urls) {
    const r = await check(url);
    if (r.broken) {
      broken.push(r);
      console.log(`BROKEN ${r.status} ${r.url} (${r.reason})`);
    }
    await new Promise((res) => setTimeout(res, 400));
  }

  console.log(`[linkcheck] done: ${broken.length}/${urls.length} broken`);
  if (broken.length > 0) process.exitCode = 1;
}

main();
