/**
 * POST /api/cron/outreach-status — outreach durum makinesini ilerletir.
 *
 * Body: { id, status, note? }
 * Izinli gecisler (disinda kalan istek 409 alir — yanlislikla geri sarma olmaz):
 *   drafted    -> contacted | skipped
 *   contacted  -> followup1 | replied
 *   followup1  -> followup2 | replied
 *   followup2  -> closed_no_reply | replied
 *   (replied her asamadan kabul edilir; nihai durum)
 *
 * contacted_at yalnizca ILK gonderimde damgalanir — takip bekleme suresi
 * her zaman ilk temastan degil, SON temastan sayilmali; bu yuzden her gecis
 * contacted_at'i tazeler ama notes'a zincir gecmisi yazilir.
 *
 * Guvenlik: x-cron-secret (timing-safe).
 *
 * DIKKAT: buradaki durum isimleri partner_targets.status uzerindeki CHECK kisiti ile
 * senkron olmali. Ilk surumde degildi — followup1/followup2/closed_no_reply/skipped
 * DB'de yasakti, bu yuzden Gmail taslagi olusuyor ama durum ilerlemiyordu (500) ve
 * her hafta ayni hedefe tekrar taslak uretilecekti. Kisit 2026-08-18 migration'inda
 * genisletildi (partner_targets_followup_statuses). Yeni durum eklerken kisiti da guncelle.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret, clampString } from '@/lib/security';

export const runtime = 'nodejs';

const ALLOWED: Record<string, string[]> = {
  drafted: ['contacted', 'skipped'],
  contacted: ['followup1', 'replied'],
  followup1: ['followup2', 'replied'],
  followup2: ['closed_no_reply', 'replied'],
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: string; status?: string; note?: string }
    | null;
  const id = body?.id;
  const next = body?.status;
  if (!id || !next) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  }

  const { data: rows, error: readErr } = await admin
    .from('partner_targets')
    .select('id, status, notes, institution')
    .eq('id', id)
    .limit(1);

  if (readErr || !rows?.length) {
    return NextResponse.json({ error: 'Target not found' }, { status: 404 });
  }

  const current = (rows[0] as { status: string; notes: string | null; institution: string });
  const permitted = next === 'replied' || (ALLOWED[current.status] ?? []).includes(next);
  if (!permitted) {
    return NextResponse.json(
      { error: `Illegal transition ${current.status} -> ${next}`, current: current.status },
      { status: 409 }
    );
  }

  const stamp = new Date().toISOString();
  const trail = `${stamp.slice(0, 10)} ${current.status}->${next}`;
  const note = clampString(body?.note ?? null, 200);
  const notes = [current.notes, note ? `${trail} (${note})` : trail]
    .filter(Boolean)
    .join(' | ')
    .slice(-1000);

  const patch: Record<string, unknown> = { status: next, notes, updated_at: stamp };
  // Takip beklemesi SON temastan sayilir; replied/closed damgayi tazelemez
  if (['contacted', 'followup1', 'followup2'].includes(next)) patch.contacted_at = stamp;

  const { error } = await admin
    .from('partner_targets')
    .update(patch)
    .eq('id', id)
    .eq('status', current.status); // yarisma korumasi

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, institution: current.institution, from: current.status, to: next });
}
