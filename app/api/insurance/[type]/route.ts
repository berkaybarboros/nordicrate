import { NextRequest, NextResponse } from "next/server";
import {
  motorInsurance,
  cascoInsurance,
  homeInsurance,
  healthInsurance,
} from "@/data/insurance";
import type { InsuranceOffer } from "@/data/insurance";

const insuranceDataMap: Record<string, InsuranceOffer[]> = {
  motor: motorInsurance,
  casco: cascoInsurance,
  home: homeInsurance,
  health: healthInsurance,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const searchParams = request.nextUrl.searchParams;

  const offers = insuranceDataMap[type];
  if (!offers) {
    return NextResponse.json(
      { error: `Unknown insurance type: ${type}. Valid types: motor, casco, home, health` },
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

  return NextResponse.json({
    offers: filtered,
    total: filtered.length,
    meta: {
      type,
      sortBy,
      updatedAt: new Date().toISOString(),
    },
  });
}
