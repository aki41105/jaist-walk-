'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';

interface Reward {
  id: string;
  name_ja: string;
  name_en: string;
  description_ja: string;
  description_en: string;
  required_points: number;
  stock: number;
}

interface Exchange {
  id: string;
  points_spent: number;
  status: string;
  exchange_code: string;
  created_at: string;
  rewards: { name_ja: string; name_en: string } | null;
}

export default function ExchangePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exchanging, setExchanging] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [rewardsRes, exchangesRes, profileRes] = await Promise.all([
        fetch('/api/rewards'),
        fetch('/api/exchange'),
        fetch('/api/auth/me'),
      ]);

      if (profileRes.status === 401) { router.push('/login'); return; }

      const [rewardsData, exchangesData, profileData] = await Promise.all([
        rewardsRes.json(),
        exchangesRes.json(),
        profileRes.json(),
      ]);

      if (Array.isArray(rewardsData)) setRewards(rewardsData);
      if (Array.isArray(exchangesData)) setExchanges(exchangesData);
      setUserPoints(profileData.points || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExchange = async (rewardId: string, rewardName: string, requiredPoints: number) => {
    if (!confirm(t('exchange.confirmExchange').replace('{name}', rewardName).replace('{points}', String(requiredPoints)))) {
      return;
    }

    setExchanging(rewardId);
    setError(null);
    setSuccessCode(null);

    try {
      const res = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: rewardId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccessCode(data.exchange_code);
      setUserPoints(data.points_after);
      await fetchData();
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setExchanging(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-purple-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => router.push('/home')} className="text-purple-200 hover:text-white text-sm">
            {t('common.back')}
          </button>
        </div>
        <h1 className="text-xl font-bold">{t('exchange.title')}</h1>
        <div className="mt-2 bg-purple-500 rounded-xl p-3 flex items-center justify-between">
          <span className="text-purple-100 text-sm">{t('exchange.currentPoints')}</span>
          <span className="text-2xl font-bold">{userPoints}pt</span>
        </div>
      </div>

      {/* Success modal */}
      {successCode && (
        <div className="px-4 mt-4">
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center">
            <p className="text-green-600 font-bold text-lg mb-2">{t('exchange.success')}</p>
            <p className="text-3xl font-mono font-bold text-green-700 mb-2">{successCode}</p>
            <p className="text-sm text-green-600">{t('exchange.showToStaff')}</p>
            <button
              onClick={() => setSuccessCode(null)}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 mt-4">
          <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="px-4 mt-4 space-y-3">
        {rewards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
            <p>{t('exchange.noRewards')}</p>
          </div>
        ) : (
          rewards.map(reward => (
            <div key={reward.id} className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800">
                  {locale === 'ja' ? reward.name_ja : reward.name_en}
                </h3>
                <span className="text-sm text-gray-400">
                  {t('exchange.stock')}: {reward.stock}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {locale === 'ja' ? reward.description_ja : reward.description_en}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-600">{reward.required_points}pt</span>
                <button
                  onClick={() => handleExchange(
                    reward.id,
                    locale === 'ja' ? reward.name_ja : reward.name_en,
                    reward.required_points
                  )}
                  disabled={
                    userPoints < reward.required_points ||
                    reward.stock <= 0 ||
                    exchanging === reward.id
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    userPoints >= reward.required_points && reward.stock > 0
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {exchanging === reward.id ? t('common.loading') : t('exchange.exchangeButton')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Exchange History */}
      {exchanges.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-bold text-gray-800 mb-3">{t('exchange.history')}</h2>
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-50">
            {exchanges.map(ex => (
              <div key={ex.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {locale === 'ja' ? ex.rewards?.name_ja : ex.rewards?.name_en}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(ex.created_at).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-1">{ex.exchange_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-600">-{ex.points_spent}pt</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ex.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    ex.status === 'used' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {t(`exchange.status.${ex.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
