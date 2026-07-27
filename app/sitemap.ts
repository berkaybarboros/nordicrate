import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blog';

// Sitemap saatte bir yenilensin — blog cron'la yayınlanıyor, build-time snapshot
// yeni yazıları kaçırıyordu (SEO audit 2026-07-25: 5 yazıdan 4'ü sitemap dışıydı)
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nordicrate.com';


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Blog yazıları (Supabase erişilemezse boş döner — sitemap kırılmaz)
  const posts = await getPublishedPosts(200);
  const blogRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    ...posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  // Lokalize homepage'ler + derin kategori sayfaları (ET/FI)
  const localeRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/fi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/et`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/et/kodulaen`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/et/tarbimislaen`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/fi/asuntolaina`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/fi/kulutusluotto`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
  ];

  // Hesaplayıcı sayfaları (3 dil, karşılıklı hreflang)
  const calculatorRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/loan-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/et/laenukalkulaator`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/fi/lainalaskuri`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  // Hukuk sayfaları
  const legalRoutes: MetadataRoute.Sitemap = ['privacy', 'terms', 'cookies', 'imprint'].map((s) => ({
    url: `${BASE_URL}/${s}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  // Entity/glossary rehberleri
  const guideRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...['euribor', 'apr-kkm', 'ltv', 'kredex', 'dsti', 'withdrawal-right'].map((slug) => ({
      url: `${BASE_URL}/guides/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/loans`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/mortgage`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/business`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/countries`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/programs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Insurance hub + all category pages
    {
      url: `${BASE_URL}/insurance`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/insurance/motor`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/insurance/casco`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/insurance/home`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/insurance/health`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/insurance/travel`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/insurance/life`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    // Loan sub-pages
    {
      url: `${BASE_URL}/loans/personal`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.88,
    },
    {
      url: `${BASE_URL}/loans/mortgage`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.88,
    },
    {
      url: `${BASE_URL}/loans/car`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/loans/business`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/partners`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Ülke landing sayfaları (/loans/estonia vb.) — SEO ana sayfalar
  const countryLandingRoutes: MetadataRoute.Sitemap = [
    'estonia', 'finland', 'latvia', 'lithuania', 'sweden', 'norway', 'denmark', 'iceland',
  ].map((slug) => ({
    url: `${BASE_URL}/loans/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.88,
  }));

  // NOT: ?country= / ?region= / ?tab= parametreli URL'ler BİLİNÇLİ olarak yok —
  // hepsi base path'e canonicalize oluyor; sitemap'te olmaları GSC'de 26 adet
  // "Duplicate, submitted URL not selected as canonical" üretiyordu (audit 2026-07-25).

  return [
    ...staticRoutes,
    ...localeRoutes,
    ...legalRoutes,
    ...calculatorRoutes,
    ...guideRoutes,
    ...blogRoutes,
    ...countryLandingRoutes,
  ];
}
