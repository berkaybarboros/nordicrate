import LegalArticle, { legalMetadata } from '@/components/legal/LegalArticle';

export const metadata = legalMetadata('terms');

export default function Page() {
  return <LegalArticle slug="terms" />;
}
