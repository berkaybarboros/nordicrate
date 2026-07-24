/**
 * D1 — Çok bankalı günlük rate scraper (LHV + Coop Pank + SEB).
 * scrape-lhv.mjs'in halefi; cron bunu çağırır.
 *
 * Legal durum (2026-07 doğrulandı):
 * - lhv.ee/robots.txt: loan sayfaları tüm UA'lara açık
 * - cooppank.ee/robots.txt: "Allow: /" (Disallow /private/ KÖK path'tir;
 *   /en/private/... onu kapsamaz — prefix eşleşmesi)
 * - seb.ee/robots.txt: sadece /media/oembed + /sites/default/files disallow —
 *   loan sayfaları açık; ToS'ta anti-scraping maddesi bulunamadı (2026-07-19)
 * - Günde 1 çalıştırma + sayfalar arası 3sn — ölçülü kullanım
 *
 * marginPlusEuribor: sayfadaki oran marjdır (ör. "1,49% + Euribor" yapısı sayfada
 * dağınık yazılır) — snippet'e işaret eklenir ki override katmanı canlı EURIBOR
 * ile toplasın, marjı APR gibi basmasın (UCPD).
 *
 * preferFrom: sayfada temsili örnek hesap varsa ("fixed annual interest rate of 8%"
 * gibi) genel interest-pattern yanlış değeri yakalar — önce "from X%" denenir (SEB).
 */

import { chromium } from 'playwright';

// band: [min,max] — hedef için makul oran aralığı (statik katalog + sayfa doğrulaması).
// Bandın dışına düşen adaylar atlanır: kampanya örnekleri, başka ürünün oranı,
// peşinat yüzdesi gibi yanlış-pozitifleri keser. Marjlı hedeflerde band = marj aralığı.
const BAND_RATE   = [4, 25];    // tam faiz (personal/auto)
const BAND_MARGIN = [0.8, 3.5]; // marj (+ Euribor sonra eklenir)

const BANKS = [
  {
    bankId: 'lhv',
    targets: [
      { productType: 'personal', url: 'https://www.lhv.ee/en/consumer-loan', band: BAND_RATE },
      // LHV home loan sayfası marj yayınlıyor ("from 1.49%" + Euribor) — 2026-07-19 doğrulandı
      { productType: 'mortgage', url: 'https://www.lhv.ee/en/home-loan', marginPlusEuribor: true, band: BAND_MARGIN },
      { productType: 'auto',     url: 'https://www.lhv.ee/en/car-loan', band: BAND_RATE },
    ],
  },
  {
    bankId: 'coop',
    targets: [
      { productType: 'personal', url: 'https://www.cooppank.ee/en/private/small-loan', band: BAND_RATE },
      { productType: 'mortgage', url: 'https://www.cooppank.ee/en/private/home/home-loan', marginPlusEuribor: true, band: BAND_MARGIN },
      { productType: 'auto',     url: 'https://www.cooppank.ee/en/private/car/car-loan', band: BAND_RATE },
    ],
  },
  {
    bankId: 'seb',
    targets: [
      { productType: 'personal', url: 'https://www.seb.ee/en/private/loans/consumer-loan', band: BAND_RATE },
      { productType: 'mortgage', url: 'https://www.seb.ee/en/private/loans/home-loan', marginPlusEuribor: true, band: BAND_MARGIN },
      { productType: 'auto',     url: 'https://www.seb.ee/en/private/loans/car-loan', band: BAND_RATE },
    ],
  },
  {
    // Swedbank EE: robots.txt kredi sayfalarına açık (2026-07-19); SADECE personal —
    // mortgage sayfası oran yayınlamıyor, car URL'i personal içeriğine düşüyor.
    // Luminor değerlendirildi ve ELENDİ: Cloudflare tüm otomasyonu blokluyor, aşmayız.
    bankId: 'swedbank',
    targets: [
      // SPA — oran metni geç render oluyor, uzun bekleme şart
      { productType: 'personal', url: 'https://www.swedbank.ee/private/credit/loans/personal?language=ENG', band: BAND_RATE, waitMs: 8000 },
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

// Faiz yerine ücret/peşinat yakalamayı önler ("Contract fee 2%", "Self-financing from 10%")
// 'service' tek başına DEĞİL ('self-service' legit faiz bağlamı — Coop 2026-07-19)
const FEE_WORDS = /fee|contract|service (?:fee|charge)|tasu|lepingutasu|haldustasu|penalty|viivis|self-financing|omafinantseering|down payment|sissemakse|price of the vehicle|of the loan amount/i;

/**
 * Öncelik sıralı ilk GEÇERLİ eşleşme: pattern öncelik sırasıyla, belge sırasında
 * ilerler; ücret/peşinat penceresi, "Euribor ... X%" alıntısı ve band dışı değerler
 * atlanır. Global-min yaklaşımı başka ürünlerin oranlarını çalıyordu (Coop 3.5
 * regresyonu, 2026-07-19) — belge sırası + band birlikte doğru değeri seçiyor.
 */
function extract(text, patterns, band = [0.5, 35]) {
  for (const re of patterns) {
    const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    for (const m of text.matchAll(global)) {
      const idx = m.index ?? 0;
      const window = text.slice(Math.max(0, idx - 60), idx + m[0].length + 60).replace(/\s+/g, ' ').trim();
      if (FEE_WORDS.test(window)) continue;
      // "Euribor ... 2.69%" alıntısı (sayıdan ÖNCE euribor) faiz tabanı değildir;
      // marj metinlerinde euribor sayıdan SONRA gelir ("1.35% + Euribor")
      if (/euribor/i.test(text.slice(Math.max(0, idx - 30), idx))) continue;
      const value = parseFloat(m[1].replace(',', '.'));
      if (!Number.isFinite(value) || value < band[0] || value > band[1]) continue;
      return { value, snippet: window };
    }
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
        await page.waitForTimeout(target.waitMs ?? 3000);
        const text = await page.evaluate(() => document.body.innerText);

        const rate = extract(text, RATE_PATTERNS, target.band);
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
