/**
 * Blog veri katmanı — Supabase blog_posts (RLS: sadece published okunur).
 * n8n otomasyonu service-role ile yazar, site anon ile okur.
 */

// DİKKAT: createSupabaseServer KULLANMA — cookies() çağırır ve ISR/statik blog
// sayfalarını runtime'da dynamic'e zorlayıp 500 attırır. Blog okuma anonim;
// cookie'siz düz client yeterli (db.ts ile aynı desen).
import { supabase } from '@/lib/supabase';

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

export async function getPublishedPosts(limit = 50): Promise<BlogPost[]> {
  try {
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select(COLS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
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
