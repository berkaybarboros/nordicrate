import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blog';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nordicrate.com';

const COUNTRY_CODES = ['DK', 'FI', 'IS', 'NO', 'SE', 'EE', 'LV', 'LT'];

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

  // Lokalize homepage'ler
  const localeRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/fi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/et`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
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

  // Per-country loan pages (/loans?country=XX)
  const countryLoanRoutes: MetadataRoute.Sitemap = COUNTRY_CODES.map((code) => ({
    url: `${BASE_URL}/loans?country=${code}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Per-country mortgage pages
  const countryMortgageRoutes: MetadataRoute.Sitemap = COUNTRY_CODES.map((code) => ({
    url: `${BASE_URL}/mortgage?country=${code}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Per-country business pages
  const countryBusinessRoutes: MetadataRoute.Sitemap = COUNTRY_CODES.map((code) => ({
    url: `${BASE_URL}/business?country=${code}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  // Region filter pages
  const regionRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/countries?region=nordic`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/countries?region=baltic`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/programs?tab=e_residency`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  return [
    ...staticRoutes,
    ...localeRoutes,
    ...blogRoutes,
    ...countryLoanRoutes,
    ...countryMortgageRoutes,
    ...countryBusinessRoutes,
    ...regionRoutes,
  ];
}
