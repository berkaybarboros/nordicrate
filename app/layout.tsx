import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nordicrate.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'NordicRate – Compare Loan Rates in Nordic & Baltic Countries',
    template: '%s | NordicRate',
  },
  description:
    'Compare personal loans, mortgages, and business credit rates from 50+ banks and insurers across Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia, and Lithuania. Free, instant, no credit check.',
  keywords: [
    'nordic loans', 'baltic credit', 'mortgage rates', 'personal loan comparison',
    'Scandinavia finance', 'Estonia loan', 'Finland bank', 'Norway mortgage',
    'Sweden personal loan', 'compare loan rates', 'e-residency banking',
    'EURIBOR loan', 'Baltic mortgage', 'business loan Nordic',
  ],
  authors: [{ name: 'NordicRate' }],
  creator: 'NordicRate',
  publisher: 'NordicRate',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'NordicRate',
    title: 'NordicRate – Compare Loan Rates in Nordic & Baltic Countries',
    description:
      'Free loan comparison across 8 Nordic & Baltic countries. 50+ banks, 100+ products. Find the lowest APR in seconds.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NordicRate – Nordic & Baltic Loan Comparison',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NordicRate – Compare Loan Rates in Nordic & Baltic Countries',
    description:
      'Free loan comparison across 8 Nordic & Baltic countries. 50+ banks, 100+ products.',
    images: ['/og-image.png'],
    creator: '@nordicrate',
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
