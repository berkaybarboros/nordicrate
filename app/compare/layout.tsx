import type { Metadata } from 'next';

// page.tsx client component — canonical/metadata layout üzerinden (GSC coverage fix)
export const metadata: Metadata = {
  title: 'Compare Loans Side by Side',
  description:
    'Pick up to three loan offers and compare them side by side: monthly payment, total cost and rates from Nordic & Baltic banks.',
  alternates: { canonical: 'https://nordicrate.com/compare' },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
