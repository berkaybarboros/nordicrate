import { PRODUCTS } from '@/lib/data';
import ProductListPage from '@/components/ProductListPage';
import { buildProductsItemList } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = {
  alternates: { canonical: 'https://nordicrate.com/mortgage' },
  title: 'Mortgage Rates – NordicRate | Nordic & Baltic Home Loans',
  description: 'Compare mortgage and home loan rates from banks across Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia, and Lithuania.',
};

export default function MortgagePage() {
  const products = PRODUCTS.filter((p) => p.type === 'mortgage');

  return (
    <>
    <JsonLd data={buildProductsItemList(products, 'Mortgage & Home Loans — Nordic & Baltic', '/mortgage')} />
    <ProductListPage
      title="Mortgage & Home Loans"
      subtitle={`Compare ${products.length} mortgage products for individuals and corporations across all Nordic & Baltic countries.`}
      icon="🏠"
      allProducts={products}
      availableLoanTypes={['mortgage']}
      alertProduct="mortgage"
    />
    </>
  );
}
