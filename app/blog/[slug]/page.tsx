import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog';
import { renderMarkdown } from '@/lib/markdown';
import JsonLd from '@/components/seo/JsonLd';

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article not found' };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://nordicrate.com/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.published_at,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'NordicRate', url: 'https://nordicrate.com' },
    mainEntityOfPage: `https://nordicrate.com/blog/${post.slug}`,
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={articleJsonLd} />

      <nav className="text-xs text-slate-400 mb-6">
        <Link href="/blog" className="hover:text-sky-600">← All articles</Link>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[11px] font-semibold text-sky-700 bg-sky-50 rounded-full px-2.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">{post.title}</h1>
        <p className="text-sm text-slate-400 mt-4">
          {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{post.author}
        </p>
      </header>

      <div
        className="prose-nordic text-slate-700 leading-relaxed space-y-4
          [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
          [&_blockquote]:border-l-4 [&_blockquote]:border-sky-200 [&_blockquote]:pl-4 [&_blockquote]:text-slate-500 [&_blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content_md) }}
      />

      {/* CTA */}
      <div className="mt-12 bg-slate-950 rounded-2xl p-8 text-center">
        <p className="text-white font-extrabold text-lg mb-2">Compare live rates across 8 countries</p>
        <p className="text-slate-400 text-sm mb-5">Free, independent, no impact on your credit score.</p>
        <Link
          href="/loans"
          className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Compare loans →
        </Link>
      </div>
    </article>
  );
}

// Yayınlanmış yazıları build-time'da statikleştir (yeni yazılar ISR ile gelir)
export async function generateStaticParams() {
  const posts = await getPublishedPosts(100);
  return posts.map((p) => ({ slug: p.slug }));
}
