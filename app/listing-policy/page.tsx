import LegalArticle, { legalMetadata } from '@/components/legal/LegalArticle';

export const metadata = legalMetadata('listing-policy');

export default function Page() {
  return <LegalArticle slug="listing-policy" />;
}
