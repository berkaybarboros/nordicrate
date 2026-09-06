/**
 * /api/cron/social-queue — LinkedIn otomatik paylaşım kuyruğu.
 *
 * GET  → paylaşılmamış EN yazılardan en yenisini döner (published_at desc).
 *        Kuyruk boşsa { empty: true } döner ve n8n zinciri sessizce durur.
 * POST → { slug } gelen yazıyı paylaşıldı olarak damgalar (shared_linkedin_at).
 *
 * Neden ayrı bir damga kolonu: önceki draft-only workflow "8 günden eski yazıyı
 * paylaşma" heuristiğine dayanıyordu. Haftada birden fazla çalışan bir yayıncıda
 * bu aynı yazıyı iki kez paylaşır. Damga, duplicate'i kesin olarak önler ve
 * arşivdeki yazıların da sırayla dağıtılmasını sağlar.
 *
 * Güvenlik: x-cron-secret (timing-safe).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret, clampString } from '@/lib/security';

export const runtime = 'nodejs';

function unauthorized(req: NextRequest): boolean {
  return !safeCompareSecret(req.headers.get('x-cron-secret'), process.env.CRON_SECRET);
}

export async function GET(req: NextRequest) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }

  const { data, error } = await admin
    .from('blog_posts')
    .select('slug, title, description, content_md, tags, published_at')
    .eq('status', 'published')
    .eq('locale', 'en')
    .is('shared_linkedin_at', null)
    .order('published_at', { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  const post = (data ?? [])[0] as
    | { slug: string; title: string; description: string; content_md: string; tags: string[] | null; published_at: string }
    | undefined;

  if (!post) {
    return NextResponse.json({ empty: true, message: 'Paylasilmamis yazi kalmadi' });
  }

  // Kaç yazı kuyrukta kaldı — n8n loglarında görünürlük için
  const { count } = await admin
    .from('blog_posts')
    .select('slug', { count: 'exact', head: true })
    .eq('status', 'published')
    .eq('locale', 'en')
    .is('shared_linkedin_at', null);

  const url = `https://nordicrate.com/blog/${post.slug}`;
  const ageDays = Math.floor((Date.now() - new Date(post.published_at).getTime()) / 86_400_000);

  return NextResponse.json({
    empty: false,
    remaining: count ?? null,
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: (post.tags ?? []).join(', '),
    // Gemini'ye tam makale gerekmez; ilk bölüm hook ve sayılar için yeterli
    content: String(post.content_md ?? '').slice(0, 3500),
    shareUrl: `${url}?utm_source=linkedin&utm_medium=social&utm_campaign=${post.slug}`,
    // Arşivden gelen yazıyı "yeni yayınlandı" diye duyurmamak için
    ageDays,
    isFresh: ageDays <= 8,
  });
}

export async function POST(req: NextRequest) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as { slug?: unknown };
  const slug = clampString(body.slug, 200);
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('blog_posts')
    .update({ shared_linkedin_at: new Date().toISOString() })
    .eq('slug', slug)
    .is('shared_linkedin_at', null) // yarış koruması: iki koşu aynı yazıyı damgalamasın
    .select('slug')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
  if (!data) {
    // Zaten damgalıysa 409 — n8n bunu "duplicate, atla" olarak görür
    return NextResponse.json({ error: 'Already shared or slug not found', slug }, { status: 409 });
  }

  return NextResponse.json({ ok: true, slug });
}
