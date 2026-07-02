/**
 * lib/security.ts — API güvenlik katmanı
 *
 * - Sliding-window rate limiter (in-memory, PM2 cluster'da worker başına ayrı sayaç
 *   → efektif limit = limit × worker sayısı; Groq maliyet koruması için yeterli)
 * - Client IP çözümü (Cloudflare → Nginx → direct sırasıyla)
 * - Input validation helper'ları (email, string cap, chat mesajları)
 */

import { NextResponse } from 'next/server';

// ─── Rate limiter ────────────────────────────────────────────────────────────

interface WindowEntry {
  timestamps: number[];
}

const buckets = new Map<string, WindowEntry>();

// Bellek sızıntısını önle: 10 dakikada bir eski bucket'ları temizle
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of buckets) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * key: `${routeName}:${ip}` gibi unique bir anahtar
 * limit: pencere başına izin verilen istek sayısı
 * windowMs: pencere süresi (default 60sn)
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  let entry = buckets.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    buckets.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { ok: false, remaining: 0, retryAfterSec };
  }

  entry.timestamps.push(now);
  return { ok: true, remaining: limit - entry.timestamps.length, retryAfterSec: 0 };
}

/** Cloudflare → proxy → direct sırasıyla gerçek client IP'yi bulur. */
export function getClientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get('cf-connecting-ip') ??
    h.get('x-real-ip') ??
    h.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}

/** 429 cevabı — Retry-After header'ı ile. */
export function tooManyRequests(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

/**
 * Route başında tek satırda kullanım:
 *   const limited = enforceRateLimit(req, 'chat', 20);
 *   if (limited) return limited;
 */
export function enforceRateLimit(
  req: Request,
  route: string,
  limit: number,
  windowMs = 60_000
): NextResponse | null {
  const ip = getClientIp(req);
  const result = rateLimit(`${route}:${ip}`, limit, windowMs);
  if (!result.ok) return tooManyRequests(result.retryAfterSec);
  return null;
}

// ─── Input validation ────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,24}$/;

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 320 && EMAIL_RE.test(email);
}

/** String'i cap'ler; string değilse null döner. */
export function clampString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

/** Sayıyı doğrular ve aralığa sıkıştırır; geçersizse undefined. */
export function clampNumber(value: unknown, min: number, max: number): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

export interface SafeChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const CHAT_LIMITS = {
  maxMessages: 24,        // sadece son 24 mesaj Groq'a gider
  maxContentLength: 4000, // mesaj başına karakter limiti
} as const;

/**
 * Kullanıcıdan gelen messages array'ini doğrular ve güvenli hale getirir.
 * Geçersiz yapıda null döner.
 */
export function sanitizeChatMessages(input: unknown): SafeChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;

  const recent = input.slice(-CHAT_LIMITS.maxMessages);
  const out: SafeChatMessage[] = [];

  for (const item of recent) {
    if (typeof item !== 'object' || item === null) return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== 'user' && role !== 'assistant') return null;
    if (typeof content !== 'string' || content.length === 0) return null;
    out.push({
      role,
      content: content.length > CHAT_LIMITS.maxContentLength
        ? content.slice(0, CHAT_LIMITS.maxContentLength)
        : content,
    });
  }

  return out;
}

/** sessionId formatını doğrular (tracker.ts formatı: timestamp-rand veya UUID). */
export function isValidSessionId(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 4 && value.length <= 64 && /^[\w-]+$/.test(value);
}
