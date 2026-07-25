/**
 * POST /api/cron/outreach-mark — n8n taslak oluşturduktan sonra hedefi işaretler.
 * Body: { id, draftSubject } → status='drafted', drafted_at=now.
 * Güvenlik: x-cron-secret (timing-safe).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret, clampString } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }

  const body = await req.json().catch(() => null) as { id?: string; draftSubject?: string } | null;
  if (!body?.id || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { error } = await admin
    .from('partner_targets')
    .update({
      status: 'drafted',
      draft_subject: clampString(body.draftSubject ?? null, 200),
      drafted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .eq('status', 'pending'); // idempotent — yalnızca pending'den geçiş

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
