/**
 * D1 Pilot — LHV rate scraper
 *
 * Neden LHV: robots.txt loan sayfalarına tüm UA'lara izin veriyor (kontrol edildi
 * 2026-07-02), faiz oranı halka açık faktüel veri, ve D3'te LHV partnerliği zaten
 * hedefte. Politeness: günde 1 çalıştırma, sayfalar arası 3sn bekleme, sonuçlar
 * cache'lenir — siteye yük binmez.
 *
 * Çalıştırma (VPS):
 *   cd /var/www/nordicrate/deploy/scraper
 *   node --env-file=/var/www/nordicrate/.env.local scrape-lhv.mjs
 *
 * Gereken env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Kurulum: bkz. README.md
 */

import { chromium } from 'playwright';

const BANK_ID = 'lhv';

// URL'ler LHV EN nav'ından doğrulandı (2026-07-02)
const TARGETS = [
  { productType: 'personal', url: 'https://www.lhv.ee/en/consumer-loan' },
  { productType: 'mortgage', url: 'https://www.lhv.ee/en/home-loan' },
  { productType: 'auto',     url: 'https://www.lhv.ee/en/car-loan' },
];

// Sayfa metninden oran çıkarma — EN + ET desenleri, en spesifikten genele
const RATE_PATTERNS = [
  /interest(?:\s+rate)?[^%\d]{0,80}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
  /intress[^%\d]{0,80}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
  /(?:from|alates)\s+(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
];

const APRC_PATTERNS = [
  /(?:APRC|annual percentage rate(?: of charge)?)[^%\d]{0,120}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
  /krediidi kulukuse m[aä]{1,2}r[^%\d]{0,120}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
];

// Faiz yerine ücret yakalamayı önler ("Contract fee 2% of loan sum" gibi)
const FEE_WORDS = /fee|contract|service|tasu|lepingutasu|haldustasu|penalty|viivis/i;

function extract(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    // Keyword ile değer arasındaki metinde ücret kelimesi varsa bu bir fee'dir, faiz değil
    if (FEE_WORDS.test(m[0])) continue;
    const value = parseFloat(m[1].replace(',', '.'));
    // Sanity: kredi faizi 0.5–35% aralığı dışındaysa parse hatası say
    if (!Number.isFinite(value) || value < 0.5 || value > 35) continue;
    const idx = m.index ?? 0;
    const snippet = text.slice(Math.max(0, idx - 60), idx + m[0].length + 60).replace(/\s+/g, ' ').trim();
    return { value, snippet };
  }
  return null;
}

// supabase-js yerine doğrudan PostgREST — Node 20'de ws bağımlılığı yok, Realtime gereksiz
async function insertRow(url, key, row) {
  const res = await fetch(`${url}/rest/v1/scraped_rates`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    throw new Error(`Supabase insert: HTTP ${res.status} — ${await res.text()}`);
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Key yoksa dry-run: scrape + parse çalışır, DB yazımı atlanır.
  const dryRun = !url || !key;
  if (dryRun) {
    console.warn('[scraper] DRY RUN — SUPABASE_SERVICE_ROLE_KEY yok, sonuçlar DB\'ye yazılmayacak');
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'en-GB' });
  let failures = 0;

  for (const target of TARGETS) {
    try {
      console.log(`[scraper] ${BANK_ID}/${target.productType} → ${target.url}`);
      // networkidle bazı LHV sayfalarında hiç gelmiyor (sürekli analytics trafiği)
      const resp = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      if (resp && resp.status() >= 400) {
        throw new Error(`HTTP ${resp.status()} — URL değişmiş olabilir`);
      }
      await page.waitForTimeout(3000); // lazy içerik için
      const text = await page.evaluate(() => document.body.innerText);

      const rate = extract(text, RATE_PATTERNS);
      const aprc = extract(text, APRC_PATTERNS);
      const parseOk = rate !== null;

      if (!dryRun) {
        await insertRow(url, key, {
          bank_id:      BANK_ID,
          product_type: target.productType,
          rate_min:     rate?.value ?? null,
          aprc:         aprc?.value ?? null,
          source_url:   target.url,
          raw_snippet:  rate?.snippet ?? text.slice(0, 300),
          parse_ok:     parseOk,
        });
      }

      if (parseOk) {
        console.log(`[scraper] OK — rate ${rate.value}%${aprc ? `, APRC ${aprc.value}%` : ''}`);
        console.log(`[scraper]      "${rate.snippet}"`);
      } else {
        failures++;
        console.warn(`[scraper] PARSE FAILED — sayfa açıldı ama oran deseni bulunamadı (selector drift?). parse_ok=false yazıldı.`);
      }
    } catch (err) {
      failures++;
      console.error(`[scraper] ERROR ${target.productType}:`, err instanceof Error ? err.message : err);
    }

    // Politeness: sayfalar arası bekleme
    await new Promise((r) => setTimeout(r, 3000));
  }

  await browser.close();
  console.log(`[scraper] Done — ${TARGETS.length - failures}/${TARGETS.length} targets OK`);
  process.exit(failures === TARGETS.length ? 1 : 0); // hepsi patladıysa cron mail atsın
}

main();
