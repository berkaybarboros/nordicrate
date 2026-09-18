/**
 * GET /api/cron/founder-facts — basvuru formlari icin tek dogru rakam kaynagi.
 * Hesap lib/founder-facts.ts'te; /api/cron/applications ayni fonksiyonu cagirir.
 * Guvenlik: x-cron-secret (timing-safe). Kisisel veri donmez.
 */

import { NextRequest, NextResponse } from 'next/server';
import { safeCompareSecret } from '@/lib/security';
import { computeFounderFacts } from '@/lib/founder-facts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!safeCompareSecret(req.headers.get('x-cron-secret'), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await computeFounderFacts());
}
