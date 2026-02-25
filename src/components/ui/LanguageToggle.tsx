'use client';

import { useLocale } from '@/lib/i18n';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === 'ja' ? 'en' : 'ja')}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${className}`}
    >
      {locale === 'ja' ? 'EN' : 'JA'}
    </button>
  );
}
