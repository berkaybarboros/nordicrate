"use client";

/**
 * RateFreshness — bir oranın bankanın sitesinden EN SON NE ZAMAN kontrol
 * edildiğini, banka bazında gösterir.
 *
 * 2026-09-13: Önceden kartlar ya hiçbir şey göstermiyordu ya da statik katalog
 * tarihini "Verified 19 Nov" diye basıyordu — hiç doğrulanmamış veriye doğrulama
 * rozeti. Mevduat API'si ise her istekte `updatedAt: new Date()` dönüyordu.
 *
 * Eşikler lib/live-rates.ts ile ortak:
 *   ≤ 48 saat → yeşil   "Checked 3h ago"
 *   ≤ 7 gün   → amber   "Checked 4 days ago"
 *   daha eski → gri     "Last checked 12 Aug · may be outdated"
 *   hiç yok   → gri     "Indicative rate · confirm with the bank"
 *
 * Göreli zaman mount sonrası hesaplanır: sunucu ve istemci saatleri farklı
 * olduğundan SSR'da "3h ago" basmak hydration uyuşmazlığı üretir.
 */

import { useMinuteClock } from "@/lib/use-client-store";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function relative(ms: number): string {
  if (ms < HOUR) return "less than an hour ago";
  if (ms < DAY) return `${Math.floor(ms / HOUR)}h ago`;
  const d = Math.floor(ms / DAY);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "bank site";
  }
}

interface Props {
  checkedAt: string | null | undefined;
  sourceUrl?: string | null;
  /** "manual": elle doğrulanmış yedek oran (scraper verisi yokken) */
  source?: "live" | "manual";
  className?: string;
}

export default function RateFreshness({ checkedAt, sourceUrl, source = "live", className = "" }: Props) {
  // Server render / hydration'da null — göreli zaman yalnız client'ta hesaplanır
  const now = useMinuteClock();

  if (!checkedAt) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] text-slate-500 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" aria-hidden />
        Indicative rate · confirm with the bank
      </span>
    );
  }

  const age = now == null ? null : now - new Date(checkedAt).getTime();
  const tone =
    age == null || age <= 2 * DAY ? "fresh" : age <= 7 * DAY ? "aging" : "stale";

  const dot = tone === "fresh" ? "bg-emerald-500" : tone === "aging" ? "bg-amber-500" : "bg-slate-400";
  const text = tone === "fresh" ? "text-emerald-700" : tone === "aging" ? "text-amber-700" : "text-slate-500";
  const verb = source === "manual" ? "Verified" : "Checked";

  // Mount öncesi (SSR) mutlak tarih — sonra göreli zamana döner
  const when =
    age == null
      ? shortDate(checkedAt)
      : tone === "stale"
        ? `${shortDate(checkedAt)} · may be outdated`
        : relative(age);

  const exact = new Date(checkedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] ${text} ${className}`}
      title={`${source === "manual" ? "Verified by hand against" : "Read automatically from"} the bank's own page on ${exact}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${tone === "fresh" ? "animate-pulse" : ""}`} aria-hidden />
      <span>
        {tone === "stale" ? "Last checked" : verb} {when}
      </span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline decoration-dotted underline-offset-2 opacity-80 hover:opacity-100"
        >
          {hostOf(sourceUrl)} ↗
        </a>
      )}
    </span>
  );
}
