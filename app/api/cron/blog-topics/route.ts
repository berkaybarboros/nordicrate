/**
 * GET /api/cron/blog-topics — Blog Autopilot'un konu seçicisi.
 *
 * Önceden: LLM konuyu serbest seçiyordu → rastgele trafik.
 * Şimdi: SERP denetimine dayalı havuzdan (lib/blog-topics.ts) sıradaki
 * yayınlanmamış konu döner + LLM'e verilecek yazım brief'i.
 *
 * n8n akışı: bu endpoint → Gemini (brief ile) → /api/cron/publish-post
 * Güvenlik: x-cron-secret (timing-safe).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { safeCompareSecret } from '@/lib/security';
import { nextTopic, BLOG_TOPICS } from '@/lib/blog-topics';

export const runtime = 'nodejs';

function buildBrief(t: NonNullable<ReturnType<typeof nextTopic>>): string {
  return [
    'Write a NordicRate blog post in ENGLISH. NordicRate compares live loan, deposit and',
    'insurance rates across 8 Nordic & Baltic countries; our edge is daily-scraped bank data',
    'and an expat/e-resident perspective that banks and forums do not offer.',
    '',
    `TARGET SEARCH QUERY: "${t.targetQuery}"`,
    `TITLE (use this or a very close variant, keep the query wording): ${t.title}`,
    '',
    'ANGLE (this is what makes the piece worth ranking):',
    t.angle,
    '',
    'MUST ANSWER these questions explicitly in the body:',
    ...t.mustAnswer.map((q) => `- ${q}`),
    '',
    'STRUCTURE:',
    '- 1400-1900 words, markdown, ## for sections',
    '- Open with a 40-60 word direct answer to the target query (featured-snippet shape)',
    '- At least one comparison table with real, named institutions',
    `- Link naturally inside a sentence to https://nordicrate.com${t.internalLink} (once, in context — not a footer CTA)`,
    '- End with a "## FAQ" section: exactly the MUST ANSWER questions as ### headings, 40-70 word answers',
    '',
    'HARD RULES:',
    '- Never invent rates, fees or statistics. If you state a number, it must be one you were given',
    '  in the LIVE DATA block below, or an official rule (e.g. EU deposit guarantee 100,000 EUR).',
    '- Prefer "as of <month year>" wording over "currently" so the piece ages honestly.',
    '- No hype words, no "revolutionary", no financial advice ("you should borrow").',
    '- Neutral comparison-site voice: data first, interpretation second.',
    '- Mention that advertised "from X%" rates are best-case and depend on the applicant.',
    '',
    'OUTPUT: valid JSON only:',
    '{"title": "...", "slug": "' + t.slug + '", "description": "150-160 char meta description containing the target query",',
    ' "content_md": "full markdown body", "tags": ["3-5 lowercase tags"]}',
  ].join('\n');
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!safeCompareSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }

  // Yayınlanmış slug'lar — havuzdan düşülür
  const { data: posts } = await admin
    .from('blog_posts')
    .select('slug')
    .eq('locale', 'en')
    .limit(200);
  const publishedSlugs = (posts ?? []).map((p) => (p as { slug: string }).slug);

  const topic = nextTopic(publishedSlugs);
  if (!topic) {
    return NextResponse.json({
      exhausted: true,
      message: 'Konu havuzu bitti — lib/blog-topics.ts genisletilmeli',
      poolSize: BLOG_TOPICS.length,
      published: publishedSlugs.length,
    });
  }

  // Canlı veri bloğu: LLM uydurmasın diye gerçek oranları brief'e gömüyoruz
  const { data: rates } = await admin
    .from('latest_scraped_rates')
    .select('bank_id, product_type, rate_min')
    .order('rate_min', { ascending: true });

  const liveLines = (rates ?? [])
    .filter((r) => (r as { rate_min: number | null }).rate_min != null)
    .map((r) => {
      const row = r as { bank_id: string; product_type: string; rate_min: number };
      return `${row.bank_id} ${row.product_type}: from ${row.rate_min}%`;
    });

  const liveBlock = liveLines.length
    ? '\n\nLIVE DATA (verified from bank websites today — use these, do not invent others):\n' +
      liveLines.join('\n') +
      '\nNote: mortgage figures are margins; the customer rate is margin + 6-month EURIBOR.'
    : '';

  return NextResponse.json({
    topic: {
      slug: topic.slug,
      title: topic.title,
      targetQuery: topic.targetQuery,
      internalLink: topic.internalLink,
      priority: topic.priority,
    },
    brief: buildBrief(topic) + liveBlock,
    remaining: BLOG_TOPICS.length - publishedSlugs.filter((s) =>
      BLOG_TOPICS.some((t) => t.slug === s)
    ).length,
  });
}
