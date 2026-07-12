import type { Metadata } from 'next';
import LocalizedHome from '@/components/home/LocalizedHome';
import { HOME_DICTS } from '@/lib/home-i18n';

const dict = HOME_DICTS.et;

export const metadata: Metadata = {
  title: dict.metaTitle,
  description: dict.metaDescription,
  alternates: {
    canonical: 'https://nordicrate.com/et',
    languages: {
      'en': 'https://nordicrate.com',
      'fi': 'https://nordicrate.com/fi',
      'et': 'https://nordicrate.com/et',
      'x-default': 'https://nordicrate.com',
    },
  },
  openGraph: {
    title: dict.metaTitle,
    description: dict.metaDescription,
    locale: 'et_EE',
  },
};

export default function EstonianHomePage() {
  return <LocalizedHome dict={dict} />;
}
