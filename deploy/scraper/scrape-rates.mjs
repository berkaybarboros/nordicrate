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
  {
    // Inbank EE: robots.txt açık (sadece /auth disallow), oranlar statik (2026-07-19).
    // "Small home loan" BİLİNÇLİ dışarıda: teminatsız tadilat kredisi, mortgage değil.
    bankId: 'inbank',
    targets: [
      { productType: 'personal', url: 'https://www.inbank.ee/en/loan/personal-loan', band: BAND_RATE, waitMs: 5000 },
      { productType: 'auto',     url: 'https://www.inbank.ee/en/loan/car-loan', band: BAND_RATE, waitMs: 5000 },
    ],
  },
  {
    // Bigbank EE: robots.txt açık; EN site kapandı, sayfalar Estonca —
    // pattern'ler 'intress/alates' desteğiyle zaten uyumlu (2026-07-19).
    // kodulaen scrape edilir ama katalogda ürünü YOK (max limit yayınlanmıyor,
    // uydurmayız) — ürün doğrulanmış limitle eklendiği gün otomatik canlanır.
    bankId: 'bigbank',
    targets: [
      { productType: 'personal', url: 'https://www.bigbank.ee/vaikelaen/', band: BAND_RATE, waitMs: 5000 },
      { productType: 'auto',     url: 'https://www.bigbank.ee/autolaen/', band: BAND_RATE, waitMs: 5000 },
      { productType: 'mortgage', url: 'https://www.bigbank.ee/kodulaen/', marginPlusEuribor: true, band: BAND_MARGIN, waitMs: 5000 },
    ],
  },
  {
    // Citadele LV (7. banka): robots.txt kredi sayfaları açık (2026-08-04 doğrulaması —
    // sadece thanks/search/feedback vb. disallow). Katalog karşılığı: citadele-lv.
    // consumer sayfası "Interest rate from 6.5% per year" (consumer loan bloğu);
    // mortgage sayfası örnek marj "2.20% + 6-month EURIBOR" → marginPlusEuribor.
    // Auto BİLİNÇLİ dışarıda: autocredit oranı yalnız fee'li örnek cümlede geçiyor
    // (FEE filtresi doğru şekilde eler) + katalogda citadele auto ürünü yok.
    bankId: 'citadele',
    targets: [
      { productType: 'personal', url: 'https://www.citadele.lv/en/private/consumer/', band: BAND_RATE, waitMs: 5000 },
      // aprcBand: sayfa altındaki kredi kartı örneği (APR 14.76%) mortgage APRC'si değil
      { productType: 'mortgage', url: 'https://www.citadele.lv/en/private/mortgage/', marginPlusEuribor: true, band: BAND_MARGIN, aprcBand: [2, 9], waitMs: 5000 },
    ],
  },
  {
    // Citadele EE (8. banka): citadele.ee robots.txt kredi sayfaları açık
    // (2026-08-05 doğrulaması). Katalog: citadele-ee (personal + auto; mortgage
    // ürünü limitler yayınlanmadığı için katalogda yok — scrape hazır bekler).
    // consumer/autocredit: "interest rate starting from 6.5%"; mortgage örneği
    // "3.956% (margin 1.8% + six-month EURIBOR)" → 3.956 band dışı, MARGIN
    // pattern'i 1.8'i yakalar.
    bankId: 'citadele-ee',
    targets: [
      { productType: 'personal', url: 'https://www.citadele.ee/en/private/consumer/', band: BAND_RATE, waitMs: 5000 },
      { productType: 'auto',     url: 'https://www.citadele.ee/en/private/autocredit/', band: BAND_RATE, waitMs: 5000 },
      { productType: 'mortgage', url: 'https://www.citadele.ee/en/private/mortgage/', marginPlusEuribor: true, band: BAND_MARGIN, aprcBand: [2, 9], waitMs: 5000 },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MEVDUAT (2026-09-13)
 *
 * Neden: mevduat oranlari bu scraper'in kapsaminda degildi ve statik katalog
 * gercegin ~2 kati cikti (LHV 12 ay sitede 4.1% / bankada 2.20%; Bigbank'in
 * vadeli mevduat urunu hic yokken "4.3% Highest Rate" gosteriliyordu).
 *
 * Kredinin aksine mevduat VADE yapili — tek "from X%" yetmez. Tum hedef
 * sayfalar 2026-09-13'te Firecrawl ile incelendi; tablo bicimleri farkli:
 *   LHV       "12 months  2.20%  1.50%"      (EUR ilk sutun, USD ikinci)
 *   Coop      "12-17months  2,25%"           (aralik, virgul ondalik)
 *   SEB       "1 year2.20%22.30 EUR..."      (hesaplayici satiri, JS render)
 *   Inbank    "12 months  2.50 %"            (% oncesi bosluk)
 *   Swedbank  "12 months  2.20"              (% ISARETI YOK; ilk tablo EUR)
 *   Citadele  "1.5 y.  2,20 %  2,50 %"       (yil kisaltmasi, ondalik yil)
 * Hepsini tek satir ayristirici karsilar: satir BASINDA vade etiketi, ardindan
 * ilk ondalik sayi. Ilk eslesme kazanir -> EUR tablosu / vade sonu faiz tablosu
 * (her iki sayfada da ilk sirada) otomatik secilir.
 *
 * Elenenler: Bigbank (web'de vadeli mevduat urunu yok — urun katalogu yalnizca
 * cari hesap listeliyor), Luminor (Cloudflare tum otomasyonu blokluyor, asmayiz).
 * ───────────────────────────────────────────────────────────────────────── */

const DEPOSIT_TERMS = [1, 3, 6, 9, 12, 18, 24, 36, 48, 60];
const DEPOSIT_BAND = [0.5, 6]; // < 0.5 genelde "< 1 month 0.10" / USD 0.00 satirlari

const DEPOSIT_BANKS = [
  { bankId: 'lhv',         url: 'https://www.lhv.ee/en/fixed-term-deposit', waitMs: 3000 },
  { bankId: 'coop',        url: 'https://www.cooppank.ee/en/private/growing-funds/deposit-interests', waitMs: 3000 },
  // SEB hesaplayicisi oranlari DOM'a degil bir CSV'den okuyor ("gun; oran" satirlari);
  // headless tarayicida hesaplayici render olmuyor (innerText bos). Sayfanin kendi
  // kullandigi dosyayi okuyoruz. robots.txt: /sites/default/files/ icin hem Disallow
  // hem Allow var — RFC 9309'a gore esit uzunlukta cakismada Allow kazanir (izinli).
  // 2026-09-13 dogrulamasi: CSV degerleri sayfadaki hesaplayici tablosuyla birebir.
  { bankId: 'seb',         url: 'https://www.seb.ee/en/private/savings-and-investments/savings/term-deposit',
    csvUrl: 'https://www.seb.ee/sites/default/files/calc/intress/eur-privi.csv' },
  { bankId: 'inbank',      url: 'https://www.inbank.ee/en/deposit', waitMs: 5000 },
  // SPA; ilk tablo EUR, ardindan USD/GBP/SEK/NOK/CAD — ilk-eslesme-kazanir bunu cozer
  { bankId: 'swedbank',    url: 'https://www.swedbank.ee/private/home/more/pricesrates/interests?language=ENG', waitMs: 8000 },
  // Ilk tablo vade-sonu faiz; ikinci tablo aylik odeme (daha dusuk) — ilk kazanir
  { bankId: 'citadele-ee', url: 'https://www.citadele.ee/en/private/savings/rates/', waitMs: 4000 },
];

// Satir basinda vade etiketi: "12 months", "12-17months", "60-months", "1 y.", "1.5 y.", "3 kuud"
const TERM_LINE = /^\s*(\d{1,3}(?:[.,]5)?)\.?\s*(?:[-–]\s*(\d{1,3}))?\s*-?\s*(months?|mo\.?|m\.|kuud?|kuu|years?|y\.|aastat?)(?![a-z])/i;
// Yatay tablo baslik hucresi: "1 m." / "9. m." / "1.5 y." / "12 months"
const TERM_CELL = /^(\d{1,3}(?:[.,]5)?)\.?\s*(months?|m\.|kuud?|years?|y\.|aastat?)$/i;

function cellToMonths(cell) {
  const m = TERM_CELL.exec(cell.trim());
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  return Math.round(/^(y|year|aasta)/i.test(m[2]) ? n * 12 : n);
}
const FIRST_DECIMAL = /(\d{1,2}[.,]\d{1,3})\s*%?/;

/** Sayfa metninden vade->oran haritasi. Bulunamazsa bos obje. */
function extractDepositRates(text) {
  const rates = {};
  const used = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\s+/g, ' ').trim();
    if (!line || line.includes('<')) continue; // "< 1 month 0.10" gecelik/kisa vade satiri
    const m = TERM_LINE.exec(line);
    if (!m) continue;

    const a = parseFloat(m[1].replace(',', '.'));
    const b = m[2] ? parseFloat(m[2]) : null;
    const isYear = /^(y|year|aasta)/i.test(m[3]);
    const from = Math.round(isYear ? a * 12 : a);
    const to = b != null ? Math.round(isYear ? b * 12 : b) : from;

    const rest = line.slice(m[0].length);
    const r = FIRST_DECIMAL.exec(rest);
    if (!r) continue;
    const value = parseFloat(r[1].replace(',', '.'));
    if (!Number.isFinite(value) || value < DEPOSIT_BAND[0] || value > DEPOSIT_BAND[1]) continue;

    let hit = false;
    for (const t of DEPOSIT_TERMS) {
      if (t >= from && t <= to && rates[t] == null) {
        rates[t] = value;
        hit = true;
      }
    }
    if (hit) used.push(line.slice(0, 60));
  }

  // YATAY TABLO (Citadele): baslik satirinda vadeler, alttaki "100 EUR" satirinda oranlar.
  // Masaustunde dikey kopya gizli oldugu icin innerText yalnizca yatayi goruyor.
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const cells = lines[i].split('\t');
    if (cells.length < 4) continue;
    const terms = cells.map((c) => cellToMonths(c));
    if (terms.filter((t) => t != null).length < 3) continue;
    // Baslik bulundu — ilk EUR satirini ara (en fazla 3 satir asagida)
    for (let j = i + 1; j <= i + 3 && j < lines.length; j++) {
      const vals = lines[j].split('\t');
      if (vals.length !== cells.length || !/EUR/i.test(vals[0])) continue;
      for (let k = 0; k < cells.length; k++) {
        const t = terms[k];
        if (t == null || !DEPOSIT_TERMS.includes(t) || rates[t] != null) continue;
        const r = FIRST_DECIMAL.exec(vals[k]);
        if (!r) continue;
        const v = parseFloat(r[1].replace(',', '.'));
        if (v >= DEPOSIT_BAND[0] && v <= DEPOSIT_BAND[1]) rates[t] = v;
      }
      used.push(lines[j].replace(/\s+/g, ' ').slice(0, 80));
      break;
    }
    if (Object.keys(rates).length >= 4) break; // ilk (vade-sonu) tablo yeterli
  }

  return { rates, snippet: used.slice(0, 12).join(' | ') };
}

