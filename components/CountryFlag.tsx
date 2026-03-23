'use client';

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 country code, e.g. "DK", "EE" */
  code: string;
  /** Display size in pixels (width). Height = size * 0.75 for 4:3 flags */
  size?: number;
  className?: string;
  /** Alt text override; defaults to "{code} flag" */
  alt?: string;
  /** Rounded corners style */
  rounded?: 'none' | 'sm' | 'md' | 'full';
}

const ROUNDED_CLASS: Record<string, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded',
  full: 'rounded-full',
};

/**
 * Real country flag image via flagcdn.com.
 * Docs: https://flagcdn.com/
 * Uses a plain <img> with srcSet so Next.js doesn't interfere with the
 * external URL; `unoptimized` on next/image doesn't support srcSet.
 *
 * Available CDN widths: 20, 40, 80, 160, 320, 640, 1280
 */
export default function CountryFlag({
  code,
  size = 32,
  className = '',
  alt,
  rounded = 'sm',
}: CountryFlagProps) {
  const lower = code.toLowerCase();
  // Pick CDN width at least as large as the display size
  const cdnWidth = size <= 20 ? 20 : size <= 40 ? 40 : size <= 80 ? 80 : 160;
  const cdnWidth2x = Math.min(cdnWidth * 2, 640);

  const src = `https://flagcdn.com/w${cdnWidth}/${lower}.png`;
  const srcSet = `https://flagcdn.com/w${cdnWidth}/${lower}.png 1x, https://flagcdn.com/w${cdnWidth2x}/${lower}.png 2x`;
  const height = Math.round(size * 0.75);
  const roundedClass = ROUNDED_CLASS[rounded] ?? '';

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      alt={alt ?? `${code} flag`}
      width={size}
      height={height}
      className={`object-cover shadow-sm border border-slate-200/60 ${roundedClass} ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}
