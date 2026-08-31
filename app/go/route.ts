/**
 * GET /go?u=<destUrl>&i=<institutionId>&pid=<productId>&pt=<productType>&sid=<sessionId>
 *
 * Affiliate/outbound tıklama gateway'i:
 *  1. Hedefi allowlist'e karşı doğrula → open-redirect koruması
 *  2. Tıklamayı server-side events tablosuna logla (adblock-proof attribution)
 *  3. UTM ekle (ileride Awin deeplink dönüşümü burada tek noktadan yapılır) → 302
 *
 * Not: Awin onaylanınca, isAllowedApplyUrl geçen hedefler için buildUTMLink yerine
 * Awin deeplink sarmalayıcısı çağrılır — çağıran component'ları değiştirmeye gerek kalmaz.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAllowedApplyUrl } from '@/lib/affiliate';
import { buildUTMLink } from '@/lib/utils';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { enforceRateLimit, isValidSessionId, clampString, isLikelyBot } from '@/lib/security';

export const runtime = 'nodejs';

function logClick(params: {
  sessionId: string | null;
  institutionId: string | null;
  productId: string | null;
  productType: string | null;
  dest: string;
  referer: string | null;
}): void {
  const admin = createSupabaseAdmin();
  if (!admin) return; // service key yoksa sessizce geç (client tracker devrede)

  // Fire-and-forget — redirect'i bekletme
  admin
    .from('events')
    .insert({
      session_id:   params.sessionId ?? `go-${Date.now()}`,
      event_type:   'apply_click',
      page:         params.referer,
      product_id:   params.productId,
      product_type: params.productType,
      metadata: {
        institution: params.institutionId,
        dest_host:   safeHost(params.dest),
        via:         'go_gateway',
      },
    })
    .then(({ error }) => {
      if (error) console.error('[go] event log failed:', error.message);
    });
}

function safeHost(u: string): string | null {
  try { return new URL(u).hostname; } catch { return null; }
}

export function GET(req: NextRequest) {
  // Gateway abuse koruması — allowlist zaten var ama scanner'ları da yavaşlat
  const limited = enforceRateLimit(req, 'go', 120);
  if (limited) return limited;

  const sp = req.nextUrl.searchParams;
  const dest = sp.get('u');

  // Geçersiz/izinsiz hedef → ana sayfaya güvenli düşüş (asla arbitrary redirect).
  // DİKKAT: req.url proxy arkasında localhost:3001 — fallback MUTLAKA public base URL
  // (SEO audit 2026-07-25: /go, localhost:3001'e 302 atıyordu)
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nordicrate.com';
  if (!dest || !isAllowedApplyUrl(dest)) {
    const res = NextResponse.redirect(new URL('/', BASE), 302);
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  const institutionId = clampString(sp.get('i'), 64);
  const productId     = clampString(sp.get('pid'), 64);
  const productType   = clampString(sp.get('pt'), 32);
  const placement     = clampString(sp.get('pl'), 32);
  const sidRaw        = sp.get('sid');
  const sessionId     = isValidSessionId(sidRaw) ? sidRaw : null;

  // Bot taramalarını LOGLAMA (yönlendirme yine çalışır — amaç engellemek değil,
  // analitiği temiz tutmak). 2026-08-31 denetimi: 949 apply_click kaydının tamamı
  // crawler'dı; admin funnel'ı gerçek dışı bir tıklama oranı gösteriyordu ve bu
  // rakamlar affiliate başvurularında kullanılacaktı.
  // Gerçek ziyaretçi iki iz bırakır: tracker'ın sid'i VEYA kendi sayfamızdan referer.
  const referer = req.headers.get('referer');
  let fromOurSite = false;
  try {
    fromOurSite = !!referer && new URL(referer).hostname === new URL(BASE).hostname;
  } catch { /* bozuk referer → insan kanıtı sayma */ }

  if (!isLikelyBot(req) && (sessionId !== null || fromOurSite)) {
    logClick({
      sessionId,
      institutionId,
      productId,
      productType,
      dest,
      referer,
    });
  }

  // UTM rule set v1 (docs/marketing/utm-ruleset.md) — UTM'ler yalnız burada yazılır
  const finalUrl = buildUTMLink(dest, {
    campaign: productType ?? undefined,
    content:  placement ?? undefined,
    term:     productId ?? undefined,
  });
  const res = NextResponse.redirect(finalUrl, 302);
  res.headers.set('X-Robots-Tag', 'noindex, nofollow'); // redirect endpoint'i indekslenmesin
  return res;
}
