'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';
import { ShareButton } from '@/components/ui/ShareButton';

interface BadgeInfo {
  id: string;
  name_ja: string;
  name_en: string;
  description_ja: string;
  description_en: string;
  icon: string;
  earned: boolean;
  earned_at: string | null;
}

interface BadgesData {
  badges: BadgeInfo[];
  earned_count: number;
  total_count: number;
}

export default function BadgesPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [data, setData] = useState<BadgesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/badges')
      .then(res => {
        if (res.status === 401) { router.push('/login'); return null; }
        return res.json();
      })
      .then(d => { if (d && d.badges) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-500">{t('home.dataLoadFailed')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-yellow-500 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => router.push('/home')} className="text-yellow-100 hover:text-white text-sm">
            {t('common.back')}
          </button>
        </div>
        <h1 className="text-xl font-bold">{t('badges.title')}</h1>
        <p className="text-yellow-100 text-sm mt-1">
          {data.earned_count}/{data.total_count} {t('badges.earned')}
        </p>
      </div>

      {/* Badge Grid */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {data.badges.map(badge => (
          <div
            key={badge.id}
            className={`rounded-2xl shadow p-4 text-center ${
              badge.earned ? 'bg-white' : 'bg-gray-100 opacity-60'
            }`}
          >
            <div className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
              {badge.earned ? badge.icon : '\uD83D\uDD12'}
            </div>
            <p className={`font-bold text-sm ${badge.earned ? 'text-gray-800' : 'text-gray-400'}`}>
              {locale === 'ja' ? badge.name_ja : badge.name_en}
            </p>
            <p className={`text-xs mt-1 ${badge.earned ? 'text-gray-500' : 'text-gray-400'}`}>
              {locale === 'ja' ? badge.description_ja : badge.description_en}
            </p>
            {badge.earned && badge.earned_at && (
              <p className="text-xs text-yellow-600 mt-2">
                {new Date(badge.earned_at).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}
              </p>
            )}
            {badge.earned && (
              <ShareButton
                title={t('badges.shareTitle')}
                text={locale === 'ja'
                  ? `JAIST Walkで「${badge.name_ja}」バッジを獲得した！ #JAISTWalk`
                  : `Earned the "${badge.name_en}" badge in JAIST Walk! #JAISTWalk`
                }
                className="mt-2 text-xs"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
