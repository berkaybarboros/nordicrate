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
import { enforceRateLimit, isValidSessionId, clampString } from '@/lib/security';

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

  // Geçersiz/izinsiz hedef → ana sayfaya güvenli düşüş (asla arbitrary redirect)
  if (!dest || !isAllowedApplyUrl(dest)) {
    return NextResponse.redirect(new URL('/', req.url), 302);
  }

  const institutionId = clampString(sp.get('i'), 64);
  const productId     = clampString(sp.get('pid'), 64);
  const productType   = clampString(sp.get('pt'), 32);
  const sidRaw        = sp.get('sid');
  const sessionId     = isValidSessionId(sidRaw) ? sidRaw : null;

  logClick({
    sessionId,
    institutionId,
    productId,
    productType,
    dest,
    referer: req.headers.get('referer'),
  });

  const finalUrl = buildUTMLink(dest, institutionId ?? 'unknown', productType ?? undefined);
  return NextResponse.redirect(finalUrl, 302);
}
