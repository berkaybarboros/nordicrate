import { NextRequest, NextResponse } from "next/server";
import { deposits } from "@/data/insurance";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const amount = Number(searchParams.get("amount")) || 10000;
  const term = Number(searchParams.get("term")) || 12;

  const calculateInterest = (rate: number) =>
    Math.round(amount * (rate / 100) * (term / 12));

  const offersForTerm = deposits
    .filter((d) => d.termOptions.includes(term))
    .map((d) => {
      const rate = (d.rates as unknown as Record<number, number>)[term] || 0;
      const interest = calculateInterest(rate);
      return {
        ...d,
        rate,
        interest,
        totalAtMaturity: amount + interest,
      };
    })
    .sort((a, b) => b.rate - a.rate);

  const allTerms = [
    ...new Set(deposits.flatMap((d) => d.termOptions)),
  ].sort((a, b) => a - b);

  return NextResponse.json({
    deposits: offersForTerm,
    total: offersForTerm.length,
    allTerms,
    meta: {
      amount,
      term,
      updatedAt: new Date().toISOString(),
    },
  });
}
