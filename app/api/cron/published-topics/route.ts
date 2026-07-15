/**
 * GET /api/cron/published-topics — n8n blog otomasyonunun "hafızası".
 * Son yayınlanmış EN başlık+slug listesini döner; topic üretici LLM bu listeye
 * bakarak TEKRAR ETMEYEN yeni konu seçer. (Sheets yerine tek kaynak: kendi DB'miz.)
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

  const { data, error } = await admin
    .from('blog_posts')
    .select('title, slug, tags, published_at')
    .eq('locale', 'en')
    .order('published_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  return NextResponse.json({
    count: data?.length ?? 0,
    topics: (data ?? []).map((p) => ({ title: p.title, slug: p.slug, tags: p.tags })),
  });
}
