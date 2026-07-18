/**
 * Görsel breadcrumb + BreadcrumbList JSON-LD (server component).
 * SERP'te breadcrumb zengin sonucu + sayfa hiyerarşisi sinyali.
 */

import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nordicrate.com';

export interface Crumb {
  name: string;
  href?: string; // son öğede href verilmez
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${BASE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
      <JsonLd data={jsonLd} />
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {c.href ? (
              <Link href={c.href} className="hover:text-sky-600 transition-colors">
                {c.name}
              </Link>
            ) : (
              <span className="text-slate-600 font-medium">{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
