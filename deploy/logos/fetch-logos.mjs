/**
 * Kurum logo indirici — resmi marka logolarını (apple-touch-icon → favicon fallback)
 * indirir, sharp ile tek tip webp'e sıkıştırır, public/logos/<domain>.webp olarak kaydeder.
 *
 * Neden apple-touch-icon: 180px kare marka ikonu; Google favicon (128) fallback.
 * Neden domain-anahtarlı: hem INSTITUTIONS (lib/data.ts website'ı) hem modal
 * bankaları (data/loans.ts) aynı dosyayı paylaşsın, tekrar indirme olmasın.
 *
 * Çalıştırma (local, kurumsal proxy sertifikası için TLS bypass):
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy/logos/fetch-logos.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', '..', 'public', 'logos');

// INSTITUTIONS (lib/data.ts) + modal bankaları (data/loans.ts, data/insurance.ts) domainleri
const DOMAINS = [
  'www.aktia.fi','www.al-bank.dk','www.arionbanki.is','www.banknorwegian.no','www.bigbank.ee',
  'www.bluorbank.lv','www.citadele.lt','www.citadele.lv','www.cooppank.ee','www.danskebank.dk',
  'www.dnb.no','www.gjensidige.no','www.handelsbanken.fi','www.handelsbanken.se','www.if.fi',
  'www.if.no','www.inbank.ee','www.industra.bank','www.islandsbanki.is','www.jyskebank.dk',
  'www.komplettbank.no','www.kvika.is','www.lahitapiola.fi','www.landsbankinn.is','www.lansforsakringar.se',
  'www.lhv.ee','www.luminor.ee','www.luminor.lt','www.luminor.lv','www.mandatum.fi',
  'www.medbank.lt','www.middelfart-sparekasse.dk','www.nordea.dk','www.nordea.fi','www.nordea.no',
  'www.nordea.se','www.nykredit.dk','www.omasp.fi','www.op.fi','www.pfa.dk',
  'www.resursbank.se','www.revolut.com','www.rib.lv','www.sb.lt','www.sbab.se',
  'www.seb.ee','www.seb.lt','www.seb.lv','www.seb.se','www.skandia.se',
  'www.sparebank1.no','www.sparekassen.dk','www.spron.is','www.storebrand.no','www.swedbank.ee',
  'www.swedbank.lt','www.swedbank.lv','www.swedbank.se','www.topdanmark.dk','www.tryg.dk',
  // modal-only ek bankalar
  'www.credit24.ee','www.ferratum.com','www.bta.ee','www.compensa.ee','www.ergo.ee','www.salva.ee',
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

function fileBase(domain) {
  return domain.replace(/^www\./, '');
}

async function tryFetch(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,image/*,*/*' }, signal: ctrl.signal, redirect: 'follow' });
    return res;
  } catch { return null; }
  finally { clearTimeout(t); }
}

/** Homepage'den en büyük apple-touch-icon / icon URL'sini çıkar */
async function findAppleIcon(domain) {
  const res = await tryFetch(`https://${domain}/`);
  if (!res || !res.ok) return null;
  const html = await res.text();
  const links = [...html.matchAll(/<link[^>]+>/gi)].map(m => m[0]);
  const candidates = [];
  for (const tag of links) {
    const rel = (/rel=["']([^"']+)["']/i.exec(tag) || [])[1] || '';
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1] || '';
    const sizes = (/sizes=["']([^"']+)["']/i.exec(tag) || [])[1] || '';
    if (!href) continue;
    if (/apple-touch-icon|icon/i.test(rel) && /\.(png|svg|jpg|jpeg|webp|ico)/i.test(href)) {
      const size = parseInt(sizes) || (/apple-touch-icon/i.test(rel) ? 180 : 32);
      let abs;
      try { abs = new URL(href, `https://${domain}/`).href; } catch { continue; }
      candidates.push({ abs, size, isApple: /apple-touch-icon/i.test(rel) });
    }
  }
  candidates.sort((a, b) => (b.isApple - a.isApple) || (b.size - a.size));
  return candidates[0]?.abs ?? null;
}

async function fetchImageBuffer(url) {
  const res = await tryFetch(url);
  if (!res || !res.ok) return null;
  const ct = res.headers.get('content-type') || '';
  if (!/image|octet-stream/i.test(ct)) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length > 200 ? buf : null;
}

async function getLogoBuffer(domain) {
  // 1) apple-touch-icon (en kaliteli marka ikonu)
  const appleUrl = await findAppleIcon(domain);
  if (appleUrl) {
    const buf = await fetchImageBuffer(appleUrl);
    if (buf) return { buf, source: 'apple-touch-icon' };
  }
  // 2) /apple-touch-icon.png konvansiyonu
  const conv = await fetchImageBuffer(`https://${domain}/apple-touch-icon.png`);
  if (conv) return { buf: conv, source: 'apple-touch-icon.png' };
  // 3) Google favicon 128 (garantili fallback)
  const g = await fetchImageBuffer(`https://www.google.com/s2/favicons?domain=${fileBase(domain)}&sz=128`);
  if (g) return { buf: g, source: 'google-128' };
  return null;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = {};
  let ok = 0, fail = 0;

  async function toWebp(buf) {
    return sharp(buf, { failOn: 'none', density: 200 }) // density: SVG rasterizasyonu için
      .resize({ height: 96, width: 96, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 82 })
      .toBuffer();
  }

  for (const domain of DOMAINS) {
    const base = fileBase(domain);
    try {
      const result = await getLogoBuffer(domain);
      if (!result) { console.log(`✗ ${base} — no logo`); fail++; manifest[base] = null; continue; }
      // Tek tip: 96px, contain, webp q82.
      let webp, src = result.source;
      try {
        webp = await toWebp(result.buf);
      } catch {
        // apple-touch-icon sharp'ta okunamadı (ICO/bozuk) → Google favicon PNG'ye düş
        const g = await fetchImageBuffer(`https://www.google.com/s2/favicons?domain=${base}&sz=128`);
        if (!g) throw new Error('sharp failed + no google fallback');
        webp = await toWebp(g);
        src = 'google-128 (fallback)';
      }
      await writeFile(join(OUT_DIR, `${base}.webp`), webp);
      const kb = (webp.length / 1024).toFixed(1);
      console.log(`✓ ${base} — ${src} (${kb}kb)`);
      manifest[base] = `/logos/${base}.webp`;
      ok++;
    } catch (e) {
      console.log(`✗ ${base} — ${e.message}`);
      fail++; manifest[base] = null;
    }
  }

  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nDONE: ${ok} ok, ${fail} fail → public/logos/`);
}

main();
