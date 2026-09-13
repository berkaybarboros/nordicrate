import { NextRequest, NextResponse } from "next/server";
import { deposits, type DepositCatalogEntry } from "@/data/insurance";
import { enforceRateLimit } from "@/lib/security";
import { getLiveDepositRates, MAX_AGE_MS, type LiveDepositRate } from "@/lib/live-rates";

type ResolvedDeposit = DepositCatalogEntry & {
  rateCheckedAt: string;
  rateSourceUrl: string;
  rateSource: "live" | "manual";
};

/**
 * GET /api/deposits?amount=10000&term=12
 *
 * 2026-09-13: Oranlar artık bankaların sitesinden günlük çekiliyor
 * (scraped_deposit_rates). Önceki sürüm statik kataloğu döndürüyordu — oranlar
 * gerçeğin ~2 katıydı ve `meta.updatedAt` her istekte `new Date()` idi, yani
 * hiç güncellenmeyen veri için "şimdi güncellendi" deniyordu.
 *
 * Kaynak önceliği, banka başına:
 *   1. Canlı scrape (≤ 7 gün)            → rateSource: "live"
 *   2. Katalogdaki elle doğrulanmış yedek → rateSource: "manual" (aynı 7 gün kuralı)
 *   3. İkisi de bayat                    → banka listeden DÜŞER, sayısı meta.hidden'da
 * Bayat bir oranı sessizce göstermek, hiç göstermemekten kötüdür.
 */
export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "catalog-deposits", 60);
  if (limited) return limited;

  const searchParams = request.nextUrl.searchParams;
  const amount = Number(searchParams.get("amount")) || 10000;
  const term = Number(searchParams.get("term")) || 12;

  let live: Map<string, LiveDepositRate>;
  try {
    live = await getLiveDepositRates();
  } catch {
    live = new Map();
  }
  const now = Date.now();

  let hidden = 0;
  const resolved: ResolvedDeposit[] = deposits.flatMap((d): ResolvedDeposit[] => {
    const l = live.get(d.bankId);
    if (l) {
      return [{
        ...d,
        rates: l.rates,
        minAmount: l.minAmount ?? d.minAmount,
        rateCheckedAt: l.scrapedAt,
        rateSourceUrl: l.sourceUrl,
        rateSource: "live",
      }];
    }
    if (now - new Date(d.ratesVerifiedAt).getTime() <= MAX_AGE_MS) {
      return [{
        ...d,
        rateCheckedAt: d.ratesVerifiedAt,
        rateSourceUrl: d.ratesSourceUrl,
        rateSource: "manual",
      }];
    }
    hidden++;
    return [];
  });

  const offersForTerm = resolved
    .filter((d) => d.rates[term] != null)
    .map((d) => {
      const rate = d.rates[term];
      // Basit faiz, vade sonunda ödeme — bankaların tablolarındaki yıllık orana göre
      const interest = Math.round(amount * (rate / 100) * (term / 12));
      return {
        ...d,
        termOptions: Object.keys(d.rates).map(Number).sort((a, b) => a - b),
        rate,
        interest,
        totalAtMaturity: amount + interest,
      };
    })
    .sort((a, b) => b.rate - a.rate);

  const allTerms = [...new Set(resolved.flatMap((d) => Object.keys(d.rates).map(Number)))].sort(
    (a, b) => a - b
  );

  const checkedTimes = resolved.map((d) => d.rateCheckedAt).sort();

  return NextResponse.json({
    deposits: offersForTerm,
    total: offersForTerm.length,
    allTerms,
    meta: {
      amount,
      term,
      // En yeni ve en eski doğrulama anları — sahte "şimdi" yok
      newestCheckedAt: checkedTimes.at(-1) ?? null,
      oldestCheckedAt: checkedTimes[0] ?? null,
      liveCount: resolved.filter((d) => d.rateSource === "live").length,
      hidden,
    },
  });
}
