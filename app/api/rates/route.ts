import { NextResponse } from 'next/server';
import { fetchAllRates } from '@/lib/rates';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchAllRates();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
