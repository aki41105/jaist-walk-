'use client';

import { useState } from 'react';
import { shareContent } from '@/lib/share';
import { useLocale } from '@/lib/i18n';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url, className = '' }: ShareButtonProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const result = await shareContent({ title, text, url });
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors ${className}`}
    >
      {copied ? (
        <>
          <span>{t('share.copied')}</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>{t('share.button')}</span>
        </>
      )}
    </button>
  );
}
