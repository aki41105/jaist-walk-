'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile, Scan, AvatarType } from '@/types';
import Image from 'next/image';
import { QRCode } from '@/components/ui/QRCode';
import { useLocale } from '@/lib/i18n';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

const AVATAR_IMAGES: Record<AvatarType, string> = {
  green: '/images/jaileon-green.png',
  yellow: '/images/jaileon-yellow.png',
  blue: '/images/jaileon-blue.png',
  rainbow: '/images/jaileon-logo.png',
  bird: '/images/bird-yellow.png',
};

interface RankingEntry {
  name: string;
  points: number;
  capture_count: number;
  avatar: AvatarType | null;
}

export default function HomePage() {
  const router = useRouter();
  const { t } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [activeTab, setActiveTab] = useState<'scans' | 'ranking'>('scans');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setProfile(data);

      // Cache for offline
      localStorage.setItem('jw_profile_cache', JSON.stringify(data));
      localStorage.setItem('jw_profile_updated', new Date().toISOString());
    } catch {
      // Try loading from cache
      const cached = localStorage.getItem('jw_profile_cache');
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchRanking = useCallback(async () => {
    setRankingLoading(true);
    try {
      const res = await fetch('/api/ranking');
      if (res.ok) {
        const data = await res.json();
        setRanking(data);
      }
    } catch {
      // ignore
    } finally {
      setRankingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (activeTab === 'ranking' && ranking.length === 0) {
      fetchRanking();
    }
  }, [activeTab, ranking.length, fetchRanking]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t('home.deleteConfirm1'))) return;
    if (!confirm(t('home.deleteConfirm2'))) return;

    try {
      const res = await fetch('/api/auth/delete', { method: 'POST' });
      if (res.ok) {
        localStorage.removeItem('jw_profile_cache');
        localStorage.removeItem('jw_profile_updated');
        router.push('/login');
      } else {
        const data = await res.json();
        alert(data.error || t('errors.deleteFailed'));
      }
    } catch {
      alert(t('errors.networkError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Image src="/images/jaileon-logo.png" alt="ジャイレオン" width={64} height={64} className="mx-auto animate-bounce mb-4" />
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('home.dataLoadFailed')}</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 bg-green-600 text-white rounded-xl"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  const getRankMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{t('common.appName')}</h1>
          <div className="flex items-center gap-2">
            <LanguageToggle className="border-green-400 text-green-100 hover:bg-green-500" />
            <button
              onClick={handleLogout}
              className="text-green-100 hover:text-white text-sm"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center overflow-hidden">
            <Image
              src={AVATAR_IMAGES[profile.avatar || 'green']}
              alt="アバター"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-xl font-bold">{profile.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{profile.capture_count}</p>
            <p className="text-xs text-gray-500 mt-1">{t('home.captureCount')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-500">{profile.points}</p>
            <p className="text-xs text-gray-500 mt-1">{t('home.points')}</p>
          </div>
        </div>
      </div>

      {/* QR Scan Button */}
      <div className="px-4 mt-4">
        <button
          onClick={() => router.push('/scan')}
          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-3 animate-pulse-glow"
        >
          <span className="text-2xl">📷</span>
          {t('home.scanButton')}
        </button>
      </div>

      {/* Quick links */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push('/info')}
          className="py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-2xl shadow transition-colors flex items-center justify-center gap-2"
        >
          <span>📖</span>
          {t('home.howToPlay')}
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-2xl shadow transition-colors flex items-center justify-center gap-2"
        >
          <span>⚙️</span>
          {t('home.profile')}
        </button>
      </div>

      {/* Personal QR Code */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setShowQr(!showQr)}
          className="w-full bg-white rounded-2xl shadow p-4 flex items-center justify-between"
        >
          <span className="font-medium text-gray-700">{t('home.personalQr')}</span>
          <span className="text-gray-400">{showQr ? '▲' : '▼'}</span>
        </button>
        {showQr && (
          <div className="bg-white rounded-b-2xl shadow px-4 pb-4 flex justify-center">
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <QRCode
                data={`${typeof window !== 'undefined' ? window.location.origin : ''}/admin/points?user=${encodeURIComponent(profile.name)}`}
                size={200}
              />
              <p className="text-xs text-gray-500 mt-3">{t('home.qrHint')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-3">
          <button
            onClick={() => setActiveTab('scans')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'scans'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {t('home.scanHistory')}
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'ranking'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {t('home.ranking')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {activeTab === 'scans' ? (
            profile.recent_scans.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>{t('home.noScans')}</p>
                <p className="text-sm mt-1">{t('home.noScansHint')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {profile.recent_scans.map((scan: Scan & { location_name: string }) => (
                  <div key={scan.id} className="p-4 flex items-center gap-3">
                    <div className="text-2xl">
                      {scan.outcome === 'rainbow_jaileon' ? '🌈' :
                       scan.outcome === 'blue_jaileon' ? '💙' :
                       scan.outcome === 'yellow_jaileon' ? '💛' :
                       scan.outcome === 'jaileon' ? '🦎' : '🐦'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{scan.location_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(scan.scanned_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <p className={`font-bold text-sm ${
                      scan.outcome === 'rainbow_jaileon' ? 'text-purple-600' :
                      scan.outcome === 'blue_jaileon' ? 'text-blue-600' :
                      scan.outcome === 'yellow_jaileon' ? 'text-yellow-600' :
                      scan.outcome === 'jaileon' ? 'text-green-600' : 'text-yellow-500'
                    }`}>
                      +{scan.points_earned}pt
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : rankingLoading ? (
            <div className="p-8 text-center text-gray-400">
              <p>{t('common.loading')}</p>
            </div>
          ) : ranking.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>{t('home.noRanking')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {ranking.map((entry, index) => (
                <div
                  key={entry.name}
                  className={`p-4 flex items-center gap-3 ${
                    entry.name === profile.name ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="w-8 text-center text-xl font-bold">
                    {getRankMedal(index)}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                      src={AVATAR_IMAGES[entry.avatar || 'green']}
                      alt=""
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      entry.name === profile.name ? 'text-green-700' : ''
                    }`}>
                      {entry.name}
                      {entry.name === profile.name && (
                        <span className="text-xs text-green-500 ml-1">YOU</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('home.captureCount')}: {entry.capture_count}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-yellow-500">
                    {entry.points}pt
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin link (if admin) */}
      {profile.role === 'admin' && (
        <div className="px-4 mt-4">
          <button
            onClick={() => router.push('/admin')}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-colors"
          >
            {t('common.admin')}
          </button>
        </div>
      )}

      {/* Delete account */}
      <div className="px-4 mt-8 mb-4">
        <button
          onClick={handleDeleteAccount}
          className="w-full py-2 text-red-400 hover:text-red-600 text-xs transition-colors"
        >
          {t('home.deleteAccount')}
        </button>
      </div>
    </div>
  );
}
