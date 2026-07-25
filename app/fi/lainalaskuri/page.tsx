import type { Metadata } from 'next';
import CalculatorPageBody from '@/components/calculators/CalculatorPageBody';
import { CALCULATOR_PAGES, CALCULATOR_ROUTES as R } from '@/lib/calculator-content';

const page = CALCULATOR_PAGES.fi;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: R.fi,
    languages: { en: R.en, et: R.et, fi: R.fi, 'x-default': R.en },
  },
  openGraph: { title: page.metaTitle, description: page.metaDescription, url: R.fi, type: 'website', locale: 'fi_FI' },
};

export default function LainalaskuriPage() {
  return (
    <CalculatorPageBody
      page={page}
      breadcrumb={[{ name: 'Etusivu', href: '/fi' }, { name: 'Lainalaskuri' }]}
    />
  );
}
