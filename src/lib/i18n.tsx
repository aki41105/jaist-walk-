'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import ja from '@/i18n/ja.json';
import en from '@/i18n/en.json';

export type Locale = 'ja' | 'en';

const messages: Record<Locale, Record<string, unknown>> = { ja, en };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : path;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ja';
  const stored = localStorage.getItem('jw_locale');
  if (stored === 'en' || stored === 'ja') return stored;
  // Detect from browser language
  const browserLang = navigator.language;
  return browserLang.startsWith('ja') ? 'ja' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('jw_locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string): string => getNestedValue(messages[locale], key),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
