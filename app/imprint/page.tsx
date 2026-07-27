import LegalArticle, { legalMetadata } from '@/components/legal/LegalArticle';

export const metadata = legalMetadata('imprint');

export default function Page() {
  return <LegalArticle slug="imprint" />;
}
