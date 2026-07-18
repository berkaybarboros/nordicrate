import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIAssistant from '@/components/AIAssistant';
import CompareBar from '@/components/compare/CompareBar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CompareProvider } from '@/contexts/CompareContext';

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
  // DİKKAT: Buraya alternates.canonical KOYMA — root layout metadata'sı alt sayfalara
  // miras kalır ve kendi canonical'ı olmayan her sayfa homepage'i canonical gösterir
  // (indexleme felaketi). Canonical'lar sayfa bazında tanımlanır.
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

// JSON-LD — Organization + WebSite structured data (SEO / rich results)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'NordicRate',
      url: BASE_URL,
      logo: `${BASE_URL}/og-image.png`,
      description:
        'Loan, mortgage and business credit comparison platform for the Nordic and Baltic region.',
      areaServed: ['DK', 'FI', 'IS', 'NO', 'SE', 'EE', 'LV', 'LT'],
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'NordicRate',
      publisher: { '@id': `${BASE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/loans?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Üçüncü parti asset hostlarına erken bağlantı — LCP/bayrak görselleri */}
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://logo.clearbit.com" />
        {/* Google Tag Manager — head'de olabildiğince yukarıda */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NF6L5Z36');`,
          }}
        />
        {/* GA4 artık GTM container'ı içinden yönetiliyor (kullanıcı GTM'e GA4 tag'i ekledi) —
            gtag.js kaldırıldı, çift sayım önlendi. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen flex flex-col`}
      >
        {/* Google Tag Manager (noscript) — body açılışının hemen ardından */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NF6L5Z36"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <LanguageProvider>
          <CompareProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <AIAssistant />
            <CompareBar />
          </CompareProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
