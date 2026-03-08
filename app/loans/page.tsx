import { PRODUCTS } from '@/lib/data';
import ProductListPage from '@/components/ProductListPage';

export const metadata = {
  title: 'Personal Loans – NordicRate | Compare Nordic & Baltic Rates',
  description: 'Compare personal and consumer loan rates from banks and insurers across Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia, and Lithuania.',
};

export default function LoansPage() {
  const products = PRODUCTS.filter((p) => p.type === 'personal' || p.type === 'auto' || p.type === 'student');

  return (
    <ProductListPage
      title="Personal & Consumer Loans"
      subtitle={`Compare ${products.length} personal loan and auto finance products from Nordic & Baltic banks and insurance companies.`}
      icon="👤"
      allProducts={products}
      availableLoanTypes={['personal', 'auto', 'student']}
    />
  );
}
