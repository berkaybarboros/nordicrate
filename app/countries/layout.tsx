import type { Metadata } from 'next';

// page.tsx client component — canonical/metadata layout üzerinden (GSC coverage fix)
export const metadata: Metadata = {
  title: 'Loan Markets by Country — 8 Nordic & Baltic Countries',
  description:
    'Explore credit markets in Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia and Lithuania: banks, products and average rates per country.',
  alternates: { canonical: 'https://nordicrate.com/countries' },
};

export default function CountriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
