import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { renderMarkdown } from '@/lib/markdown';

/** Markdown tabanlı statik sayfa gövdesi — trust/legal sayfalarının ortak render'ı */
export default function MarkdownArticle({ title, md }: { title: string; md: string }) {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: title }]} />
        <article
          className="text-slate-700 leading-relaxed mt-6 text-[15px]
            [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:mb-3
            [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-2
            [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-5 [&_h3]:mb-1
            [&_p]:my-3 [&_a]:text-sky-700 [&_a]:underline
            [&_table]:text-sm [&_table]:w-full [&_table]:my-4
            [&_th]:text-left [&_th]:border-b [&_th]:border-slate-300 [&_th]:py-2 [&_th]:pr-3
            [&_td]:border-b [&_td]:border-slate-100 [&_td]:py-2 [&_td]:pr-3 [&_td]:align-top
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_li]:my-1
            [&_strong]:text-slate-900"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }}
        />
      </div>
    </div>
  );
}
