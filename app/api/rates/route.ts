import { NextResponse } from 'next/server';
import { fetchAllRates } from '@/lib/rates';
import { enforceRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Upstream (ECB/Norges) korumalı — flood localhost cache'ini bypass edemesin
  const limited = enforceRateLimit(req, 'rates', 60);
  if (limited) return limited;

  const data = await fetchAllRates();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
