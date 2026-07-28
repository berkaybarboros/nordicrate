import type { Metadata } from 'next';
import MarkdownArticle from '@/components/MarkdownArticle';
import { getTrustDoc } from '@/lib/trust-content';

const doc = getTrustDoc('how-we-make-money')!;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: 'https://nordicrate.com/how-we-make-money' },
};

export default function Page() {
  return <MarkdownArticle title={doc.title} md={doc.md} />;
}
