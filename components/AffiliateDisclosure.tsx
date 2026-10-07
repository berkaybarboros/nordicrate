import Link from 'next/link';

/**
 * Başvuru butonlarının yakınında görünen affiliate açıklaması (tek metin, her yerde aynı).
 *
 * Eskiden açıklama yalnız footer'da ve /how-we-make-money'deydi; ana sayfa ise "No
 * middleman" diyordu — oysa dış linkler /go üzerinden takip linkine sarılıyor. Metin
 * Listing Policy ile aynı sözü verir: ücret ne oranları ne varsayılan sıralamayı değiştirir.
 */
export default function AffiliateDisclosure({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-snug text-slate-500 ${className}`}>
      NordicRate is free to use. Some providers pay us a referral fee when you apply — it never
      changes the rates or the default order we show.{' '}
      <Link href="/how-we-make-money" className="underline hover:text-slate-700">
        How we make money
      </Link>
    </p>
  );
}
