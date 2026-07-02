/**
 * lib/admin-auth.ts — Basit token tabanlı admin oturumu.
 *
 * Model: ADMIN_TOKEN env değişkeni tek admin şifresi.
 * Login sonrası cookie'de token'ın SHA-256 hash'i tutulur (raw token asla cookie'ye yazılmaz).
 * Tüm karşılaştırmalar timing-safe.
 */

import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'nr_admin';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Server component / route handler içinden admin oturumunu doğrular. */
export async function isAdminAuthed(): Promise<boolean> {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false; // env yoksa admin panel tamamen kapalı

  const cookieStore = await cookies();
  const sessionHash = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!sessionHash) return false;

  return safeEqual(sessionHash, hashToken(adminToken));
}
