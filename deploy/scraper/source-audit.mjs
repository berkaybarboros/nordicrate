/**
 * Kaynak denetimi — katalogdaki hız/ücret iddialarını ve kurum listesini bankaların
 * kendi sayfalarına karşı kontrol etmek için kanıt toplar. SUNUCUDA çalışır: banka
 * siteleri ve fi.ee cloud oturumundan erişilemiyor (egress politikası), bazı bankalar
 * da sunucu dışındaki IP'leri 403'lüyor.
 *
 * Ne YAPMAZ: ürün verisine (lib/data.ts, data/loans.ts, oran tabloları) dokunmaz,
 * hiçbir iddiayı "doğrulandı" diye işaretlemez. Tek yazdığı yer, --save ile kendi
 * source_audits tablosu. Yalnız her kaynak sayfadan ilgili cümleleri çıkarıp markdown rapora
 * yazar; karar (tut / düzelt / sil) insan incelemesiyle lib/data.ts / data/loans.ts'e
 * yansır. CLAUDE.md kuralı: ürün verisi banka sitesi doğrulaması olmadan değişmez.
 *
 * Kullanım (sunucuda, deploy/scraper içinde — playwright zaten kurulu):
 *   node source-audit.mjs                     # tüm iddialar + fi.ee sicili
 *   node source-audit.mjs --tld ee            # yalnız .ee kaynakları
 *   node source-audit.mjs --no-register       # sicili atla
 *   node source-audit.mjs --out /tmp/audit.md
 *   node source-audit.mjs --claims my-claims.json   # başka bir iddia listesi
 *   node --env-file=../../.env.local source-audit.mjs --tld ee --save   # Supabase'e de yaz
 *
 * Elle çalıştırmaya gerek yok: scrape-rates.mjs (günlük cron) son kayıt 7 günden eskiyse
 * `.ee` denetimini kendisi çalıştırıp source_audits'e yazar.
 *   CHROMIUM_PATH=/usr/bin/chromium node source-audit.mjs   # tarayıcı sürümü uyuşmazsa
 *
 * Girdi: claims-to-verify.json (lib/claims.ts'ten üretilir; tests/claims.test.ts senkron tutar)
 */

import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { EVIDENCE_TERMS, evidenceSnippets } from './parsers.mjs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DELAY_MS = 3000; // scrape-rates.mjs ile aynı nezaket aralığı
const UA = 'NordicRateSourceAudit/1.0 (+https://nordicrate.com/listing-policy)';

// fi.ee "supervised entities" — sayfalı liste. HTML yapısı cloud'dan görülemediği için
// ayrıştırmıyoruz: ana metni alıp kurum türü kelimelerini içeren satırları rapora döküyoruz.
const REGISTER_URL = 'https://www.fi.ee/en/supervised-entities';
const REGISTER_TERMS = ['credit institution', 'krediidiasutus', 'insurance', 'kindlustus', 'branch', 'filiaal'];
const REGISTER_MAX_PAGES = 200;

function parseArgs(argv) {
  const args = { tld: null, register: true, claims: resolve(HERE, 'claims-to-verify.json'), out: resolve(HERE, `out/source-audit-${new Date().toISOString().slice(0, 10)}.md`) };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--tld') args.tld = argv[++i];
    else if (argv[i] === '--no-register') args.register = false;
    else if (argv[i] === '--out') args.out = resolve(argv[++i]);
    else if (argv[i] === '--claims') args.claims = resolve(argv[++i]);
    else if (argv[i] === '--save') args.save = true;
  }
  return args;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageText(page, url) {
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500); // JS ile gelen fiyat tabloları
  const status = res?.status() ?? 0;
  const text = await page.locator('body').innerText().catch(() => '');
  return { status, text, finalUrl: page.url() };
}

