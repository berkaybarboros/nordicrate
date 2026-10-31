/**
 * deploy/scraper/parsers.mjs — bank page text -> numbers.
 *
 * Split out of scrape-rates.mjs so the rules can be tested without Playwright:
 * these functions take a string and return a value, nothing else. The scraper
 * imports them; tests/scraper-parsers.test.ts pins the readings that were wrong
 * once (Swedish list vs average column, Icelandic indexed vs non-indexed).
 */

const DEPOSIT_TERMS = [1, 3, 6, 9, 12, 18, 24, 36, 48, 60];
const DEPOSIT_BAND = [0.5, 6]; // < 0.5 genelde "< 1 month 0.10" / USD 0.00 satirlari

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
  // Letonca: "Procentu likme no 7,9%". APR satiri "Gada procentu likme" ayri desende.
  /(?<!gada )procentu likme no\s+(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
];

// SADECE marginPlusEuribor hedeflerinde eklenir: "(margin 1.8% + six-month EURIBOR)"
// yapısında toplam örnek oran band dışı kalınca marjın kendisini yakalar (Citadele EE)
const MARGIN_PATTERN = /margin(?:aal)?[^%\d]{0,40}?(\d{1,2}(?:[.,]\d{1,3})?)\s*%/i;

const APRC_PATTERNS = [
  /(?:APRC|annual percentage rate(?: of charge)?)[^%\d]{0,120}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
  /krediidi kulukuse m[aä]{1,2}r[^%\d]{0,120}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
  /gada procentu likme[^%\d]{0,40}?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
];

// Faiz yerine ücret/peşinat yakalamayı önler ("Contract fee 2%", "Self-financing from 10%")
// 'service' tek başına DEĞİL ('self-service' legit faiz bağlamı — Coop 2026-07-19)
const FEE_WORDS = /fee|contract|service (?:fee|charge)|tasu|lepingutasu|haldustasu|penalty|viivis|self-financing|omafinantseering|down payment|sissemakse|price of the vehicle|of the loan amount/i;

/**
 * Öncelik sıralı ilk GEÇERLİ eşleşme: pattern öncelik sırasıyla, belge sırasında
 * ilerler; ücret/peşinat penceresi, "Euribor ... X%" alıntısı ve band dışı değerler
 * atlanır. Global-min yaklaşımı başka ürünlerin oranlarını çalıyordu (Coop 3.5
 * regresyonu, 2026-07-19) — belge sırası + band birlikte doğru değeri seçiyor.
 *
 * feeGuard: ücret filtresi yalnız FAİZ ararken doğru. KKM/APRC zaten ücretleri
 * İÇEREN orandır ve bankalar onu hep "lepingutasu … haldustasu … on krediidi
 * kulukuse määr 15,54%" gibi tek cümlelik temsili örnekte yayınlar — filtre o
 * cümleyi ücret sanıp APRC'yi sessizce düşürüyordu (Holm, TF Bank 2026-10-27).
 */
