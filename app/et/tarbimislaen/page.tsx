import type { Metadata } from 'next';
import LocalizedDeepPage from '@/components/seo/LocalizedDeepPage';
import { DEEP_CONTENT, DEEP_CONTENT_ROUTES } from '@/lib/deep-content';

const content = DEEP_CONTENT.personal.et;
const R = DEEP_CONTENT_ROUTES.personal;

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: {
    canonical: R.et,
    languages: { en: R.en, et: R.et, fi: R.fi, 'x-default': R.en },
  },
  openGraph: {
    title: content.metaTitle,
    description: content.metaDescription,
    url: R.et,
    type: 'website',
    locale: 'et_EE',
  },
};

export default function TarbimislaenPage() {
  return (
    <LocalizedDeepPage
      content={content}
      breadcrumb={[
        { name: 'Avaleht', item: 'https://nordicrate.com/et' },
        { name: 'Tarbimislaen', item: R.et },
      ]}
      compareCta="Võrdle tarbimislaene"
      compareHref="/loans/personal"
    />
  );
}
