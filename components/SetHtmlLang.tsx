'use client';

import { useEffect } from 'react';

/**
 * <html lang> düzeltici — App Router'da tek root layout olduğu için ET/FI
 * sayfaları lang="en" ile geliyordu (SEO audit 2026-07-25). Route-group'lu
 * çoklu root layout refactor'una kadar pragmatik çözüm: mount'ta lang'ı düzelt
 * (Google JS render'da doğru değeri görür). Sayfadan çıkışta 'en'e döner.
 */
export default function SetHtmlLang({ lang }: { lang: 'et' | 'fi' }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = 'en'; };
  }, [lang]);
  return null;
}
