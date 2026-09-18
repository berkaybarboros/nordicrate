/**
 * /api/cron/applications — başvuru otomasyonunun tek veri ucu.
 *
 * GET  → n8n "Application Autopilot" akışının girdisi:
 *        { profile, facts, missing, due[], boilerplate }
 *        - profile:   company_profile tablosundaki sabit şirket bilgileri (form autofill)
 *        - facts:     /api/cron/founder-facts ile aynı canlı rakamlar (elle yazılmaz)
 *        - missing:   profildeki MISSING alanlar — otomasyon bunları hatırlatır
 *        - due[]:     yaklaşan/rolling başvurular + hatırlatma aşaması
 *        - boilerplate: her formda tekrar eden metinler, rakamlar yerleştirilmiş halde
 *
 * POST → akışın geri yazması: durum, taslak doküman linki, üretilen cevaplar,
 *        hatırlatma damgası. (n8n → Gmail taslağı/Docs oluşturur, sonra buraya yazar.)
 *
 * Güvenlik: x-cron-secret (timing-safe). Kişisel veri dönmez.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret, clampString } from '@/lib/security';
import { buildBoilerplate, collectMissing, type CompanyProfile } from '@/lib/company-profile';
import { computeFounderFacts } from '@/lib/founder-facts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAY = 86_400_000;

interface ApplicationRow {
  program: string;
  organisation: string | null;
  url: string | null;
  offer: string | null;
  deadline: string | null;
  deadline_note: string | null;
  cadence: string;
  fit: string;
  fit_reason: string | null;
  requirements: string | null;
  status: string;
  priority: number | null;
  draft_doc_url: string | null;
  draft_answers: unknown;
  last_reminder_at: string | null;
  reminder_stage: string | null;
}

/** Hatırlatma aşaması: son tarihe kalan güne göre. Aynı aşama iki kez gönderilmez. */
function reminderStage(deadline: string | null, cadence: string): string | null {
  if (!deadline) return cadence === 'rolling' ? 'rolling' : null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / DAY);
  if (days < 0) return 'passed';
  if (days <= 2) return 'd2';
  if (days <= 7) return 'd7';
  if (days <= 14) return 'd14';
  if (days <= 30) return 'd30';
  return null;
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = createSupabaseAdmin();
  if (!client) return NextResponse.json({ error: 'service role key missing' }, { status: 500 });

  const [profileRes, appsRes, facts] = await Promise.all([
    client.from('company_profile').select('data').eq('id', 1).single(),
    client
      .from('startup_applications')
      .select(
        'program, organisation, url, offer, deadline, deadline_note, cadence, fit, fit_reason, requirements, status, priority, draft_doc_url, draft_answers, last_reminder_at, reminder_stage',
      )
      .not('status', 'in', '("skipped","rejected","accepted")')
      .order('priority', { ascending: true })
      .limit(200),
    computeFounderFacts().catch((e) => ({ error: e instanceof Error ? e.message : 'facts failed' })),
  ]);

  const profile = ((profileRes.data?.data ?? {}) as CompanyProfile);
  const apps = (appsRes.data ?? []) as ApplicationRow[];

  // Eylem gerektirenler: yaklaşan son tarih, ya da rolling + henüz taslak yok
  const due = apps
    .map((a) => {
      const stage = reminderStage(a.deadline, a.cadence);
      const daysLeft = a.deadline
        ? Math.ceil((new Date(a.deadline).getTime() - Date.now()) / DAY)
        : null;
      const needsDraft = !a.draft_doc_url && a.status !== 'submitted';
      const newStage = stage !== null && stage !== a.reminder_stage;
      return { ...a, stage, daysLeft, needsDraft, actionable: (newStage || needsDraft) && a.fit !== 'not_eligible' };
    })
    .filter((a) => a.actionable);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    profile,
    missing: collectMissing(profile),
    facts,
    boilerplate: buildBoilerplate(profile, facts),
    counts: { tracked: apps.length, actionable: due.length },
    due,
  });
}

interface PostBody {
  program?: string;
  status?: string;
  draftDocUrl?: string;
  draftAnswers?: unknown;
  reminderStage?: string;
  responseNote?: string;
}

const STATUSES = new Set([
  'found', 'qualified', 'drafting', 'ready_for_review', 'submitted',
  'interview', 'accepted', 'rejected', 'skipped',
]);

export async function POST(req: NextRequest) {
  if (!safeCompareSecret(req.headers.get('x-cron-secret'), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const program = clampString(body.program, 200);
  if (!program) return NextResponse.json({ error: 'program required' }, { status: 400 });

  const client = createSupabaseAdmin();
  if (!client) return NextResponse.json({ error: 'service role key missing' }, { status: 500 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status && STATUSES.has(body.status)) patch.status = body.status;
  if (body.draftDocUrl) patch.draft_doc_url = clampString(body.draftDocUrl, 500);
  if (body.draftAnswers !== undefined) patch.draft_answers = body.draftAnswers;
  if (body.responseNote) patch.response_note = clampString(body.responseNote, 2000);
  if (body.reminderStage) {
    patch.reminder_stage = clampString(body.reminderStage, 20);
    patch.last_reminder_at = new Date().toISOString();
  }
  if (body.status === 'submitted') patch.submitted_at = new Date().toISOString();

  const { error } = await client.from('startup_applications').update(patch).eq('program', program);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, program, patched: Object.keys(patch) });
}
