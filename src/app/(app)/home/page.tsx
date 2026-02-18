'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile, PointTransaction, Scan } from '@/types';
import Image from 'next/image';
import { QRCode } from '@/components/ui/QRCode';

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [activeTab, setActiveTab] = useState<'scans' | 'points'>('scans');

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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🦎</div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">データの読み込みに失敗しました</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 bg-green-600 text-white rounded-xl"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">JAIST Walk</h1>
          <button
            onClick={handleLogout}
            className="text-green-100 hover:text-white text-sm"
          >
            ログアウト
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center overflow-hidden">
            <Image
              src="/images/jaileon-green.png"
              alt="Jaileon"
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
            <p className="text-xs text-gray-500 mt-1">捕獲数</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-500">{profile.points}</p>
            <p className="text-xs text-gray-500 mt-1">ポイント</p>
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
          QR スキャン
        </button>
      </div>

      {/* Personal QR Code */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setShowQr(!showQr)}
          className="w-full bg-white rounded-2xl shadow p-4 flex items-center justify-between"
        >
          <span className="font-medium text-gray-700">個人QRコード</span>
          <span className="text-gray-400">{showQr ? '▲' : '▼'}</span>
        </button>
        {showQr && (
          <div className="bg-white rounded-b-2xl shadow px-4 pb-4 flex justify-center">
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <QRCode
                data={`${typeof window !== 'undefined' ? window.location.origin : ''}/admin/points?user=${encodeURIComponent(profile.name)}`}
                size={200}
              />
              <p className="text-xs text-gray-500 mt-3">ポイント利用時に運営へ提示してください</p>
            </div>
          </div>
        )}
      </div>

      {/* History Tabs */}
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
            スキャン履歴
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'points'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            ポイント履歴
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {activeTab === 'scans' ? (
            profile.recent_scans.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>まだスキャンしていません</p>
                <p className="text-sm mt-1">QRコードを探しに行こう！</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {profile.recent_scans.map((scan: Scan & { location_name: string }) => (
                  <div key={scan.id} className="p-4 flex items-center gap-3">
                    <div className="text-2xl">
                      {scan.outcome === 'jaileon' ? '🦎' : '🐦'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{scan.location_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(scan.scanned_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <p className={`font-bold text-sm ${
                      scan.outcome === 'jaileon' ? 'text-green-600' : 'text-yellow-500'
                    }`}>
                      +{scan.points_earned}pt
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : (
            profile.recent_transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>ポイント履歴はありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {profile.recent_transactions.map((tx: PointTransaction) => (
                  <div key={tx.id} className="p-4 flex items-center gap-3">
                    <div className="text-2xl">
                      {tx.amount > 0 ? '➕' : '➖'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{tx.reason}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        tx.amount > 0 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}pt
                      </p>
                      <p className="text-xs text-gray-400">{tx.balance_after}pt</p>
                    </div>
                  </div>
                ))}
              </div>
            )
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
            管理画面
          </button>
        </div>
      )}
    </div>
  );
}
