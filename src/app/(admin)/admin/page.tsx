'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  total_users: number;
  today_scans: number;
  active_qr_codes: number;
  total_points_distributed: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch('/jaist-walk/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.total_users !== undefined) setStats(data);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const navItems = [
    { href: '/admin/announcements', label: 'お知らせ管理', desc: 'お知らせの作成・編集・公開管理', icon: '📢' },
    { href: '/admin/users', label: 'ユーザー管理', desc: 'ユーザー一覧・検索・フィルター', icon: '👤' },
    { href: '/admin/locations', label: 'QRロケーション', desc: 'QRコード管理・追加・状態切替', icon: '📍' },
    { href: '/admin/stats', label: 'スキャン統計', desc: '日別スキャン数・ランキング・分布', icon: '📊' },
    { href: '/admin/rewards', label: '景品管理', desc: '景品の追加・在庫管理・有効/無効切替', icon: '🎁' },
    { href: '/admin/exchanges', label: '交換チケット', desc: 'ポイント交換チケットの管理・使用処理', icon: '🎫' },
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/home')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="text-xl text-gray-600">&larr;</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">管理画面</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {statsLoading ? (
            <div className="col-span-2 flex justify-center py-8">
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/jaist-walk/images/jai01-front.png" alt="ジャイレオン" width={64} height={64} className="mx-auto animate-bounce mb-4" />
                <p className="text-gray-500">読み込み中...</p>
              </div>
            </div>
          ) : stats ? (
            <>
              <div className="bg-white rounded-2xl shadow p-4">
                <p className="text-xs text-gray-500">総ユーザー数</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total_users}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <p className="text-xs text-gray-500">今日のスキャン</p>
                <p className="text-2xl font-bold text-blue-600">{stats.today_scans}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <p className="text-xs text-gray-500">アクティブQR</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_qr_codes}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <p className="text-xs text-gray-500">総配布ポイント</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.total_points_distributed.toLocaleString()}</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Navigation Links */}
        <div className="space-y-3">
          {navItems.map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="w-full bg-white rounded-2xl shadow p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-bold text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
