/**
 * POST /api/cron/generate-embeddings
 * Gece 03:00 çalışır. embedding_jobs kuyruğundaki pending user'ları işler.
 *
 * Akış:
 *  1. embedding_jobs'tan pending olanları çek (max 50/run)
 *  2. Her user için generate_profile_text() SQL fonksiyonu → metin
 *  3. Gemini text-embedding-004 → vector(768)
 *  4. user_signals.profile_embedding ← UPDATE
 *  5. embedding_jobs.status ← 'done'
 *
 * Gemini text-embedding-004: 768 dim, 1500 req/day free
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const GEMINI_EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';

async function getGeminiEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[embedding] Gemini error:', res.status, err);
      return null;
    }
    const data = await res.json() as { embedding: { values: number[] } };
    return data.embedding?.values ?? null;
  } catch (err) {
    console.error('[embedding] fetch error:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 });
  }

  const supabase = await createSupabaseServer();

  // Pending job'ları çek
  const { data: jobs, error: jobsErr } = await supabase
    .from('embedding_jobs')
    .select('id, user_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50);

  if (jobsErr || !jobs || jobs.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, message: 'No pending jobs' });
  }

  let done = 0;
  let errors = 0;
  const results: string[] = [];

  for (const job of jobs) {
    try {
      // 1. Profile metni oluştur (SQL fonksiyonu)
      const { data: profileText } = await supabase
        .rpc('generate_profile_text', { p_user_id: job.user_id });

      if (!profileText || typeof profileText !== 'string' || profileText.trim().length === 0) {
        await supabase.from('embedding_jobs')
          .update({ status: 'error', error_msg: 'Empty profile text', processed_at: new Date().toISOString() })
          .eq('id', job.id);
        errors++;
        continue;
      }

      // 2. Gemini embedding
      const vector = await getGeminiEmbedding(profileText, apiKey);
      if (!vector || vector.length !== 768) {
        await supabase.from('embedding_jobs')
          .update({ status: 'error', error_msg: `Bad vector: ${vector?.length ?? 0} dims`, processed_at: new Date().toISOString() })
          .eq('id', job.id);
        errors++;
        continue;
      }

      // 3. user_signals'a yaz — PostgreSQL vector format: '[x,y,z,...]'
      const vectorStr = `[${vector.join(',')}]`;
      const { error: updateErr } = await supabase
        .from('user_signals')
        .update({ profile_embedding: vectorStr as unknown as never })
        .eq('user_id', job.user_id);

      if (updateErr) {
        await supabase.from('embedding_jobs')
          .update({ status: 'error', error_msg: updateErr.message, processed_at: new Date().toISOString() })
          .eq('id', job.id);
        errors++;
        continue;
      }

      // 4. Job'u kapat
      await supabase.from('embedding_jobs')
        .update({ status: 'done', processed_at: new Date().toISOString() })
        .eq('id', job.id);

      done++;
      results.push(`${job.user_id.slice(0, 8)}…: "${profileText.slice(0, 60)}…"`);

    } catch (err) {
      await supabase.from('embedding_jobs')
        .update({ status: 'error', error_msg: String(err), processed_at: new Date().toISOString() })
        .eq('id', job.id);
      errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    total: jobs.length,
    processed: done,
    errors,
    samples: results.slice(0, 5),
    timestamp: new Date().toISOString(),
  });
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Kuyruk durumunu göster
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from('embedding_jobs')
    .select('status')
    .order('created_at', { ascending: false })
    .limit(100);

  const counts = (data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ ok: true, queue: counts });
}
