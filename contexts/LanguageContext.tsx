'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { en, et, fi, type Translations, type Locale } from '@/locales';

const translations: Record<Locale, Translations> = { en, et, fi };

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
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nordicrate-locale') as Locale | null;
      if (saved && ['en', 'fi', 'et'].includes(saved)) {
        setLocaleState(saved);
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nordicrate-locale', newLocale);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
