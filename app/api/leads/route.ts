/**
 * POST /api/leads — lead kaydı (client component'lar buraya POST eder).
 *
 * Neden route: yazma service-role ile yapılmalı (bkz. lib/leads-server.ts),
 * service-role ise client bundle'a giremez. `lib/db.ts` `createLead()` bu
 * route'u çağırır, imzası aynı kaldı.
 *
 * Başarısız yazma 503 döner. Eski davranış — hatayı log'layıp `ok: true` demek —
 * lead kaybını aylarca görünmez yaptı.
 */

import { NextRequest, NextResponse } from 'next/server';
import { insertLead } from '@/lib/leads-server';
import { enforceRateLimit, isValidEmail, clampString, clampNumber } from '@/lib/security';
import type { LeadInput } from '@/lib/db';

export const runtime = 'nodejs';

const MODES = new Set(['personal', 'corporate']);

/** En fazla 20 id, her biri 64 karakter — katalog id'leri bu aralıkta. */
function idList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string' && v.length > 0 && v.length <= 64)
    .slice(0, 20);
}

export async function POST(req: NextRequest) {
  // 5 istek/dk/IP — spam insert koruması, /api/alerts ile aynı
  const limited = enforceRateLimit(req, 'leads', 5);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // E-posta opsiyonel: AI sohbetinden gelen lead'de henüz adres olmayabilir, ama
  // verildiyse geçerli olmalı — çöp adres lead listesini işe yaramaz hale getirir.
  if (body.email !== undefined && body.email !== null && body.email !== '' && !isValidEmail(body.email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const mode = typeof body.mode === 'string' && MODES.has(body.mode)
    ? (body.mode as 'personal' | 'corporate')
    : 'personal';

  const input: LeadInput = {
    email:               isValidEmail(body.email) ? body.email : undefined,
    name:                clampString(body.name, 160) ?? undefined,
    phone:               clampString(body.phone, 40) ?? undefined,
    country:             clampString(body.country, 4) ?? undefined,
    loanType:            clampString(body.loanType, 40) ?? undefined,
    loanAmount:          clampNumber(body.loanAmount, 0, 10_000_000),
    monthlyIncome:       clampNumber(body.monthlyIncome, 0, 1_000_000),
    employmentType:      clampString(body.employmentType, 40) ?? undefined,
    mode,
    businessStage:       clampString(body.businessStage, 40) ?? undefined,
    fundingNeeded:       clampNumber(body.fundingNeeded, 0, 100_000_000),
    sector:              clampString(body.sector, 80) ?? undefined,
    matchedProductIds:   idList(body.matchedProductIds),
    matchedProgramIds:   idList(body.matchedProgramIds),
    conversationSummary: clampString(body.conversationSummary, 4000) ?? undefined,
    source:              clampString(body.source, 60) ?? undefined,
  };

  const { id, error } = await insertLead(input);

  if (error || !id) {
    console.error('[leads] insert failed:', error);
    return NextResponse.json(
      { error: 'Could not save your details. Please try again.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, id });
}
