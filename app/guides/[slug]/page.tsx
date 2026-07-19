import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DeepContentBlock from '@/components/seo/DeepContentBlock';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { buildFaqJsonLd } from '@/lib/seo';
import { GUIDES, getGuide } from '@/lib/guides-content';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const url = `https://nordicrate.com/guides/${guide.slug}`;
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url,
      type: 'article',
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const url = `https://nordicrate.com/guides/${guide.slug}`;

  // Article + DefinedTerm — entity SEO sinyali (blueprint önerisi)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.h1,
        description: guide.metaDescription,
        url,
        author: { '@type': 'Organization', name: 'NordicRate', url: 'https://nordicrate.com' },
        publisher: { '@type': 'Organization', name: 'NordicRate' },
        mainEntityOfPage: url,
      },
      {
        '@type': 'DefinedTerm',
        name: guide.cardLabel,
        description: guide.definition,
        url,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'NordicRate Borrowing Glossary',
          url: 'https://nordicrate.com/guides',
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={buildFaqJsonLd(guide.faqs)} />
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Guides', href: '/guides' },
              { name: guide.cardLabel },
            ]}
          />
        </div>
        <DeepContentBlock content={guide} showH1 />
      </div>
    </>
  );
}
