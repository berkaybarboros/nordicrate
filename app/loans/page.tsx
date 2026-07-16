import { PRODUCTS } from '@/lib/data';
import ProductListPage from '@/components/ProductListPage';
import type { FilterState } from '@/components/FilterSidebar';
import type { CountryCode } from '@/lib/types';
import { buildProductsItemList } from '@/lib/seo';
import { applyScrapedOverrides } from '@/lib/scraped-overrides';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = {
  alternates: { canonical: 'https://nordicrate.com/loans' },
  title: 'Personal Loans – NordicRate | Compare Nordic & Baltic Rates',
  description: 'Compare personal and consumer loan rates from banks and insurers across Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia, and Lithuania.',
};

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function LoansPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const products = await applyScrapedOverrides(
    PRODUCTS.filter(p => p.type === 'personal' || p.type === 'auto' || p.type === 'student')
  );

  const defaultFilters: Partial<FilterState> = {};
  if (params.country) defaultFilters.countries = [params.country as CountryCode];
  if (params.type)    defaultFilters.loanTypes  = [params.type as FilterState['loanTypes'][number]];

  return (
    <>
    <JsonLd data={buildProductsItemList(products, 'Personal & Consumer Loans — Nordic & Baltic', '/loans')} />
    <ProductListPage
      title="Personal & Consumer Loans"
      subtitle={`Compare ${products.length} personal loan and auto finance products from Nordic & Baltic banks and insurance companies.`}
      icon="👤"
      allProducts={products}
      availableLoanTypes={['personal', 'auto', 'student']}
      defaultFilters={defaultFilters}
      alertProduct="personal-loan"
    />
    </>
  );
}
