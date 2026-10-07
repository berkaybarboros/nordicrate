import { NextRequest, NextResponse } from "next/server";
import { INSURANCE_BY_TYPE } from "@/data/insurance";
import type { InsuranceOffer } from "@/data/insurance";
import { enforceRateLimit } from "@/lib/security";

const insuranceDataMap: Record<string, InsuranceOffer[]> = INSURANCE_BY_TYPE;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const limited = enforceRateLimit(request, 'catalog-insurance', 60);
  if (limited) return limited;

  const { type } = await params;
  const searchParams = request.nextUrl.searchParams;

  const offers = insuranceDataMap[type];
  if (!offers) {
    return NextResponse.json(
      { error: `Unknown insurance type: ${type}. Valid types: motor, casco, home, health, travel, life` },
      { status: 404 }
    );
  }

  const sortBy = searchParams.get("sort") || "price";
  const companyId = searchParams.get("companyId") || undefined;

  let filtered = [...offers];

  if (companyId) {
    filtered = filtered.filter((o) => o.companyId === companyId);
  }

  filtered.sort((a, b) => {
    if (sortBy === "price") return a.representativePremium - b.representativePremium;
    if (sortBy === "name") return a.companyName.localeCompare(b.companyName);
    return a.representativePremium - b.representativePremium;
  });

  const verifiedAt =
    filtered
      .map((o) => o.verifiedAt)
      .filter((v): v is string => Boolean(v))
      .sort()
      .at(-1) ?? null;

  return NextResponse.json({
    offers: filtered,
    total: filtered.length,
    meta: {
      type,
      sortBy,
      // Eskiden `updatedAt: new Date()` — her istekte "şimdi güncellendi" diyordu, oysa
      // primler elle girilmiş örnekler. Artık yalnız gerçekten doğrulanmış teklif varsa
      // en yeni doğrulama tarihi döner; yoksa null ve priceBasis 'example'.
      priceBasis: verifiedAt ? "verified" : "example",
      verifiedAt,
    },
  });
}
