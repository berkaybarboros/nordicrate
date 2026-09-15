import Link from 'next/link';

/**
 * MatchCta — organik trafiğin indiği sayfalardan (ülke + blog) onboarding'e giriş.
 * 2026-09-15: onboarding yalnızca kayıt sonrası açılıyordu, hero CTA'sı 60 günde
 * 2 kez tıklandı; oysa trafik ülke/blog sayfalarına iniyor. Ülke ön-seçili gelir.
 */
export default function MatchCta({ country, tone = 'dark' }: { country?: string; tone?: 'dark' | 'light' }) {
  const href = country ? `/onboarding?country=${country}` : '/onboarding';
  const dark = tone === 'dark';
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl px-5 py-4 ${dark ? 'bg-white/5 border border-white/10' : 'bg-sky-50 border border-sky-100'}`}>
      <div className="flex-1">
        <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Not sure which bank will lend to you?</p>
        <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          4 quick questions, no sign-up, no credit check — we show offers that fit your situation.
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex justify-center bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0"
      >
        Match me in 30 seconds →
      </Link>
    </div>
  );
}
