/**
 * POST /api/cron/publish-post — n8n blog otomasyonunun yazı bastığı endpoint.
 * Güvenlik: x-cron-secret (timing-safe). Service-role client server'da kalır;
 * n8n hiçbir Supabase key'i görmez.
 *
 * Body: { title, slug?, description, content_md, tags?: string[], locale?: 'en'|'fi'|'et' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret, clampString } from '@/lib/security';

export const runtime = 'nodejs';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äå]/g, 'a').replace(/ö/g, 'o').replace(/[üõ]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = clampString(body.title, 150);
  const description = clampString(body.description, 200);
  const contentMd = clampString(body.content_md, 40_000);
  if (!title || !description || !contentMd || contentMd.length < 500) {
    return NextResponse.json(
      { error: 'title, description and content_md (>=500 chars) required' },
      { status: 400 }
    );
  }

  const slug = slugify(clampString(body.slug, 100) || title);
  if (slug.length < 5) {
    return NextResponse.json({ error: 'Slug too short' }, { status: 400 });
  }

  const locale = body.locale === 'fi' || body.locale === 'et' ? body.locale : 'en';
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === 'string').slice(0, 6).map((t) => t.slice(0, 40))
    : [];

  const { data, error } = await admin
    .from('blog_posts')
    .upsert(
      {
        slug,
        title,
        description,
        content_md: contentMd,
        locale,
        tags,
        status: 'published',
        published_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )
    .select('slug')
    .single();

  if (error) {
    console.error('[publish-post] insert failed:', error.message);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    slug: data?.slug ?? slug,
    url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nordicrate.com'}/blog/${data?.slug ?? slug}`,
  });
}
