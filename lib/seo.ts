/**
 * lib/seo.ts — JSON-LD structured data builder'ları
 * Kullanım: server component'ta buildX() → <JsonLd data={...} />
 */

import type { LoanProduct } from '@/lib/types';
import { getInstitution } from '@/lib/utils';
import type { FaqItem } from '@/lib/faq-data';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nordicrate.com';

/** Ürün listeleme sayfaları için ItemList + LoanOrCredit şeması (rich results). */
export function buildProductsItemList(
  products: LoanProduct[],
  pageName: string,
  pagePath: string,
  maxItems = 20
) {
  const items = products.slice(0, maxItems).map((p, i) => {
    const inst = getInstitution(p.institutionId);
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LoanOrCredit',
        name: p.name,
        provider: {
          '@type': 'BankOrCreditUnion',
          name: inst?.name ?? p.institutionId,
          ...(inst?.website ? { url: inst.website } : {}),
        },
        annualPercentageRate: {
          '@type': 'QuantitativeValue',
          minValue: p.rateMin,
          maxValue: p.rateMax,
          unitText: 'PERCENT',
        },
        amount: {
          '@type': 'MonetaryAmount',
          currency: p.currency,
          minValue: p.limitMin,
          maxValue: p.limitMax,
        },
        loanTerm: {
          '@type': 'QuantitativeValue',
          minValue: p.termMin,
          maxValue: p.termMax,
          unitCode: 'MON',
        },
      },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageName,
    url: `${BASE_URL}${pagePath}`,
    numberOfItems: items.length,
    itemListElement: items,
  };
}

/** Homepage FAQ rich results. */
export function buildFaqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
