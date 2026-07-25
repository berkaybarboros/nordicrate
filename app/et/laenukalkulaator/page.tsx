import type { Metadata } from 'next';
import CalculatorPageBody from '@/components/calculators/CalculatorPageBody';
import { CALCULATOR_PAGES, CALCULATOR_ROUTES as R } from '@/lib/calculator-content';

const page = CALCULATOR_PAGES.et;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: R.et,
    languages: { en: R.en, et: R.et, fi: R.fi, 'x-default': R.en },
  },
  openGraph: { title: page.metaTitle, description: page.metaDescription, url: R.et, type: 'website', locale: 'et_EE' },
};

export default function LaenukalkulaatorPage() {
  return (
    <CalculatorPageBody
      page={page}
      breadcrumb={[{ name: 'Avaleht', href: '/et' }, { name: 'Laenukalkulaator' }]}
    />
  );
}
