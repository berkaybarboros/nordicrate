import { PRODUCTS } from '@/lib/data';
import ProductListPage from '@/components/ProductListPage';

export const metadata = {
  title: 'Business Loans – NordicRate | Corporate Credit in Nordic & Baltic',
  description: 'Compare business and corporate loan rates from banks and insurers across Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia, and Lithuania.',
};

export default function BusinessPage() {
  const products = PRODUCTS.filter((p) => p.type === 'business');

  return (
    <ProductListPage
      title="Business & Corporate Loans"
      subtitle={`Compare ${products.length} business credit products for SMEs and large corporations across Nordic & Baltic markets.`}
      icon="🏢"
      allProducts={products}
      availableLoanTypes={['business']}
      defaultFilters={{ customerType: 'corporate' }}
    />
  );
}
