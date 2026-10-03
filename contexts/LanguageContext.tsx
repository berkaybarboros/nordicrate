'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useStorageItem } from '@/lib/use-client-store';
import { en, et, fi, type Translations, type Locale } from '@/locales';

const translations: Record<Locale, Translations> = { en, et, fi };

function isLocale(v: string): v is Locale {
  return v in translations;
}

interface LanguageContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  t: en,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Server render ve hydration 'en' ile; kayıtlı dil hydration'dan hemen sonra uygulanır.
  const [saved, setSaved] = useStorageItem('local', 'nordicrate-locale');
  const locale: Locale = saved && isLocale(saved) ? saved : 'en';

  const setLocale = useCallback((newLocale: Locale) => setSaved(newLocale), [setSaved]);

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
