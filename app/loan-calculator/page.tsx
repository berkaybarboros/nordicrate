import type { Metadata } from 'next';
import CalculatorPageBody from '@/components/calculators/CalculatorPageBody';
import { CALCULATOR_PAGES, CALCULATOR_ROUTES as R } from '@/lib/calculator-content';

const page = CALCULATOR_PAGES.en;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: R.en,
    languages: { en: R.en, et: R.et, fi: R.fi, 'x-default': R.en },
  },
  openGraph: { title: page.metaTitle, description: page.metaDescription, url: R.en, type: 'website' },
};

export default function LoanCalculatorPage() {
  return (
    <CalculatorPageBody
      page={page}
      breadcrumb={[{ name: 'Home', href: '/' }, { name: 'Loan Calculator' }]}
    />
  );
}
