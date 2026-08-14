/**
 * GET /api/cron/rate-digest — Nordic Rate Digest içerik üreticisi.
 *
 * Son 7 günün oran hareketlerini hesaplar (bugün vs ~7 gün önce), EURIBOR
 * yönünü ekler, hazır konu + düz metin gövde döner. n8n bunu çeker, Gmail
 * TASLAĞI oluşturur — gönderim insan onayıyla (outreach akışıyla aynı model).
 *
 * Aynı çıktı sosyal/topluluk postları için de veri kaynağı: "bu hafta ne değişti"
 * sorusunun tek doğru cevabı burada üretilir, elle tablo yazılmaz.
 *
 * Güvenlik: x-cron-secret (timing-safe). Abone listesi ?withRecipients=1 ile.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret } from '@/lib/security';

export const runtime = 'nodejs';

const BANK_LABELS: Record<string, string> = {
  lhv: 'LHV', coop: 'Coop Pank', seb: 'SEB', swedbank: 'Swedbank',
  inbank: 'Inbank', bigbank: 'Bigbank', citadele: 'Citadele (LV)',
  'citadele-ee': 'Citadele (EE)',
};

const TYPE_LABELS: Record<string, string> = {
  personal: 'Personal loan', mortgage: 'Mortgage margin', auto: 'Car loan',
};

interface RateRow {
  bank_id: string;
  product_type: string;
  rate_min: number | string | null;
  scraped_at: string;
}

interface Movement {
  bank: string;
  type: string;
  from: number;
  to: number;
  delta: number;
}

/** Her (banka, tip) için ilk ve son değeri alıp anlamlı hareketleri döner */
function computeMovements(rows: RateRow[]): { movements: Movement[]; current: Movement[] } {
  const series = new Map<string, RateRow[]>();
  for (const r of rows) {
    if (r.rate_min == null) continue;
    const key = `${r.bank_id}:${r.product_type}`;
    if (!series.has(key)) series.set(key, []);
    series.get(key)!.push(r);
  }

  const movements: Movement[] = [];
  const current: Movement[] = [];

  for (const [key, list] of series) {
    // scraped_at artan sırada geliyor (query order)
    const first = Number(list[0].rate_min);
    const last = Number(list[list.length - 1].rate_min);
    if (!Number.isFinite(first) || !Number.isFinite(last)) continue;

    const [bankId, type] = key.split(':');
    const entry: Movement = {
      bank: BANK_LABELS[bankId] ?? bankId,
      type: TYPE_LABELS[type] ?? type,
      from: first,
      to: last,
      delta: Math.round((last - first) * 100) / 100,
    };
    current.push(entry);
    // 0.05 puan altı gürültü — kampanya/yuvarlama farkı, "değişim" demeyiz
    if (Math.abs(entry.delta) >= 0.05) movements.push(entry);
  }

  movements.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  current.sort((a, b) => a.to - b.to);
  return { movements, current };
}

