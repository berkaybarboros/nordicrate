import type { Metadata } from 'next';
import LocalizedDeepPage from '@/components/seo/LocalizedDeepPage';
import { DEEP_CONTENT, DEEP_CONTENT_ROUTES } from '@/lib/deep-content';

const content = DEEP_CONTENT.personal.fi;
const R = DEEP_CONTENT_ROUTES.personal;

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: {
    canonical: R.fi,
    languages: { en: R.en, et: R.et, fi: R.fi, 'x-default': R.en },
  },
  openGraph: {
    title: content.metaTitle,
    description: content.metaDescription,
    url: R.fi,
    type: 'website',
    locale: 'fi_FI',
  },
};

export default function KulutusluottoPage() {
  return (
    <LocalizedDeepPage
      content={content}
      breadcrumb={[
        { name: 'Etusivu', item: 'https://nordicrate.com/fi' },
        { name: 'Kulutusluotto', item: R.fi },
      ]}
      compareCta="Vertaile kulutusluottoja"
      compareHref="/loans"
    />
  );
}
