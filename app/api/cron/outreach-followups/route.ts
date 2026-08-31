/**
 * GET /api/cron/outreach-followups — takip (follow-up) sirasi gelen partnerler.
 *
 * B2B outreach gercegi: ilk mail %5-10 yanit alir, 2 takip bunu 2-3 katina cikarir.
 * v1'de takip YOKTU — gonderilen mail cevapsiz kalinca surec oluyordu.
 *
 * Durum makinesi (yeni kolon gerektirmez, mevcut `status` alani tasir):
 *   pending -> drafted -> contacted -> followup1 -> followup2 -> closed_no_reply
 *   herhangi bir asamada yanit gelirse -> replied (n8n Gmail kontrolu isaretler)
 *
 * Guvenlik: x-cron-secret (timing-safe).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret } from '@/lib/security';

export const runtime = 'nodejs';

/** Ilk mailden sonra 7 gun, ikinci takip icin 10 gun daha bekle */
const WAIT_DAYS: Record<string, number> = { contacted: 7, followup1: 10 };

const NEXT_STATUS: Record<string, string> = { contacted: 'followup1', followup1: 'followup2' };

/** Takip maili tonu — her turda farklilasir, ayni metni tekrarlamaz */
const ANGLE: Record<string, string> = {
  followup1:
    'Second touch, 7+ days after the first email. Keep it under 90 words. Do not repeat the ' +
    'original pitch — add ONE new concrete reason to reply: we already list their products and ' +
    'send them traffic for free, and a data feed would make their listing accurate. Ask a single ' +
    'yes/no question that is easy to answer.',
  followup2:
    'Final touch, 10+ days after the second. Under 60 words. Polite close-out: say this is the ' +
    'last email, leave the door open, and ask them to point us to the right person if they are ' +
    'not the one. No pressure, no guilt, no discount language.',
};

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
    .select('id, institution, country, email, email_type, status, draft_subject, contacted_at, notes')
    .in('status', ['contacted', 'followup1'])
    .not('email', 'is', null)
    .order('priority', { ascending: true })
    .order('contacted_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  const now = Date.now();
  const due = (data ?? [])
    .filter((t) => {
      const row = t as { status: string; contacted_at: string | null };
      if (!row.contacted_at) return false;
      const waited = (now - new Date(row.contacted_at).getTime()) / 86_400_000;
      return waited >= (WAIT_DAYS[row.status] ?? 999);
    })
    .slice(0, limit)
    .map((t) => {
      const row = t as {
        id: string; institution: string; country: string; email: string;
        status: string; draft_subject: string | null; contacted_at: string;
      };
      const emailDomain = row.email.split('@')[1] ?? '';
      return {
        id: row.id,
        institution: row.institution,
        country: row.country,
        email: row.email,
        // n8n once bu domainden yanit var mi diye Gmail'de arar; varsa takip ETMEZ
        replySearchQuery: `from:${emailDomain} newer_than:60d`,
        currentStatus: row.status,
        nextStatus: NEXT_STATUS[row.status],
        originalSubject: row.draft_subject ?? `Partnership inquiry: ${row.institution} and NordicRate`,
        daysSinceContact: Math.floor((now - new Date(row.contacted_at).getTime()) / 86_400_000),
        angle: ANGLE[row.status],
      };
    });

  return NextResponse.json({ count: due.length, followups: due });
}