function buildBody(
  movements: Movement[],
  current: Movement[],
  euribor: { rate: number; delta: number | null } | null,
): string {
  const lines: string[] = [];
  lines.push('THE NORDIC RATE DIGEST');
  lines.push('Live bank rates from the Nordics & Baltics — what changed this week.');
  lines.push('');

  if (euribor) {
    const dir = euribor.delta == null ? 'flat'
      : euribor.delta > 0.01 ? `up ${euribor.delta.toFixed(3)} pts`
      : euribor.delta < -0.01 ? `down ${Math.abs(euribor.delta).toFixed(3)} pts`
      : 'flat';
    lines.push(`EURIBOR 6M: ${euribor.rate.toFixed(3)}% (${dir} this week)`);
    lines.push('This is the base for most variable-rate mortgages in EE, LV, LT and FI.');
    lines.push('');
  }

  lines.push('--- RATE MOVES THIS WEEK ---');
  if (movements.length === 0) {
    lines.push('No advertised rate changed by more than 0.05 points this week.');
    lines.push('Stability is also information: nobody is undercutting anyone right now.');
  } else {
    for (const m of movements.slice(0, 6)) {
      const arrow = m.delta < 0 ? 'DOWN' : 'UP';
      lines.push(`${arrow}  ${m.bank} ${m.type}: ${m.from}% -> ${m.to}% (${m.delta > 0 ? '+' : ''}${m.delta})`);
    }
  }
  lines.push('');

  const personal = current.filter((c) => c.type === TYPE_LABELS.personal).slice(0, 5);
  if (personal.length) {
    lines.push('--- LOWEST ADVERTISED PERSONAL LOAN RATES ---');
    for (const p of personal) lines.push(`${p.to}%  ${p.bank}`);
    lines.push('');
  }

  lines.push('Remember: "from X%" is best-case. Your offer depends on income and');
  lines.push('credit history, and contract fees (0-2%) can matter more than the rate');
  lines.push('itself on small amounts.');
  lines.push('');
  lines.push('Compare all offers: https://nordicrate.com/loans?utm_source=newsletter&utm_medium=email&utm_campaign=digest');
  lines.push('How we collect rates: https://nordicrate.com/methodology');
  lines.push('');
  lines.push('You get this because you signed up at nordicrate.com.');
  lines.push('To stop receiving it, reply "unsubscribe" and you are out — no questions.');
  lines.push('NordicRate · info@nordicrate.com');

  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }

  const since = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

  const [ratesRes, euriborRes] = await Promise.all([
    admin
      .from('scraped_rates')
      .select('bank_id, product_type, rate_min, scraped_at')
      .eq('parse_ok', true)
      .gte('scraped_at', since)
      .order('scraped_at', { ascending: true }),
    admin
      .from('rate_snapshots')
      .select('rate, fetched_at')
      .eq('key', 'euribor6m')
      .gte('fetched_at', since)
      .order('fetched_at', { ascending: true }),
  ]);

  if (ratesRes.error) {
    return NextResponse.json({ error: 'Rate query failed' }, { status: 500 });
  }

  const { movements, current } = computeMovements((ratesRes.data ?? []) as RateRow[]);

  let euribor: { rate: number; delta: number | null } | null = null;
  const snaps = euriborRes.data ?? [];
  if (snaps.length > 0) {
    const last = Number(snaps[snaps.length - 1].rate);
    const first = Number(snaps[0].rate);
    if (Number.isFinite(last)) {
      euribor = {
        rate: last,
        delta: Number.isFinite(first) ? Math.round((last - first) * 1000) / 1000 : null,
      };
    }
  }

  // Aboneler: rate_alerts (oran uyarısı) + leads (newsletter/rate-report onaylı)
  let recipients: string[] = [];
  if (req.nextUrl.searchParams.get('withRecipients') === '1') {
    const [alertsRes, leadsRes] = await Promise.all([
      admin.from('rate_alerts').select('email'),
      admin.from('leads').select('email').in('source', ['newsletter', 'rate-report']),
    ]);
    const set = new Set<string>();
    for (const row of [...(alertsRes.data ?? []), ...(leadsRes.data ?? [])]) {
      const e = (row as { email: string | null }).email;
      if (e && e.includes('@')) set.add(e.toLowerCase());
    }
    recipients = Array.from(set);
  }

  const today = new Date().toISOString().slice(0, 10);
  const subject = movements.length
    ? `Nordic Rate Digest — ${movements.length} rate move${movements.length > 1 ? 's' : ''} this week (${today})`
    : `Nordic Rate Digest — rates held steady this week (${today})`;

  return NextResponse.json({
    date: today,
    subject,
    body: buildBody(movements, current, euribor),
    euribor,
    movements,
    lowestPersonal: current.filter((c) => c.type === TYPE_LABELS.personal).slice(0, 5),
    recipientCount: recipients.length,
    recipients,
    // n8n bu bayrağa bakar: 0 abone varken taslak üretmeye gerek yok
    shouldSend: recipients.length > 0,
  });
}
