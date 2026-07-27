import LegalArticle, { legalMetadata } from '@/components/legal/LegalArticle';

export const metadata = legalMetadata('privacy');

export default function Page() {
  return <LegalArticle slug="privacy" />;
}
