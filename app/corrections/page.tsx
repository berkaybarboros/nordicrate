import LegalArticle, { legalMetadata } from '@/components/legal/LegalArticle';

export const metadata = legalMetadata('corrections');

export default function Page() {
  return <LegalArticle slug="corrections" />;
}
