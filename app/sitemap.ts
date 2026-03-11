import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nordicrate.com';

const COUNTRY_CODES = ['DK', 'FI', 'IS', 'NO', 'SE', 'EE', 'LV', 'LT'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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
    ...countryLoanRoutes,
    ...countryMortgageRoutes,
    ...countryBusinessRoutes,
    ...regionRoutes,
  ];
}
