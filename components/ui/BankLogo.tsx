"use client";

import { useState } from "react";

// Maps bankId/companyId → their primary domain for Clearbit logo fetch
const DOMAIN_MAP: Record<string, string> = {
  // Banks
  lhv: "lhv.ee",
  swedbank: "swedbank.ee",
  seb: "seb.ee",
  luminor: "luminor.ee",
  bigbank: "bigbank.ee",
  coop: "cooppank.ee",
  "coop-pank": "cooppank.ee",
  // Insurance companies
  if: "if.ee",
  "if-insurance": "if.ee",
  ergo: "ergo.ee",
  "ergo-life": "ergo.ee",
  gjensidige: "gjensidige.ee",
  "gjensidige-ee": "gjensidige.ee",
  "swedbank-insurance": "swedbank.ee",
  "lhv-insurance": "lhv.ee",
  "seb-life": "seb.ee",
  "swedbank-life": "swedbank.ee",
  "if-life": "if.ee",
  // Aliases
  "lhv-pank": "lhv.ee",
  "swedbank-ee": "swedbank.ee",
  "seb-ee": "seb.ee",
};

// Emoji fallbacks in case logo fails completely
const EMOJI_FALLBACK: Record<string, string> = {
  lhv: "🏦",
  swedbank: "🟡",
  seb: "🟢",
  luminor: "🔷",
  bigbank: "🔶",
  coop: "🟤",
  if: "🔵",
  ergo: "🟠",
  gjensidige: "🔴",
};

interface BankLogoProps {
  bankId: string;
  name?: string;          // company name — shown as alt text
  size?: number;          // px, default 56
  className?: string;
}

type LoadState = "loading" | "loaded" | "favicon" | "error";

export default function BankLogo({ bankId, name, size = 56, className = "" }: BankLogoProps) {
  const domain = DOMAIN_MAP[bankId.toLowerCase()] ?? null;
  const [state, setState] = useState<LoadState>(domain ? "loading" : "error");

  const clearbitUrl = domain ? `https://logo.clearbit.com/${domain}` : null;
  const faviconUrl  = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
  const fallbackEmoji = EMOJI_FALLBACK[bankId.toLowerCase()] ?? "🏦";

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  };

  if (state === "error" || !clearbitUrl) {
    return (
      <div
        className={`bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-3xl ${className}`}
        style={containerStyle}
        title={name}
      >
        {fallbackEmoji}
      </div>
    );
  }

  if (state === "favicon" && faviconUrl) {
    return (
      <div
        className={`bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden p-1 ${className}`}
        style={containerStyle}
        title={name}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl}
          alt={name ?? bankId}
          width={size - 8}
          height={size - 8}
          className="object-contain"
          onError={() => setState("error")}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden p-2 ${className}`}
      style={containerStyle}
      title={name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={clearbitUrl}
        alt={name ?? bankId}
        width={size - 16}
        height={size - 16}
        className="object-contain"
        onLoad={() => setState("loaded")}
        onError={() => setState(faviconUrl ? "favicon" : "error")}
      />
    </div>
  );
}