async function auditClaims(page, claims) {
  const byUrl = new Map();
  for (const c of claims) {
    if (!byUrl.has(c.sourceUrl)) byUrl.set(c.sourceUrl, []);
    byUrl.get(c.sourceUrl).push(c);
  }
  const sections = [];
  let failedPages = 0;
  for (const [url, group] of byUrl) {
    let result;
    try {
      result = await pageText(page, url);
    } catch (err) {
      // İlk satır yeter; Playwright'ın ANSI renkli çağrı günlüğü rapora girmesin
      const first = String(err).split('\n')[0].replace(/\x1b\[[0-9;]*m/g, '');
      result = { status: 0, text: '', finalUrl: url, error: first.slice(0, 200) };
    }
    const lines = [`### ${url}`, ''];
    if (result.finalUrl !== url) lines.push(`Redirected to: ${result.finalUrl}`, '');
    const failed = Boolean(result.error) || result.status >= 400 || !result.text;
    if (failed) {
      failedPages++;
      lines.push(`**fetch-failed** — HTTP ${result.status}${result.error ? ` · ${result.error}` : ''}`, '');
    }
    const kinds = [...new Set(group.map((c) => c.kind))];
    const snippetsByKind = Object.fromEntries(kinds.map((k) => [k, evidenceSnippets(result.text, EVIDENCE_TERMS[k])]));
    for (const c of group) {
      lines.push(`- \`${c.id}\` (${c.kind}) — **"${c.text}"** · ${c.institution}`);
    }
    lines.push('');
    // Sayfa okunamadıysa "kanıt yok" yazmak yanıltır — hiç bakılamadı
    for (const k of failed ? [] : kinds) {
      const snips = snippetsByKind[k];
      lines.push(`<details><summary>${k} evidence: ${snips.length} snippet(s)</summary>`, '');
      if (snips.length === 0) lines.push('_No matching sentences on this page._');
      for (const s of snips) lines.push(`> ${s}`, '');
      lines.push('</details>', '');
    }
    sections.push(lines.join('\n'));
    console.error(`[audit] ${url} → HTTP ${result.status}, ${group.length} claim(s)`);
    await sleep(DELAY_MS);
  }
  return { sections, pages: byUrl.size, failedPages };
}

async function auditRegister(page) {
  const lines = ['## Finantsinspektsioon register (raw lines)', '', `Source: ${REGISTER_URL}`, ''];
  const seen = new Set();
  let pages = 0;
  for (let n = 0; n < REGISTER_MAX_PAGES; n++) {
    const url = n === 0 ? REGISTER_URL : `${REGISTER_URL}?page=${n}`;
    let result;
    try {
      result = await pageText(page, url);
    } catch (err) {
      lines.push(`Stopped at page ${n}: ${String(err).slice(0, 160)}`);
      break;
    }
    if (result.status >= 400) {
      lines.push(`Stopped at page ${n}: HTTP ${result.status}`);
      break;
    }
    const before = seen.size;
    for (const raw of result.text.split('\n')) {
      const line = raw.trim();
      if (line.length < 4 || line.length > 200 || seen.has(line)) continue;
      if (REGISTER_TERMS.some((t) => line.toLowerCase().includes(t))) seen.add(line);
    }
    pages++;
    if (seen.size === before && n > 0) break; // yeni satır yok → liste bitti
    await sleep(1500);
  }
  lines.push(`Pages read: ${pages}`, '', ...[...seen].map((l) => `- ${l}`), '');
  return { markdown: lines.join('\n'), entries: seen.size };
}

export function loadClaims(file, tld) {
  const all = JSON.parse(readFileSync(file, 'utf8'));
  return tld
    ? all.filter((c) => c.sourceUrl && new URL(c.sourceUrl).hostname.endsWith(`.${tld}`))
    : all.filter((c) => c.sourceUrl);
}

/** Tek koşu: verilen tarayıcıyla iddiaları (ve istenirse sicili) denetler, raporu döner. */
export async function runAudit(browser, { tld = null, register = true, claimsFile = resolve(HERE, 'claims-to-verify.json') } = {}) {
  const claims = loadClaims(claimsFile, tld);
  const page = await browser.newPage({ userAgent: UA });
  try {
    const claimRun = await auditClaims(page, claims);
    const reg = register ? await auditRegister(page) : null;
    const markdown = [
      `# Source audit — ${new Date().toISOString()}`,
      '',
      `Claims: ${claims.length}${tld ? ` (.${tld} sources only)` : ''} on ${claimRun.pages} page(s), ${claimRun.failedPages} could not be read.`,
      'A snippet is evidence to read, not a verdict: decide keep / correct / remove per claim,',
      'then edit lib/data.ts or data/loans.ts.',
      '',
      '## Claims by source page',
      '',
      ...claimRun.sections,
      ...(reg ? [reg.markdown] : []),
    ].join('\n');
    return {
      scope: tld ? `.${tld}` : 'all',
      claimsTotal: claims.length,
      pagesTotal: claimRun.pages,
      pagesFailed: claimRun.failedPages,
      registerEntries: reg ? reg.entries : null,
      markdown,
    };
  } finally {
    await page.close();
  }
}

/*
 * Sonuç Supabase'e (source_audits, bkz. schema-source-audit.sql): sunucuya SSH olmadan
 * rapor cloud oturumundan salt-okunur sorguyla okunabilsin. Yalnız bu denetim tablosuna
 * yazılır — ürün verisine dokunulmaz.
 */
export async function saveAudit(url, key, result) {
  const res = await fetch(`${url}/rest/v1/source_audits`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      scope: result.scope,
      claims_total: result.claimsTotal,
      pages_total: result.pagesTotal,
      pages_failed: result.pagesFailed,
      register_entries: result.registerEntries,
      report_md: result.markdown,
    }),
  });
  if (!res.ok) throw new Error(`source_audits insert: HTTP ${res.status} — ${await res.text()}`);
}

/** Son denetim `days` günden eskiyse (ya da hiç yoksa) true. Tablo yoksa false — sessizce atla. */
export async function auditDue(url, key, days = 7) {
  let res;
  try {
    res = await fetch(`${url}/rest/v1/source_audits?select=run_at&order=run_at.desc&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
  } catch {
    return false; // Supabase'e ulaşılamıyor — denetimi bir sonraki koşuya bırak
  }
  if (!res.ok) return false; // tablo henüz kurulmadıysa scraper'ı yorma
  const rows = await res.json();
  if (!rows.length) return true;
  return Date.now() - new Date(rows[0].run_at).getTime() > days * 86400000;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  // CHROMIUM_PATH: paketlenmiş tarayıcı Playwright sürümüyle uyuşmazsa sistemdekini kullan
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    const result = await runAudit(browser, { tld: args.tld, register: args.register, claimsFile: args.claims });
    mkdirSync(dirname(args.out), { recursive: true });
    writeFileSync(args.out, result.markdown);
    console.error(`[audit] report → ${args.out}`);
    if (args.save) {
      await saveAudit(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, result);
      console.error('[audit] saved to source_audits');
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
