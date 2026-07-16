import { PRODUCTS } from '@/lib/data';
import ProductListPage from '@/components/ProductListPage';
import { buildProductsItemList } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { applyScrapedOverrides } from '@/lib/scraped-overrides';

export const revalidate = 1800;

export const metadata = {
  alternates: { canonical: 'https://nordicrate.com/business' },
  title: 'Business Loans – NordicRate | Corporate Credit in Nordic & Baltic',
  description: 'Compare business and corporate loan rates from banks and insurers across Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia, and Lithuania.',
};

export default async function BusinessPage() {
  const products = await applyScrapedOverrides(PRODUCTS.filter((p) => p.type === 'business'));

  return (
    <>
    <JsonLd data={buildProductsItemList(products, 'Business & Corporate Loans — Nordic & Baltic', '/business')} />
    <ProductListPage
      title="Business & Corporate Loans"
      subtitle={`Compare ${products.length} business credit products for SMEs and large corporations across Nordic & Baltic markets.`}
      icon="🏢"
      allProducts={products}
      availableLoanTypes={['business']}
      defaultFilters={{ customerType: 'corporate' }}
      alertProduct="personal-loan"
    />
    </>
  );
}