/** SEB tipi "gun; oran" CSV. Yalnizca standart gun sayilari kanonik vadeye eslenir. */
const DAYS_TO_TERM = { 30: 1, 90: 3, 180: 6, 270: 9, 365: 12, 545: 18, 548: 18, 730: 24, 1095: 36, 1460: 48, 1825: 60 };
function parseDaysCsv(body) {
  const rates = {};
  const used = [];
  for (const line of body.split(/\r?\n/)) {
    const m = /^\s*(\d{1,4})\s*;\s*(\d{1,2}[.,]\d{1,3})\s*$/.exec(line);
    if (!m) continue;
    const term = DAYS_TO_TERM[Number(m[1])];
    const v = parseFloat(m[2].replace(',', '.'));
    if (!term || v < DEPOSIT_BAND[0] || v > DEPOSIT_BAND[1] || rates[term] != null) continue;
    rates[term] = v;
    used.push(line.trim());
  }
  return { rates, snippet: used.join(' | ') };
}

/** 12 ay dahil en az 4 vade yoksa sayfa yanlis/degismis kabul edilir */
function depositParseOk(rates) {
  return Object.keys(rates).length >= 4 && rates[12] != null;
}

const MIN_AMOUNT = /minimum(?:\s+(?:term\s+)?deposit)?(?:\s+amount)?(?:\s+is)?[^\d€]{0,20}(?:€\s*)?(\d{2,6})\s*(?:€|EUR|eur)/i;

