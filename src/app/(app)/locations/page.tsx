'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';

interface LocationProgress {
  id: string;
  name_ja: string;
  name_en: string;
  location_number: number;
  visited: boolean;
  visited_date: string | null;
}

interface ProgressData {
  locations: LocationProgress[];
  visited_count: number;
  total_count: number;
}

export default function LocationsPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/jaist-walk/api/locations/progress')
      .then(res => {
        if (res.status === 401) { router.push('/login'); return null; }
        return res.json();
      })
      .then(d => { if (d && d.locations) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/jaist-walk/images/jaileon-green.png" alt="ジャイレオン" width={64} height={64} className="mx-auto animate-bounce mb-4" />
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
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

  const pct = data.total_count > 0 ? Math.round((data.visited_count / data.total_count) * 100) : 0;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => router.push('/home')} className="text-green-100 hover:text-white text-sm">
            {t('common.back')}
          </button>
        </div>
        <h1 className="text-xl font-bold">{t('locations.title')}</h1>
        <p className="text-green-100 text-sm mt-1">{t('locations.subtitle')}</p>
      </div>

      {/* Progress */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {data.visited_count}/{data.total_count} {t('locations.completed')}
            </span>
            <span className="text-sm font-bold text-green-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Location List */}
      <div className="px-4 mt-4 space-y-2">
        {data.locations.map(loc => (
          <div
            key={loc.id}
            className={`rounded-2xl shadow p-4 flex items-center gap-3 ${
              loc.visited ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              loc.visited
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-500'
            }`}>
              {loc.location_number}
            </div>
            <div className="flex-1">
              <p className={`font-medium text-sm ${loc.visited ? 'text-green-800' : 'text-gray-500'}`}>
                {locale === 'ja' ? loc.name_ja : loc.name_en}
              </p>
              {loc.visited && loc.visited_date && (
                <p className="text-xs text-green-600">
                  {t('locations.firstVisit')}: {new Date(loc.visited_date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}
                </p>
              )}
            </div>
            <span className="text-xl">
              {loc.visited ? '\u2713' : '\uD83D\uDD12'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
