/**
 * POST /api/partners — B2B lead formu (CPL partnership + rate report magnet)
 * leads tablosuna source='b2b-partners' | 'rate-report' ile yazar → /admin funnel'da görünür.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/db';
import { enforceRateLimit, isValidEmail, clampString } from '@/lib/security';

export const runtime = 'nodejs';

const ALLOWED_SOURCES = new Set(['b2b-partners', 'rate-report']);
const ALLOWED_TYPES = new Set(['bank', 'broker', 'fintech', 'real-estate', 'media', 'other']);

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'partners', 5);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const email = body.email;
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const source = typeof body.source === 'string' && ALLOWED_SOURCES.has(body.source)
    ? body.source
    : 'b2b-partners';
  const company = clampString(body.company, 120) ?? undefined;
  const partnerType = typeof body.partnerType === 'string' && ALLOWED_TYPES.has(body.partnerType)
    ? body.partnerType
    : undefined;
  const message = clampString(body.message, 1000) ?? undefined;

  const summaryParts = [
    partnerType && `type: ${partnerType}`,
    message && `message: ${message}`,
  ].filter(Boolean);

  const { id, error } = await createLead({
    email,
    name: company,
    mode: 'corporate',
    conversationSummary: summaryParts.join(' | ') || undefined,
    source,
  });

  if (error) {
    console.error('[partners] lead insert failed:', error);
    // Kullanıcıya iç hatayı sızdırma — kabul et, logla
  }

  return NextResponse.json({ ok: true, id: id ?? null });
}
