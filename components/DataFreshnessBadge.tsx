'use client';

import { useEffect, useState } from 'react';

interface BadgeData {
  fetchedAt: string;
  success: boolean;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DataFreshnessBadge() {
  const [data, setData] = useState<BadgeData | null>(null);

  useEffect(() => {
    fetch('/api/rates')
      .then(r => r.json())
      .then((d: BadgeData) => setData(d))
      .catch(() => null);
  }, []);

  if (!data) return null;

  const isLive = data.success;
  const label = isLive
    ? `Live rates · updated ${timeAgo(data.fetchedAt)}`
    : `Reference rates · last verified ${timeAgo(data.fetchedAt)}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
        isLive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
      />
      {label}
    </span>
  );
}
