/**
 * Host canonicalization — domain migration için 301 katmanı.
 *
 * Çalışma mantığı:
 * - Canonical host NEXT_PUBLIC_BASE_URL'den türetilir.
 * - SADECE bilinen alias host'lardan gelen istekler canonical'a 301'lenir
 *   (eski subdomain + www). localhost/127.0.0.1 asla yönlendirilmez —
 *   VPS cron'ları localhost:3001'e POST atıyor, onları kırmamalıyız.
 * - Env subdomain'i gösterdiği sürece katman etkisizdir (host === canonical);
 *   cutover'da env nordicrate.com'a çevrilince eski subdomain otomatik 301 olur.
 *   SEO değeri (varsa) yeni domain'e taşınır, eski linkler kırılmaz.
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

// Eski/alternatif host'lar — buradan canonical'a kalıcı yönlendirme yapılır
const LEGACY_HOSTS = new Set(['nordicrate.berkaybarboros.com']);

export function middleware(req: NextRequest) {
  if (!BASE_URL.startsWith('https://')) return NextResponse.next();

  const canonicalHost = new URL(BASE_URL).host;
  const host = (req.headers.get('host') ?? '').toLowerCase();

  if (host === canonicalHost) return NextResponse.next();

  if (LEGACY_HOSTS.has(host) || host === `www.${canonicalHost}`) {
    const target = new URL(req.nextUrl.pathname + req.nextUrl.search, BASE_URL);
    return NextResponse.redirect(target, 301);
  }

  // Bilinmeyen host (localhost, healthcheck, IP) — dokunma
  return NextResponse.next();
}

export const config = {
  // Statik asset'leri middleware'den muaf tut — gereksiz overhead
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)).*)'],
};
