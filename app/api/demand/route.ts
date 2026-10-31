/**
 * POST /api/demand — "aradı, bulamadı" kaydı.
 *
 * Neden bu endpoint var: /api/feedback 2026-09-15'ten beri açık ve içinde tek bir
 * satır var. Aynı 30 günde 493 oturum, 741 ürün görüntüleme, 219 bankaya tıklama
 * oldu. İnsanlar siteyi kullanıyor ama anket doldurmuyor — ki normal.
 *
 * Burada kullanıcıdan hiçbir şey yazması beklenmiyor: bir filtre sonuç
 * döndürmediğinde ne arandığı kaydedilir. `note` ve `email` varsa bonus.
 * Boş dönen arama hem ürün backlog'u hem de bir bankaya gösterilecek kanıt.
 *
 * Tablo `demand_signals` — RLS açık, anon policy yok; yazma yalnız burada
 * service role ile, okuma /admin'de.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { clampNumber, clampString, enforceRateLimit, isLikelyBot, isValidEmail } from '@/lib/security';

const PRODUCT_TYPES = new Set(['personal', 'car', 'mortgage', 'business', 'deposit', 'insurance']);

export async function POST(req: NextRequest) {
  // Bir oturum birkaç filtre deneyebilir; sinyalin değeri tekrarında değil
  // çeşidinde, o yüzden /api/feedback'ten biraz daha geniş ama yine dar.
  const limited = enforceRateLimit(req, 'demand', 10);
  if (limited) return limited;
  if (isLikelyBot(req)) return NextResponse.json({ ok: true });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== 'object') throw new Error('bad body');
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const page = clampString(body.page, 200);
  if (!page || !page.startsWith('/')) {
    return NextResponse.json({ message: 'page is required.' }, { status: 400 });
  }

  // resultCount olmadan satırın anlamı yok: "boş döndü" mü "doluydu ama kullanıcı
  // yine de yazdı" mı ayırt edemeyiz.
  const resultCount = clampNumber(body.resultCount, 0, 10_000);
  if (resultCount === undefined) {
    return NextResponse.json({ message: 'resultCount is required.' }, { status: 400 });
  }

  const productTypeRaw = clampString(body.productType, 20);
  const productType = productTypeRaw && PRODUCT_TYPES.has(productTypeRaw) ? productTypeRaw : null;

  // Ülke serbest metin değil: iki harf, büyütülmüş. Çöp girerse null.
  const countryRaw = clampString(body.country, 2);
  const country = countryRaw && /^[A-Za-z]{2}$/.test(countryRaw) ? countryRaw.toUpperCase() : null;

  const client = createSupabaseAdmin();
  if (!client) {
    console.error('[demand] SUPABASE_SERVICE_ROLE_KEY missing — signal dropped');
    return NextResponse.json({ ok: true });
  }

  const { error } = await client.from('demand_signals').insert({
    product_type: productType,
    country,
    amount: clampNumber(body.amount, 0, 100_000_000) ?? null,
    term_months: clampNumber(body.termMonths, 0, 600) ?? null,
    result_count: resultCount,
    live_count: clampNumber(body.liveCount, 0, 10_000) ?? null,
    note: clampString(body.note, 500)?.trim() || null,
    email: isValidEmail(body.email) ? body.email.slice(0, 200) : null,
    page,
    session_id: clampString(body.sessionId, 80),
    source: clampString(body.source, 40),
  });
  if (error) console.error('[demand] insert failed:', error.message);

  return NextResponse.json({ ok: true });
}
