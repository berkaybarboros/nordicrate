import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — Loan & Insurance Guides for Nordic & Baltic Countries',
  description:
    'Guides, rate analyses and how-tos on loans, mortgages and insurance across Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia and Lithuania.',
  alternates: { canonical: 'https://nordicrate.com/blog' },
};

export const revalidate = 600; // 10 dk — n8n yeni yazı bastığında en geç 10 dk'da görünür

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">NordicRate Blog</h1>
        <p className="text-slate-500 mt-2">
          Guides and market insights on borrowing and insurance across the Nordics &amp; Baltics.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">
            First articles are on the way — check back soon, or grab our{' '}
            <Link href="/partners" className="text-sky-600 font-semibold hover:underline">
              quarterly rate report
            </Link>{' '}
            in the meantime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all p-6 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[11px] font-semibold text-sky-700 bg-sky-50 rounded-full px-2.5 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">{post.description}</p>
              <p className="text-xs text-slate-400 mt-4">
                {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{post.author}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
