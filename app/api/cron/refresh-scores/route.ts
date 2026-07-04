/**
 * POST /api/cron/refresh-scores
 * VPS cron → gece 02:00 → collaborative_scores tablosunu yeniler.
 * refresh_collaborative_scores() SQL fonksiyonunu çağırır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { safeCompareSecret } from '@/lib/security';
import { createSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createSupabaseServer();
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
