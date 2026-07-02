/**
 * POST /api/admin/login  — { token } → cookie set
 * DELETE /api/admin/login — logout (cookie sil)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, hashToken, safeEqual } from '@/lib/admin-auth';
import { enforceRateLimit } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Brute-force koruması: 5 deneme/dk/IP
  const limited = enforceRateLimit(req, 'admin-login', 5);
  if (limited) return limited;

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: 'Admin panel not configured' }, { status: 503 });
  }

  let token: unknown;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (typeof token !== 'string' || token.length > 256 || !safeEqual(token, adminToken)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, hashToken(adminToken), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