function extract(text, patterns, band = [0.5, 35], { feeGuard = true } = {}) {
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
      if (feeGuard && FEE_WORDS.test(segment)) continue;
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

/* Isvec tablolari iki sutun tasiyabilir: "Snittranta" (musterilerin gecmiste aldigi
 * ortalama) ve "Listranta" (ilan edilen fiyat). Swedbank ikisini AYNI satirda verir
 * ("3 manader\t2,70 %\t3,89 %") — ilk yuzdeyi almak ilan edilen fiyat yerine
 * ortalamayi basar. Bu yuzden sutun tablo BASLIGINDAN secilir. L&F liste tablosunun
 * basliginda "Listranta" yazmaz ama ustundeki bolum basligi "Listrantor" der; orada
 * degisim sutunu isaretli (+0,25 %) oldugu icin isaretsiz ilk yuzde alinir.
 */
const SE_SECTION_LIST = /listr[äåa]nt|listpris/i; // ranta = ä (listränta), ar = å (år)
const SE_SECTION_AVG = /snittr[äåa]nt|genomsnittlig/i;
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

const IS_PCT = /(\d{1,2},\d{1,2})\s*%/g;

function extractIsFixedRates(pdfText, cfg) {
  const start = pdfText.search(cfg.sectionStart);
  if (start < 0) return null;
  const rest = pdfText.slice(start);
  const endRel = rest.slice(1).search(cfg.sectionEnd);
  const section = endRel > 0 ? rest.slice(0, endRel + 1) : rest;

  const line = section.split('\n').find((l) => cfg.rowLabel.test(l));
  if (!line) return null;

  const rates = [...line.matchAll(IS_PCT)]
    .map((m) => parseFloat(m[1].replace(',', '.')))
    .filter((v) => Number.isFinite(v) && v >= 3 && v <= 20);
  if (rates.length < 2) return null; // tek sayi tabloyu bulduguna kanit degil

  return {
    min: Math.min(...rates),
    snippet: `${cfg.note} (ISK): ${rates.map((r) => r + '%').join(' / ')}`,
  };
}


/**
 * Sayfadaki sayının MARJ olduğu ürünler — gösterilecek oran marj + 6 aylık Euribor.
 * `bank_id:product_type`.
 *
 * Bu liste neden var: lib/live-rates.ts eskiden kararı snippet'te "euribor"
 * kelimesi geçip geçmediğine bakarak veriyordu. TF Bank'in sayfasi "Intress on
 * fikseeritud ja Euribori muutus ei suurenda laenumakset" diyor — yani tam
 * TERSİ — ve kod sabit %7,90'a Euribor ekleyip siteye %10,82 bastı. Hangi ürünün
 * marjlı olduğu bir yazım tesadüfü değil, yapılandırma bilgisi; burada duruyor.
 *
 * Yeni marjlı hedef eklerken BURAYA da ekle: tests/scraper-parsers.test.ts bu
 * listeyle lib/live-rates.ts'deki kopyanın aynı olmasını şart koşuyor.
 */
export const MARGIN_PLUS_EURIBOR = new Set([
  'lhv:mortgage',
  'coop:mortgage',
  'seb:mortgage',
  'citadele:mortgage',
  'citadele-ee:mortgage',
]);

export {
  extract,
  extractDepositRates,
  extractSeListRates,
  extractIsFixedRates,
  parseDaysCsv,
  depositParseOk,
  cellToMonths,
  DEPOSIT_TERMS,
  DEPOSIT_BAND,
  RATE_PATTERNS,
  MARGIN_PATTERN,
  APRC_PATTERNS,
  MIN_AMOUNT,
};

/* ─── Kaynak denetimi (source-audit.mjs) ───────────────────────────────────── */

// Kanıt aranacak kelimeler — iddia İngilizce, sayfa yerel dilde. Bu liste yalnız
// "hangi cümleyi rapora alalım" kararını verir; eşleşme doğrulama DEĞİLDİR.
export const EVIDENCE_TERMS = {
  speed: [
    // en
    'instant', 'immediately', 'minute', 'same day', 'same-day', 'within 24', 'working day', 'business day', 'decision',
    // et
    'kohe', 'koheselt', 'minuti', 'sama päev', 'tööpäev', 'otsus', 'vastus',
    // lv
    'uzreiz', 'minūt', 'tās pašas dienas', 'darba dien', 'lēmum',
    // lt
    'iš karto', 'minut', 'tą pačią dieną', 'darbo dien', 'sprendim',
    // fi / sv / da / no / is
    'heti', 'minuu', 'samana päivänä', 'päätös', 'direkt', 'samma dag', 'beslut', 'straks', 'samme dag', 'svar', 'strax', 'samdægurs',
  ],
  fee: [
    // en
    'fee', 'commission', 'charge', 'free of charge', 'no cost',
    // et
    'lepingutasu', 'tasu', 'haldustasu', 'tasuta', 'hinnakiri',
    // lv
    'komisij', 'maksa', 'bez maksas', 'cenrād',
    // lt
    'mokest', 'komisin', 'nemokam', 'įkain',
    // fi / sv / da / no / is
    'palkkio', 'kulu', 'maksuton', 'avgift', 'gebyr', 'gratis', 'kostnad', 'gjald',
  ],
  // Aday kurumun ürün koşulları (oran, tutar, vade) — kataloğa eklemeden önce okunur
  terms: [
    'intress', 'interest', 'krediidi kulukuse', 'annual percentage', 'laenusumma', 'loan amount',
    'limiit', 'periood', 'tähtaeg', 'kuud', 'months', 'hoius', 'deposit',
  ],
};

/** Sayfa metninden, terimlerden birini içeren cümleleri (±160 karakter) çıkarır. */
export function evidenceSnippets(text, terms, max = 6) {
  const flat = text.replace(/\s+/g, ' ');
  const lower = flat.toLowerCase();
  const hits = [];
  for (const term of terms) {
    let from = 0;
    while (hits.length < max * 3) {
      const at = lower.indexOf(term.toLowerCase(), from);
      if (at === -1) break;
      hits.push(at);
      from = at + term.length;
    }
  }
  hits.sort((a, b) => a - b);
  const snippets = [];
  let lastEnd = -1;
  for (const at of hits) {
    const start = Math.max(0, at - 160);
    if (start < lastEnd) continue; // örtüşen pencereleri tekrar yazma
    const end = Math.min(flat.length, at + 160);
    snippets.push(flat.slice(start, end).trim());
    lastEnd = end;
    if (snippets.length >= max) break;
  }
  return snippets;
}


/* ─── Bozulan feed'in kanıtı (scrape-rates.mjs) ────────────────────────────── */

const FAILURE_TERMS = ['%', 'intress', 'interest', 'marginaal', 'margin', 'euribor', 'ränta', 'vextir'];

/**
 * Oran okunamadığında scraped_rates.raw_snippet'e yazılan metin. Eskiden sayfanın ilk
 * 300 karakteri yazılıyordu — çoğu zaman çerez bandı; SSH'sız oturum parser'ı neden
 * bozulduğunu göremiyordu (Bigbank kodulaen, 2026-10-06). Artık oran cümleleri.
 * parse_ok=false satırları latest_scraped_rates'e girmez: canlı orana etkisi yok.
 */
export function failureSnippet(text, max = 1500) {
  const parts = evidenceSnippets(text, FAILURE_TERMS, 8);
  const body = parts.length ? parts.join(' | ') : text.replace(/\s+/g, ' ').trim().slice(0, 600);
  return `[parse failed] ${body}`.slice(0, max);
}

/**
 * HTML'de dosya adı `filePattern`'e uyan PDF linki — mutlak, göreli (href="/..."),
 * ya da JSON içinde kaçışlı (https:\/\/...). Sayfa URL'sine göre çözülür.
 * Bulunamazsa null; `pdfLinks` sayfadaki tüm PDF adlarını hata mesajı için verir.
 */
export function findPdfLink(html, pageUrl, filePattern) {
  const candidates = pdfLinks(html, pageUrl);
  return candidates.find((u) => filePattern.test(u.split(/[?#]/)[0])) ?? null;
}

export function pdfLinks(html, pageUrl) {
  const flat = html.replace(/\\\//g, '/');
  const out = [];
  for (const m of flat.matchAll(/(?:href|src|url)\s*[=:]\s*["']([^"']+?\.pdf(?:\?[^"']*)?)["']|(https?:\/\/[^"'\s<>]+?\.pdf)/gi)) {
    try {
      const u = new URL(m[1] ?? m[2], pageUrl).toString();
      if (!out.includes(u)) out.push(u);
    } catch {
      // bozuk href — atla
    }
  }
  return out;
}

/* ─── fi.ee sicili (source-audit.mjs) ──────────────────────────────────────── */

// İzlenecek kategoriler; sıra rapordaki sıradır. Yalnız kredi kuruluşları ve sigortacılar —
// aracılar/acenteler karşılaştırma kataloğunun konusu değil. `via`: kategori ana sayfada
// link değilse önce açılacak üst sayfa (2026-10-16: "Licensed credit institutions in
// Estonia" ana sayfada başlık olarak görünüyor ama link değil; sigortacılar ise doğrudan
// linkli).
export const REGISTER_CATEGORIES = [
  { key: 'credit', label: /^licensed credit institutions(?: in estonia)?$/i, via: /^credit institutions$/i },
  { key: 'credit-branches', label: /^(?:affiliated )?branches of foreign credit institutions$/i, via: /^credit institutions$/i },
  // Yabancı sigorta şubeleri ayrı kategori değil: "Insurance companies" 1. sayfasında
  // yerli şirketlerle birlikte listeleniyor (2026-10-16 ve 10-24 raporları)
  { key: 'insurance', label: /^insurance companies$/i, via: /^insurance$/i },
];

/** {text, href}[] → bu sayfada linki bulunan kategoriler (href'e göre tekil) */
export function pickRegisterCategories(links, wanted = REGISTER_CATEGORIES) {
  const out = [];
  for (const cat of wanted) {
    const hit = links.find((l) => cat.label.test(l.text.trim()) && !out.some((o) => o.href === l.href));
    if (hit) out.push({ key: cat.key, label: hit.text.trim(), href: hit.href });
  }
  return out;
}

/** Bulunamayan kategoriler için rapora konacak aday linkler */
export function registerCandidateLinks(links, max = 30) {
  const out = [];
  for (const l of links) {
    const text = l.text.trim().replace(/\s+/g, ' ');
    if (!text || text.length > 120 || !/credit|insurance|krediidi|kindlust/i.test(text)) continue;
    if (!out.some((o) => o.text === text)) out.push({ text, href: l.href });
    if (out.length >= max) break;
  }
  return out;
}

// Tüzel kişilik eki — DOM'a değil metne bakar: kurum adı her düzende bu eki taşır.
// Büyük/küçük harf duyarlı: "AS" bir ek, "as" bir kelime.
const LEGAL_FORM = /(?:^|[\s(])(AS|AAS|ADB|UAB|AB|Abp|ASA|A\/S|plc|p\.l\.c\.|SE|Ltd|GmbH|S\.A\.|N\.V\.|AG|Oyj|filiaal|Branch|branch)(?=[\s,.)]|$)/;

/** Kategori sayfasının metninden kurum adları (satır başına bir ad) */
export function registerEntities(text) {
  const out = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.length < 4 || line.length > 120 || /https?:|@|©/.test(line)) continue;
    if (LEGAL_FORM.test(line) && !out.includes(line)) out.push(line);
  }
  return out;
}

/* ─── Aday kurumlar (source-audit.mjs) ─────────────────────────────────────── */

const PRODUCT_LINK = /laen|liising|järelmaks|krediit|hoius|loan|leasing|credit|deposit|card|kaart/i;

/**
 * Aday kurumun ana sayfasından okunacak ürün sayfaları: aynı alan adı, ürün kelimesi
 * içeren link metni, tekil, en çok `max`. URL yapısını cloud'dan göremediğimiz için
 * sayfa yolu tahmin edilmez — sitenin kendi menüsü izlenir.
 */
export function candidateProductLinks(links, homeUrl, max = 4) {
  const home = new URL(homeUrl).hostname.replace(/^www\./, '');
  const out = [];
  for (const l of links) {
    let u;
    try {
      u = new URL(l.href);
    } catch {
      continue;
    }
    const text = l.text.trim().replace(/\s+/g, ' ');
    if (u.hostname.replace(/^www\./, '') !== home || !text || text.length > 60 || !PRODUCT_LINK.test(text)) continue;
    u.hash = '';
    const href = u.toString();
    if (href === homeUrl || out.some((o) => o.href === href)) continue;
    out.push({ text, href });
    if (out.length >= max) break;
  }
  return out;
}
