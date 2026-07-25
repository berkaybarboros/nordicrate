/**
 * GET /api/cron/outreach-targets — n8n Partner Outreach Autopilot besleyicisi.
 * Sıradaki 'pending' hedefleri döner (email'i olan, öncelik sıralı).
 * n8n bunlardan Gmail TASLAĞI üretir — gönderim HER ZAMAN insan onayıyla.
 * Güvenlik: x-cron-secret (timing-safe).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret } from '@/lib/security';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '2') || 2, 5);

  const { data, error } = await admin
    .from('partner_targets')
    .select('id, institution, country, email, email_type, affiliate_program, notes')
    .eq('status', 'pending')
    .not('email', 'is', null)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  return NextResponse.json({ count: data?.length ?? 0, targets: data ?? [] });
}