const RATE_PATTERNS = [
  /interest(?:\s+rate)?[^%\d]{0,80}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
  /intress[^%\d]{0,80}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
  /(?:from|alates)\s+(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
];

// SADECE marginPlusEuribor hedeflerinde eklenir: "(margin 1.8% + six-month EURIBOR)"
// yapısında toplam örnek oran band dışı kalınca marjın kendisini yakalar (Citadele EE)
const MARGIN_PATTERN = /margin(?:aal)?[^%\d]{0,40}?(\d{1,2}(?:[.,]\d{1,3})?)\s*%/i;

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
      // Ücret kontrolü CÜMLE SEGMENTİ bazlı: sabit ±60 pencere komşu cümledeki
      // "fees." kelimesini görüp gerçek oranı eliyordu (Swedbank 2026-07-19).
      // Segment = eşleşmeyi içeren cümle/satır — fee kelimesi ancak aynı
      // cümledeyse bu % bir ücrettir.
      const segStart = Math.max(
        text.lastIndexOf('.', idx), text.lastIndexOf('\n', idx),
        text.lastIndexOf('!', idx), text.lastIndexOf('?', idx),
      ) + 1;
      const endOf = m[0].length + idx;
      const segEnds = ['.', '\n', '!', '?']
        .map((c) => text.indexOf(c, endOf))
        .filter((x) => x !== -1);
      const segEnd = segEnds.length ? Math.min(...segEnds) : endOf + 60;
      const segment = text.slice(segStart, segEnd);
      if (FEE_WORDS.test(segment)) continue;
      // "Euribor ... 2.69%" alıntısı (sayıdan ÖNCE euribor) faiz tabanı değildir;
      // marj metinlerinde euribor sayıdan SONRA gelir ("1.35% + Euribor")
      if (/euribor/i.test(text.slice(Math.max(segStart, idx - 30), idx))) continue;
      const value = parseFloat(m[1].replace(',', '.'));
      if (!Number.isFinite(value) || value < band[0] || value > band[1]) continue;
      const snippet = text.slice(Math.max(0, idx - 60), endOf + 60).replace(/\s+/g, ' ').trim();
      return { value, snippet };
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

async function insertDepositRow(url, key, row) {
  const res = await fetch(`${url}/rest/v1/scraped_deposit_rates`, {
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
    throw new Error(`Supabase deposit insert: HTTP ${res.status} — ${await res.text()}`);
  }
}

async function scrapeDeposits(page, url, key, dryRun) {
  let ok = 0;
  for (const bank of DEPOSIT_BANKS) {
    try {
      console.log(`[scraper] deposit/${bank.bankId} → ${bank.csvUrl ?? bank.url}`);
      let text;
      let parsed;
      if (bank.csvUrl) {
        // Dogrudan cekim her yoldan kesiliyor: Node fetch "fetch failed",
        // page.request "ECONNRESET" (WAF tarayici disi TLS'i reddediyor), goto ise
        // dosyayi indirme olarak aciyor. Calisan tek yol: urun sayfasini acmak ve
        // SAYFANIN KENDI yaptigi CSV istegini dinlemek — bir ziyaretcinin
        // tarayicisinin yuklediginden fazlasini istemiyoruz.
        const csvName = bank.csvUrl.split('/').pop();
        const csvResponse = page.waitForResponse(
          (r) => r.url().includes(csvName) && r.status() < 400,
          { timeout: 45_000 },
        );
        await page.goto(bank.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        const resp = await csvResponse;
        text = await resp.text();
        parsed = parseDaysCsv(text);
      } else {
        const resp = await page.goto(bank.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        if (resp && resp.status() >= 400) throw new Error(`HTTP ${resp.status()} — URL degismis olabilir`);
        await page.waitForTimeout(bank.waitMs ?? 3000);
        text = await page.evaluate(() => document.body.innerText);
        parsed = extractDepositRates(text);
      }

      const { rates, snippet } = parsed;
      const parseOk = depositParseOk(rates);
      const minM = bank.csvUrl ? null : MIN_AMOUNT.exec(text);
      const minAmount = minM ? Number(minM[1]) : null;

      if (!dryRun) {
        await insertDepositRow(url, key, {
          bank_id: bank.bankId,
          rates,
          min_amount: minAmount,
          source_url: bank.url,
          raw_snippet: parseOk ? snippet : text.slice(0, 400),
          parse_ok: parseOk,
        });
      }

      if (parseOk) {
        ok++;
        console.log(`[scraper] OK — ${JSON.stringify(rates)}${minAmount ? ` (min ${minAmount} EUR)` : ''}`);
      } else {
        console.warn(`[scraper] DEPOSIT PARSE FAILED — ${Object.keys(rates).length} vade bulundu, 12 ay: ${rates[12] ?? 'yok'}`);
      }
    } catch (err) {
      console.error(`[scraper] ERROR deposit/${bank.bankId}:`, err instanceof Error ? err.message : err);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { ok, total: DEPOSIT_BANKS.length };
}


/* ───────────────── ISVEC KONUT KREDISI (listränta) ─────────────────
 * Isvec bankalari iki tablo yayinlar: "snittränta" (musterilerin GECMISTE aldigi
 * ortalama) ve "listränta" (ilan edilen fiyat). Ikisini karistirmak ilan edilen
 * fiyati oldugundan dusuk gosterir; bu yuzden YALNIZ listränta alinir, bulunamazsa
 * parse_ok=false yazilir (tahmin yok). Oranlar SEK, tam nominal (marj+Euribor degil).
 * robots.txt 2026-09-18'de kontrol edildi: bu yollar tum UA'lara acik.
 */
const SE_MORTGAGE_BANKS = [
  { bankId: 'sbab-se',            url: 'https://www.sbab.se/1/privat/vara_rantor.html', waitMs: 6000 },
  { bankId: 'nordea-se',          url: 'https://www.nordea.se/privat/produkter/bolan/bolanerantor.html', waitMs: 6000 },
  { bankId: 'swedbank-se',        url: 'https://www.swedbank.se/privat/boende-och-bolan/bolanerantor.html', waitMs: 8000 },
  { bankId: 'lansforsakringar-se', url: 'https://www.lansforsakringar.se/privat/bank/bolan/bolaneranta/', waitMs: 8000 },
  // skandia-se: 403 — otomatik erisim engelli (2026-09-22), eklenmedi
];

/* Isvec tablolari iki sutun tasiyabilir: "Snittranta" (musterilerin gecmiste aldigi
 * ortalama) ve "Listranta" (ilan edilen fiyat). Swedbank ikisini AYNI satirda verir
 * ("3 manader\t2,70 %\t3,89 %") — ilk yuzdeyi almak ilan edilen fiyat yerine
 * ortalamayi basar. Bu yuzden sutun tablo BASLIGINDAN secilir. L&F liste tablosunun
 * basliginda "Listranta" yazmaz ama ustundeki bolum basligi "Listrantor" der; orada
 * degisim sutunu isaretli (+0,25 %) oldugu icin isaretsiz ilk yuzde alinir.
 */
const SE_SECTION_LIST = /listr[åa]nt|listpris/i;
const SE_SECTION_AVG = /snittr[åa]nt|genomsnittlig/i;
const SE_HEADER = /bindningstid/i;
const SE_ROW = /^(\d{1,2})\s*(m[åa]n(?:ader)?|[åa]r)\b/i;
const SE_PCT_PLAIN = /^(\d{1,2}[,.]\d{1,2})\s*%$/;
const SE_PCT_SIGNED = /^[+\u2212-]\s*\d{1,2}[,.]\d{1,2}\s*%$/;

function extractSeListRates(text) {
  const lines = text.split('\n').map((l) => l.replace(/\u00a0/g, ' ').trimEnd());
  let section = null;      // 'list' | 'avg'
  let listColIdx = null;   // baslikta listranta sutununun indeksi (terim sutunu haric)
  const terms = {};

  for (const line of lines) {
    const cells = line.split('\t').map((c) => c.trim()).filter((c) => c !== '');

    // Vade ile baslamayan satir = baslik/aciklama
    if (!SE_ROW.test(cells[0] ?? '')) {
      if (SE_HEADER.test(line)) {
        const cols = cells.slice(1);
        const i = cols.findIndex((c) => SE_SECTION_LIST.test(c));
        listColIdx = i >= 0 ? i : null;
        if (i >= 0) section = 'list';
        else if (cols.some((c) => SE_SECTION_AVG.test(c))) section = 'avg';
        continue;
      }
      if (SE_SECTION_LIST.test(line) && !SE_SECTION_AVG.test(line)) { section = 'list'; listColIdx = null; }
      else if (SE_SECTION_AVG.test(line) && !SE_SECTION_LIST.test(line)) { section = 'avg'; listColIdx = null; }
      continue;
    }

    if (section !== 'list') continue;
    const m = SE_ROW.exec(cells[0]);
    const n = parseInt(m[1], 10);
    const months = /[åa]r/i.test(m[2]) ? n * 12 : n;
    if (months < 1 || months > 180) continue;

    const values = cells.slice(1);
    const raw = (listColIdx != null && values[listColIdx])
      ? values[listColIdx]
      : values.find((v) => SE_PCT_PLAIN.test(v) && !SE_PCT_SIGNED.test(v));
    if (!raw) continue;
    const pm = SE_PCT_PLAIN.exec(raw);
    if (!pm) continue;
    const rate = parseFloat(pm[1].replace(',', '.'));
    if (!Number.isFinite(rate) || rate < 0.5 || rate > 15) continue;
    if (terms[months] == null) terms[months] = rate;
  }

  const keys = Object.keys(terms).map(Number).sort((a, b) => a - b);
  if (keys.length < 3) return null; // tek satir tablo bulundugunu kanitlamaz
  return {
    min: Math.min(...keys.map((k) => terms[k])),
    snippet: 'listranta (SEK) ' + keys.map((k) => `${k}m ${terms[k]}%`).join(' / '),
  };
}

async function scrapeSeMortgages(browser, url, key, dryRun) {
  // Isvec siteleri dil/pazar secimine gore farkli sablon veriyor: en-GB sekmesinde
  // oran tablolari hic basilmiyordu (Swedbank, L&F — 2026-09-22). Ayri sv-SE sekmesi.
  const page = await browser.newPage({ locale: "sv-SE" });
  let ok = 0;
  for (const bank of SE_MORTGAGE_BANKS) {
    try {
      console.log(`[scraper] ${bank.bankId}/mortgage → ${bank.url}`);
      // networkidle: tablolar JS ile sonradan basiliyor (domcontentloaded'da bos)
      const resp = await page.goto(bank.url, { waitUntil: 'networkidle', timeout: 60_000 });
      if (resp && resp.status() >= 400) throw new Error(`HTTP ${resp.status()}`);
      await page.waitForTimeout(bank.waitMs ?? 6000);
      const text = await page.evaluate(() => document.body.innerText);
      const r = extractSeListRates(text);

      if (!dryRun) {
        await insertRow(url, key, {
          bank_id:      bank.bankId,
          product_type: 'mortgage',
          rate_min:     r?.min ?? null,
          aprc:         null,
          source_url:   bank.url,
          raw_snippet:  r?.snippet ?? text.slice(0, 300),
          parse_ok:     r !== null,
        });
      }

      if (r) {
        ok++;
        console.log(`[scraper] OK — ${bank.bankId} list rate from ${r.min}% | ${r.snippet.slice(0, 110)}`);
      } else {
        console.warn(`[scraper] PARSE FAILED — ${bank.bankId}: listränta tablosu bulunamadi`);
      }
    } catch (err) {
      console.error(`[scraper] ERROR ${bank.bankId}/mortgage:`, err instanceof Error ? err.message : err);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  await page.close();
  return { ok, total: SE_MORTGAGE_BANKS.length };
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

  // --deposits-only / --se-only: tek grubu manuel calistirmak icin
  const depositsOnly = process.argv.includes('--deposits-only');
  const seOnly = process.argv.includes('--se-only');

  for (const bank of (depositsOnly || seOnly) ? [] : BANKS) {
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

        const ratePatterns = target.marginPlusEuribor ? [...RATE_PATTERNS, MARGIN_PATTERN] : RATE_PATTERNS;
        const rate = extract(text, ratePatterns, target.band);
        // aprcBand: sayfada başka ürünün APR örneği varsa (Citadele mortgage
        // sayfasındaki kredi kartı %14.76'sı gibi) yanlış yakalamayı band keser
        const aprc = extract(text, APRC_PATTERNS, target.aprcBand ?? [0.5, 35]);
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

  const se = seOnly || !depositsOnly
    ? await scrapeSeMortgages(browser, url, key, dryRun)
    : { ok: 0, total: 0 };
  const dep = seOnly ? { ok: 0, total: 0 } : await scrapeDeposits(page, url, key, dryRun);

  await browser.close();
  console.log(`[scraper] Done — loans ${total - failures}/${total} OK, SE mortgages ${se.ok}/${se.total} OK, deposits ${dep.ok}/${dep.total} OK`);
  // Tamamen basarisiz kosu = altyapi sorunu (tarayici/ag) -> cron log'da exit 1
  // Tamamen basarisiz kosu = altyapi sorunu. SE grubu henuz olgunlasmadigi icin
  // tek basina exit kodunu belirlemez (kismi basari normal).
  const hardFail = (total > 0 && failures === total) || (!seOnly && dep.total > 0 && dep.ok === 0);
  process.exit(hardFail ? 1 : 0);
}

main();
