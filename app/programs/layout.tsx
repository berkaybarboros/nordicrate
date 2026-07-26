import type { Metadata } from 'next';

// page.tsx client component — canonical/metadata layout üzerinden (GSC coverage fix)
export const metadata: Metadata = {
  title: 'Government & EU Funding Programs — Nordics & Baltics',
  description:
    'State-backed loans, EU funds, e-Residency and digital nomad visas across the Nordic and Baltic countries — 30+ programs for founders and SMEs.',
  alternates: { canonical: 'https://nordicrate.com/programs' },
};

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
