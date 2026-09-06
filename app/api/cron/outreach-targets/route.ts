/**
 * GET /api/cron/outreach-targets — n8n Partner Outreach Autopilot besleyicisi.
 * Sıradaki hedefleri döner (email'i olan, öncelik sıralı).
 * n8n bunlardan Gmail TASLAĞI üretir — gönderim HER ZAMAN insan onayıyla.
 *
 * ?status=pending (varsayılan) → taslak üretilecek yeni hedefler
 * ?status=drafted             → taslağı hazır, gönderim bekleyenler
 *
 * 'drafted' modu 2026-09-06'da eklendi: zincirde kopuk halka vardı.
 * pending → drafted → [BOŞLUK] → contacted → followup
 * Taslak Gmail'de hazırlanıyor, insan gönderiyor, ama hiçbir şey durumu
 * 'contacted' yapmıyordu. Sonuç: 15 hedef drafted'da takılı kaldı, takip
 * motoru sürekli boş çalıştı ve LHV Pank 49 gün görünmez oldu.
 * Gönderim tespiti workflow'u bu uçtan drafted hedefleri çekip Gmail'in
 * gönderilmiş kutusunda arar; bulursa outreach-status ile contacted'a taşır.
 *
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

  // 'drafted' listesi gönderim tespitinde kullanılıyor ve hepsi taranmalı,
  // o yüzden pending'in dar limiti (taslak üretim hızı) burada geçerli değil.
  const status = req.nextUrl.searchParams.get('status') === 'drafted' ? 'drafted' : 'pending';
  const maxLimit = status === 'drafted' ? 100 : 5;
  const fallback = status === 'drafted' ? 100 : 2;
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? String(fallback)) || fallback, maxLimit);

  const { data, error } = await admin
    .from('partner_targets')
    .select('id, institution, country, email, email_type, affiliate_program, notes, draft_subject')
    .eq('status', status)
    .not('email', 'is', null)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  return NextResponse.json({ status, count: data?.length ?? 0, targets: data ?? [] });
}
