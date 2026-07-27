import LegalArticle, { legalMetadata } from '@/components/legal/LegalArticle';

export const metadata = legalMetadata('cookies');

export default function Page() {
  return <LegalArticle slug="cookies" />;
}
