import LegalArticle, { legalMetadata } from '@/components/legal/LegalArticle';

export const metadata = legalMetadata('partner-terms');

export default function Page() {
  return <LegalArticle slug="partner-terms" />;
}
