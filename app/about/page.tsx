import type { Metadata } from 'next';
import MarkdownArticle from '@/components/MarkdownArticle';
import { getTrustDoc } from '@/lib/trust-content';

const doc = getTrustDoc('about')!;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: 'https://nordicrate.com/about' },
};

export default function Page() {
  return <MarkdownArticle title={doc.title} md={doc.md} />;
}
