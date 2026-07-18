/**
 * Q3 2026 Nordic & Baltic Rate Report üreticisi.
 * Veri: rate_snapshots haftalık ortalamaları (2026-05-11 → 2026-07-13) + scraper doğrulamaları.
 * Çalıştır: node docs/reports/build-report.mjs → docs/reports/rate-report-2026-q3.html
 * PDF: VPS'te playwright ile render (deploy adımına bak).
 * Tasarım: report-design skill token'ları, NordicRate marka override'ı (accent #2563EB).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Gerçek veri (Supabase rate_snapshots, haftalık ort.) ─────────────────────
const WEEKS = ['May 11','May 18','May 25','Jun 1','Jun 8','Jun 15','Jun 22','Jun 29','Jul 6','Jul 13'];
const SERIES = {
  '3M':  [2.142,2.175,2.175,2.224,2.226,2.226,2.226,2.289,2.339,2.339],
  '6M':  [2.392,2.454,2.454,2.533,2.536,2.536,2.536,2.570,2.596,2.596],
  '12M': [2.642,2.747,2.747,2.802,2.804,2.804,2.804,2.801,2.798,2.798],
};
const COLORS = { '3M': '#2563EB', '6M': '#0891B2', '12M': '#7C3AED' };

// ── SVG çizgi grafiği ────────────────────────────────────────────────────────
const W = 760, H = 340, PAD_L = 60, PAD_R = 90, PAD_T = 24, PAD_B = 44;
const yMin = 2.0, yMax = 3.0;
const x = (i) => PAD_L + (i / (WEEKS.length - 1)) * (W - PAD_L - PAD_R);
const y = (r) => PAD_T + (1 - (r - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

let chart = '';
for (const g of [2.0, 2.25, 2.5, 2.75, 3.0]) {
  chart += `<line x1="${PAD_L}" y1="${y(g).toFixed(1)}" x2="${W - PAD_R}" y2="${y(g).toFixed(1)}" stroke="#E6E9F2" stroke-width="1"/>`;
  chart += `<text x="${PAD_L - 10}" y="${(y(g) + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="#8A97AC">${g.toFixed(2)}%</text>`;
}
WEEKS.forEach((w, i) => {
  if (i % 2 === 0) chart += `<text x="${x(i).toFixed(1)}" y="${H - 14}" text-anchor="middle" font-size="11" fill="#8A97AC">${w}</text>`;
});
for (const [name, vals] of Object.entries(SERIES)) {
  const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  chart += `<polyline points="${pts}" fill="none" stroke="${COLORS[name]}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const last = vals[vals.length - 1];
  chart += `<circle cx="${x(vals.length - 1).toFixed(1)}" cy="${y(last).toFixed(1)}" r="3.5" fill="${COLORS[name]}"/>`;
  chart += `<text x="${(x(vals.length - 1) + 10).toFixed(1)}" y="${(y(last) + 4).toFixed(1)}" font-size="12" font-weight="700" fill="${COLORS[name]}">${name} ${last.toFixed(2)}%</text>`;
}

const foxB64 = fs.readFileSync(path.join(__dirname, '../../public/nordicai-fab.png')).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Nordic &amp; Baltic Rate Report — Q3 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Space Grotesk',Arial,sans-serif; color:#0E1525; background:#fff; font-size:15px; line-height:1.6; }
  .page { width:210mm; min-height:296mm; padding:22mm 20mm; page-break-after:always; position:relative; }
  .page:last-child { page-break-after:auto; }
  .kicker { font-family:'Space Mono',monospace; text-transform:uppercase; letter-spacing:.14em; font-size:12px; color:#2563EB; font-weight:700; }
  h1 { font-size:44px; line-height:1.12; font-weight:700; margin:14px 0 18px; }
  h2 { font-size:26px; font-weight:700; margin:0 0 6px; }
  h3 { font-size:17px; font-weight:700; margin:18px 0 6px; }
  p { color:#475569; margin-bottom:12px; }
  .rule { height:4px; width:64px; background:linear-gradient(90deg,#2563EB,#0891B2); border-radius:2px; margin:10px 0 22px; }
  .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:26px 0; }
  .stat { background:#F6F7FB; border:1px solid #E6E9F2; border-radius:14px; padding:16px 14px; }
  .stat b { display:block; font-size:26px; color:#0E1525; }
  .stat span { font-size:12px; color:#8A97AC; }
  table { width:100%; border-collapse:collapse; margin:14px 0 6px; font-size:13.5px; }
  th { text-align:left; font-family:'Space Mono',monospace; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#8A97AC; padding:8px 10px; border-bottom:2px solid #E6E9F2; }
  td { padding:9px 10px; border-bottom:1px solid #E6E9F2; color:#0E1525; }
  td.mono, .mono { font-family:'Space Mono',monospace; }
  .callout { background:#F6F7FB; border-left:4px solid #2563EB; border-radius:0 12px 12px 0; padding:14px 16px; margin:18px 0; font-size:14px; color:#0E1525; }
  .callout.warn { border-color:#F59E0B; }
  .footnote { font-size:11.5px; color:#8A97AC; margin-top:8px; }
  .footer { position:absolute; bottom:12mm; left:20mm; right:20mm; display:flex; justify-content:space-between; font-family:'Space Mono',monospace; font-size:11px; color:#8A97AC; border-top:1px solid #E6E9F2; padding-top:8px; }
  .cover { display:flex; flex-direction:column; justify-content:center; }
  .cover .fox { width:88px; height:88px; border-radius:50%; border:3px solid #E6E9F2; margin-bottom:26px; }
  .brand { font-weight:700; font-size:20px; } .brand .b { color:#2563EB; }
  .cta { background:#0E1525; color:#fff; border-radius:16px; padding:24px 26px; margin-top:26px; }
  .cta h3 { color:#fff; margin-top:0; } .cta p { color:#94A3B8; font-size:14px; }
  .cta .link { color:#60A5FA; font-weight:700; }
  ul { margin:0 0 12px 18px; color:#475569; } li { margin-bottom:6px; }
</style></head><body>

<!-- SAYFA 1 — KAPAK -->
<div class="page cover">
  <img class="fox" src="data:image/png;base64,${foxB64}" alt="">
  <div class="kicker">Quarterly Market Data · Q3 2026 Edition</div>
  <h1>Nordic &amp; Baltic<br>Rate Report</h1>
  <div class="rule"></div>
  <p style="max-width:520px">Interbank reference rates, verified bank pricing and cross-market
  loan comparison across eight Nordic and Baltic countries — built from NordicRate's live data
  pipeline, not third-party summaries.</p>
  <div class="stat-grid">
    <div class="stat"><b>2.60%</b><span>EURIBOR 6M (Jul 13 wk)</span></div>
    <div class="stat"><b>+20 bp</b><span>3M move, May→Jul</span></div>
    <div class="stat"><b>4.50%</b><span>Norges Bank policy rate</span></div>
    <div class="stat"><b>8 / 60+</b><span>markets / institutions tracked</span></div>
  </div>
  <div class="footer"><span>nordicrate.com</span><span>© 2026 NordicRate — Q3 Rate Report</span></div>
</div>

<!-- SAYFA 2 — EURIBOR TRENDİ -->
<div class="page">
  <div class="kicker">Section 01</div>
  <h2>EURIBOR: the slow climb resumed</h2>
  <div class="rule"></div>
  <p>Weekly averages from our ECB data feed show all three key EURIBOR maturities drifting upward
  through late Q2 and early Q3 2026. The 3-month rate rose from 2.14% (week of May 11) to 2.34%
  (week of Jul 13) — a 20 basis-point move that flows directly into variable-rate loan resets.</p>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="max-width:100%; margin:10px 0">${chart}</svg>
  <div class="callout">
    <b>What this means for borrowers:</b> loans referencing 3M EURIBOR reprice four times a year and
    have already absorbed most of this move. 6M and 12M-referenced mortgages reset later — resets
    landing in H2 2026 will price roughly 15–20 bp above the spring level.
  </div>
  <p>Norway sits apart: Norges Bank's policy rate held at 4.50% through the entire period, keeping
  Norwegian floating mortgage costs materially higher than eurozone equivalents.</p>
  <div class="footer"><span>nordicrate.com</span><span>Source: ECB SDMX + Norges Bank API, weekly averages</span></div>
</div>

<!-- SAYFA 3 — DOĞRULANMIŞ BANKA ORANLARI -->
<div class="page">
  <div class="kicker">Section 02</div>
  <h2>Verified bank pricing: Estonia monitor</h2>
  <div class="rule"></div>
  <p>NordicRate runs automated daily monitoring of published loan pricing on bank websites.
  Figures below were captured directly from each bank's public product pages on <b>18 July 2026</b>.</p>
  <table>
    <tr><th>Bank</th><th>Product</th><th>Published rate</th><th>Effective floor*</th></tr>
    <tr><td>LHV Pank</td><td>Consumer loan</td><td class="mono">from 5.90%</td><td class="mono">5.90%</td></tr>
    <tr><td>LHV Pank</td><td>Home loan (energy class A/B)</td><td class="mono">1.49% + 6M EURIBOR</td><td class="mono">4.09%</td></tr>
    <tr><td>Coop Pank</td><td>Small loan</td><td class="mono">from 7.90%</td><td class="mono">7.90%</td></tr>
    <tr><td>Coop Pank</td><td>Home loan (energy class A)</td><td class="mono">1.49% + 6M EURIBOR</td><td class="mono">4.09%</td></tr>
    <tr><td>Coop Pank</td><td>Car loan</td><td class="mono">from 6.90%</td><td class="mono">6.90%</td></tr>
  </table>
  <p class="footnote">* Effective floor = published margin + 6M EURIBOR (2.60%, Jul 13 week) where the
  bank prices against EURIBOR; otherwise the published "from" rate. Individual pricing depends on the
  applicant's profile. Representative APRC on small consumer loans is substantially higher than the
  nominal rate (Coop Pank's own example calculator shows 22.78% APRC on a small-amount scenario).</p>
  <div class="callout warn">
    <b>The margin illusion:</b> headline mortgage offers like "from 1.49%" are margins, not total
    rates. The real floor today is ~4.1%. Any comparison site displaying the margin as the rate is
    misleading its users — and its partners.
  </div>
  <div class="footer"><span>nordicrate.com</span><span>Automated monitoring, captured 2026-07-18</span></div>
</div>

<!-- SAYFA 4 — ÜLKE KARŞILAŞTIRMASI -->
<div class="page">
  <div class="kicker">Section 03</div>
  <h2>Cross-market comparison</h2>
  <div class="rule"></div>
  <p>Lowest advertised rates currently listed on NordicRate, by market. Estonian figures are
  verified daily by automated monitoring; other markets reflect catalogued bank listings.</p>
  <table>
    <tr><th>Market</th><th>Personal from</th><th>Mortgage from</th><th>Business from</th></tr>
    <tr><td>🇩🇰 Denmark (DKK)</td><td class="mono">6.99% — Danske Bank</td><td class="mono">2.75% — Nykredit</td><td class="mono">4.99% — Danske Bank</td></tr>
    <tr><td>🇫🇮 Finland (EUR)</td><td class="mono">6.50% — OP</td><td class="mono">3.25% — OP</td><td class="mono">4.50% — OP</td></tr>
    <tr><td>🇮🇸 Iceland (ISK)</td><td class="mono">8.90% — Landsbankinn</td><td class="mono">5.25% — Landsbankinn</td><td class="mono">8.00% — Íslandsbanki</td></tr>
    <tr><td>🇳🇴 Norway (NOK)</td><td class="mono">6.90% — DNB</td><td class="mono">3.80% — DNB</td><td class="mono">5.50% — DNB</td></tr>
    <tr><td>🇸🇪 Sweden (SEK)</td><td class="mono">6.49% — Nordea</td><td class="mono">3.50% — SBAB</td><td class="mono">4.75% — SEB</td></tr>
    <tr><td>🇪🇪 Estonia (EUR)†</td><td class="mono">5.90% — LHV</td><td class="mono">4.09% — LHV / Coop</td><td class="mono">6.50% — Swedbank</td></tr>
    <tr><td>🇱🇻 Latvia (EUR)</td><td class="mono">11.00% — Luminor</td><td class="mono">4.75% — Swedbank</td><td class="mono">6.50% — RIB Bank</td></tr>
    <tr><td>🇱🇹 Lithuania (EUR)</td><td class="mono">10.50% — Luminor</td><td class="mono">4.50% — Swedbank</td><td class="mono">6.50% — Swedbank</td></tr>
  </table>
  <p class="footnote">† Estonia: live-verified 2026-07-18. Danish mortgage figure reflects the covered-bond
  (realkredit) system; Icelandic figures are non-indexed nominal rates. Rates are best advertised cases —
  individual offers depend on creditworthiness, amount and term.</p>
  <div class="callout">
    <b>The spread that matters:</b> a eurozone borrower moving from Latvia to Estonia sees the same
    currency and the same EURIBOR — yet a 5-point gap on entry-level personal loan pricing. Cross-border
    rate awareness is worth real money, which is exactly the gap NordicRate exists to close.
  </div>
  <div class="footer"><span>nordicrate.com</span><span>Catalogue snapshot, July 2026</span></div>
</div>

<!-- SAYFA 5 — METODOLOJİ + CTA -->
<div class="page">
  <div class="kicker">Section 04</div>
  <h2>Methodology &amp; about</h2>
  <div class="rule"></div>
  <h3>Data sources</h3>
  <ul>
    <li><b>Reference rates:</b> ECB SDMX API (EURIBOR 3/6/12M) and Norges Bank API, fetched hourly,
    aggregated to weekly averages. 3,300+ observations in the underlying series.</li>
    <li><b>Bank pricing:</b> automated daily capture of published rates from bank product pages,
    with parse-quality controls and a human-readable evidence snippet stored per observation.</li>
    <li><b>Catalogue:</b> 100+ loan and insurance products across 60+ institutions, maintained with
    verify-before-publish policy.</li>
  </ul>
  <h3>Honesty rules</h3>
  <ul>
    <li>Margins are never presented as total rates — EURIBOR-linked offers are shown with the computed floor.</li>
    <li>No invented statistics, ratings or user counts. Everything in this report traces to a source we operate.</li>
    <li>Rates are indicative "best advertised" figures — individual pricing always depends on the applicant.</li>
  </ul>
  <div class="cta">
    <h3>For lenders &amp; brokers</h3>
    <p>NordicRate delivers AI-pre-qualified borrower leads (income, DTI, residency, loan size) across
    8 markets on CPL/CPA terms — and this report's data pipeline is available as a partner feed.</p>
    <p class="link">nordicrate.com/partners · berkaybarboros13@gmail.com</p>
  </div>
  <p class="footnote" style="margin-top:16px">This report is for information only and is not financial
  advice. © 2026 NordicRate. Next edition: Q4 2026.</p>
  <div class="footer"><span>nordicrate.com</span><span>Q3 2026 · v1.0</span></div>
</div>

</body></html>`;

fs.writeFileSync(path.join(__dirname, 'rate-report-2026-q3.html'), html);
console.log('HTML OK:', (html.length / 1024).toFixed(0) + 'KB');
