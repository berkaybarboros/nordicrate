/**
 * POST /api/cron/refresh-scores
 * VPS cron → gece 02:00 → collaborative_scores tablosunu yeniler.
 * refresh_collaborative_scores() SQL fonksiyonunu çağırır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { safeCompareSecret } from '@/lib/security';
// RLS denetimi 2026-08-18: bu cron anon key ile yaziyordu, bu yuzden tablolarda
// 'FOR ALL TO public' politikalari acik kalmisti. Artik service_role (RLS bypass).
import { createSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
    const { data, error } = await supabase.rpc('refresh_collaborative_scores');
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      rows_updated: data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/refresh-scores]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, job: 'refresh-scores' });
}
