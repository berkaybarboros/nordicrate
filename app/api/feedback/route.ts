/**
 * POST /api/feedback — sayfa içi mikro-anket + onboarding geri bildirimi.
 *
 * 2026-09-15: sitede kullanıcıdan geri bildirim toplayan HİÇBİR yüzey yoktu;
 * 124 oturum/ay trafiğin neden dönüşmediğini yalnız tahmin edebiliyorduk.
 * Tablo `user_feedback` — RLS açık, anon policy yok: yazma yalnız burada,
 * service role ile. Okuma /admin'de.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { clampString, enforceRateLimit, isLikelyBot, isValidEmail } from '@/lib/security';

const KINDS = new Set(['page_helpful', 'missing', 'onboarding', 'general']);

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'feedback', 6);
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

  const kind = typeof body.kind === 'string' && KINDS.has(body.kind) ? body.kind : null;
  const page = clampString(body.page, 200);
  if (!kind || !page || !page.startsWith('/')) {
    return NextResponse.json({ message: 'kind and page are required.' }, { status: 400 });
  }

  const message = clampString(body.message, 1000)?.trim() || null;
  const helpful = typeof body.helpful === 'boolean' ? body.helpful : null;
  if (helpful === null && !message) {
    return NextResponse.json({ message: 'Empty feedback.' }, { status: 400 });
  }
  const email = isValidEmail(body.email) ? body.email.slice(0, 200) : null;

  const client = createSupabaseAdmin();
  if (!client) {
    console.error('[feedback] SUPABASE_SERVICE_ROLE_KEY missing — feedback dropped');
    return NextResponse.json({ ok: true });
  }

  const { error } = await client.from('user_feedback').insert({
    kind,
    page,
    helpful,
    message,
    email,
    session_id: clampString(body.sessionId, 80),
    source: clampString(body.source, 40),
  });
  if (error) console.error('[feedback] insert failed:', error.message);

  return NextResponse.json({ ok: true });
}
