/**
 * Blog veri katmanı — Supabase blog_posts (RLS: sadece published okunur).
 * n8n otomasyonu service-role ile yazar, site anon ile okur.
 */

// DİKKAT: createSupabaseServer KULLANMA — cookies() çağırır ve ISR/statik blog
// sayfalarını runtime'da dynamic'e zorlayıp 500 attırır. Blog okuma anonim;
// cookie'siz düz client yeterli (db.ts ile aynı desen).
import { supabase } from '@/lib/supabase';

/**
 * Markdown gövdesindeki "## FAQ" bölümünü yapılandırılmış soru/cevaba çevirir.
 * Blog otomasyonu FAQ'ları ### başlık + paragraf olarak yazıyor; bu parse
 * olmadan FAQPage schema üretilemiyordu (rich result kaybı, SEO tur 2 bulgusu).
 */
export function extractFaqs(md: string): { q: string; a: string }[] {
  const start = md.search(/^##\s+FAQ\s*$/im);
  if (start === -1) return [];
  // FAQ bölümünden sonraki ilk "## " (başka bir H2) bölümü sonlandırır
  const rest = md.slice(start);
  const nextH2 = rest.slice(3).search(/^##\s+(?!#)/m);
  const block = nextH2 === -1 ? rest : rest.slice(0, nextH2 + 3);

  const out: { q: string; a: string }[] = [];
  const re = /^###\s+(.+?)\s*$([\s\S]*?)(?=^###\s|\Z)/gm;
  for (const m of block.matchAll(re)) {
    const q = m[1].trim();
    const a = m[2]
      .replace(/^\s*[\r\n]+/, '')
      .replace(/[*_`>#]/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // link metnini koru, URL'i at
      .replace(/\s+/g, ' ')
      .trim();
    if (q.length > 5 && a.length > 20) out.push({ q, a: a.slice(0, 500) });
  }
  return out.slice(0, 10);
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content_md: string;
  locale: string;
  tags: string[];
  author: string;
  published_at: string;
}

const COLS = 'slug, title, description, content_md, locale, tags, author, published_at';

export async function getPublishedPosts(limit = 50, locale?: 'en' | 'fi' | 'et'): Promise<BlogPost[]> {
  try {
    let query = supabase
      .from('blog_posts')
      .select(COLS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    if (locale) query = query.eq('locale', locale);
    const { data, error } = await query;
    if (error || !data) return [];
    return data as BlogPost[];
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select(COLS)
      .eq('status', 'published')
      .eq('slug', slug)
      .single();
    if (error || !data) return null;
    return data as BlogPost;
  } catch {
    return null;
  }
}
