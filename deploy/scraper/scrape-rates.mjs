/**
 * D1 — Çok bankalı günlük rate scraper (LHV + Coop Pank).
 * scrape-lhv.mjs'in halefi; cron bunu çağırır.
 *
 * Legal durum (2026-07 doğrulandı):
 * - lhv.ee/robots.txt: loan sayfaları tüm UA'lara açık
 * - cooppank.ee/robots.txt: "Allow: /" (Disallow /private/ KÖK path'tir;
 *   /en/private/... onu kapsamaz — prefix eşleşmesi)
 * - Günde 1 çalıştırma + sayfalar arası 3sn — ölçülü kullanım
 *
 * marginPlusEuribor: sayfadaki oran marjdır (ör. "1,49% + Euribor" yapısı sayfada
 * dağınık yazılır) — snippet'e işaret eklenir ki override katmanı canlı EURIBOR
 * ile toplasın, marjı APR gibi basmasın (UCPD).
 */

import { chromium } from 'playwright';

const BANKS = [
  {
    bankId: 'lhv',
    targets: [
      { productType: 'personal', url: 'https://www.lhv.ee/en/consumer-loan' },
      { productType: 'mortgage', url: 'https://www.lhv.ee/en/home-loan' },
      { productType: 'auto',     url: 'https://www.lhv.ee/en/car-loan' },
    ],
  },
  {
    bankId: 'coop',
    targets: [
      { productType: 'personal', url: 'https://www.cooppank.ee/en/private/small-loan' },
      { productType: 'mortgage', url: 'https://www.cooppank.ee/en/private/home/home-loan', marginPlusEuribor: true },
      { productType: 'auto',     url: 'https://www.cooppank.ee/en/private/car/car-loan' },
    ],
  },
];

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
    if (FEE_WORDS.test(m[0])) continue;
    const value = parseFloat(m[1].replace(',', '.'));
    if (!Number.isFinite(value) || value < 0.5 || value > 35) continue;
    const idx = m.index ?? 0;
    const snippet = text.slice(Math.max(0, idx - 60), idx + m[0].length + 60).replace(/\s+/g, ' ').trim();
    return { value, snippet };
  }
  return null;
}

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
  const dryRun = !url || !key;
  if (dryRun) {
    console.warn('[scraper] DRY RUN — SUPABASE_SERVICE_ROLE_KEY yok, DB yazımı atlanacak');
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'en-GB' });
  let total = 0;
  let failures = 0;

  for (const bank of BANKS) {
    for (const target of bank.targets) {
      total++;
      try {
        console.log(`[scraper] ${bank.bankId}/${target.productType} → ${target.url}`);
        const resp = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        if (resp && resp.status() >= 400) {
          throw new Error(`HTTP ${resp.status()} — URL değişmiş olabilir`);
        }
        await page.waitForTimeout(3000);
        const text = await page.evaluate(() => document.body.innerText);

        const rate = extract(text, RATE_PATTERNS);
        const aprc = extract(text, APRC_PATTERNS);
        const parseOk = rate !== null;

        // Marj işareti: override katmanının /euribor/i tespiti için snippet'e eklenir.
        // Ürün yapısı (marj + Euribor) sayfa incelemesiyle manuel doğrulandı.
        let snippet = rate?.snippet ?? text.slice(0, 300);
        if (parseOk && target.marginPlusEuribor && !/euribor/i.test(snippet)) {
          snippet += ' [margin + 6-month Euribor — page-flagged]';
        }

        if (!dryRun) {
          await insertRow(url, key, {
            bank_id:      bank.bankId,
            product_type: target.productType,
            rate_min:     rate?.value ?? null,
            aprc:         aprc?.value ?? null,
            source_url:   target.url,
            raw_snippet:  snippet,
            parse_ok:     parseOk,
          });
        }

        if (parseOk) {
          console.log(`[scraper] OK — rate ${rate.value}%${aprc ? `, APRC ${aprc.value}%` : ''}${target.marginPlusEuribor ? ' (margin)' : ''}`);
        } else {
          failures++;
          console.warn(`[scraper] PARSE FAILED — oran deseni bulunamadı (selector drift?). parse_ok=false.`);
        }
      } catch (err) {
        failures++;
        console.error(`[scraper] ERROR ${bank.bankId}/${target.productType}:`, err instanceof Error ? err.message : err);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  await browser.close();
  console.log(`[scraper] Done — ${total - failures}/${total} targets OK`);
  process.exit(failures === total ? 1 : 0);
}

main();
