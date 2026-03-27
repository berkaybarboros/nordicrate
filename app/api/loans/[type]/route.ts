import { NextRequest, NextResponse } from "next/server";
import { personalLoans, mortgageLoans, carLoans } from "@/data/loans";
import type { LoanOffer } from "@/data/loans";

const loanDataMap: Record<string, LoanOffer[]> = {
  personal: personalLoans,
  mortgage: mortgageLoans,
  car: carLoans,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const searchParams = request.nextUrl.searchParams;

  const loans = loanDataMap[type];
  if (!loans) {
    return NextResponse.json(
      { error: `Unknown loan type: ${type}. Valid types: personal, mortgage, car` },
      { status: 404 }
    );
  }

  const amount = Number(searchParams.get("amount")) || undefined;
  const term = Number(searchParams.get("term")) || undefined;
  const sortBy = searchParams.get("sort") || "rate";
  const bankId = searchParams.get("bankId") || undefined;

  let filtered = [...loans];

  if (bankId) {
    filtered = filtered.filter((l) => l.bankId === bankId);
  }

  if (amount !== undefined) {
    filtered = filtered.filter(
      (l) => amount >= l.minAmount && amount <= l.maxAmount
    );
  }
  if (term !== undefined) {
    filtered = filtered.filter(
      (l) => term >= l.minTermMonths && term <= l.maxTermMonths
    );
  }

  const calculateMonthly = (loan: LoanOffer, amt: number, t: number) => {
    const r = loan.representativeRate / 100 / 12;
    if (r === 0) return amt / t;
    return (amt * r * Math.pow(1 + r, t)) / (Math.pow(1 + r, t) - 1);
  };

  const amt = amount || 5000;
  const t = term || 36;

  filtered.sort((a, b) => {
    if (sortBy === "rate") return a.representativeRate - b.representativeRate;
    if (sortBy === "monthly") return calculateMonthly(a, amt, t) - calculateMonthly(b, amt, t);
    if (sortBy === "total") {
      return calculateMonthly(a, amt, t) * t - calculateMonthly(b, amt, t) * t;
    }
    return a.representativeRate - b.representativeRate;
  });

  return NextResponse.json({
    loans: filtered,
    total: filtered.length,
    meta: {
      type,
      amount: amt,
      term: t,
      sortBy,
      updatedAt: new Date().toISOString(),
    },
  });
}
