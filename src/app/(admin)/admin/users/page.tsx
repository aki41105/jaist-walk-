'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Affiliation, ResearchArea } from '@/types';

interface UserListItem {
  id: string;
  name: string;
  email: string;
  affiliation: Affiliation;
  research_area: ResearchArea;
  role: string;
  points: number;
  capture_count: number;
  created_at: string;
}

interface UsersResponse {
  users: UserListItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const AFFILIATION_LABELS: Record<string, string> = {
  student: '学生',
  faculty: '教員',
  staff: '職員',
  other: 'その他',
};

const AREA_LABELS: Record<string, string> = {
  cs: 'CS',
  is: 'IS',
  ms: 'MS',
  other: 'その他',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (affiliation) params.set('affiliation', affiliation);
    if (researchArea) params.set('research_area', researchArea);
    params.set('sort', sort);
    params.set('order', order);
    params.set('page', String(page));

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError('アクセス権限がありません'); return; }
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setData(json);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [search, affiliation, researchArea, sort, order, page, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const sortIcon = (field: string) => {
    if (sort !== field) return '↕';
    return order === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/admin')}
          className="text-green-600 hover:text-green-700 text-sm font-medium mb-4 block"
        >
          ← 管理画面に戻る
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">ユーザー管理</h1>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ID・名前・メールで検索..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              検索
            </button>
          </form>

          <div className="flex gap-2 flex-wrap">
            <select
              value={affiliation}
              onChange={(e) => { setAffiliation(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">身分: すべて</option>
              <option value="student">学生</option>
              <option value="faculty">教員</option>
              <option value="staff">職員</option>
              <option value="other">その他</option>
            </select>

            <select
              value={researchArea}
              onChange={(e) => { setResearchArea(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">領域: すべて</option>
              <option value="cs">CS</option>
              <option value="is">IS</option>
              <option value="ms">MS</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">名前</th>
                  <th
                    className="px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => handleSort('points')}
                  >
                    ポイント {sortIcon('points')}
                  </th>
                  <th
                    className="px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => handleSort('capture_count')}
                  >
                    捕獲数 {sortIcon('capture_count')}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">身分</th>
                  <th className="px-4 py-3 font-medium text-gray-600">領域</th>
                  <th
                    className="px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => handleSort('created_at')}
                  >
                    登録日 {sortIcon('created_at')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12">
                      <div className="text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/jaileon-green.png" alt="ジャイレオン" width={48} height={48} className="mx-auto animate-bounce mb-2" />
                        <p className="text-gray-500 text-sm">読み込み中...</p>
                      </div>
                    </td>
                  </tr>
                ) : data && data.users.length > 0 ? (
                  data.users.map(user => (
                    <tr
                      key={user.id}
                      onClick={() => router.push(`/admin/points?user=${encodeURIComponent(user.name)}`)}
                      className="border-t border-gray-50 hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.id}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-yellow-500">{user.points}pt</td>
                      <td className="px-4 py-3 text-gray-700">{user.capture_count}</td>
                      <td className="px-4 py-3 text-gray-700">{AFFILIATION_LABELS[user.affiliation] || user.affiliation}</td>
                      <td className="px-4 py-3 text-gray-700">{AREA_LABELS[user.research_area] || user.research_area}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      ユーザーが見つかりません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {data.total}件中 {(data.page - 1) * data.per_page + 1}-{Math.min(data.page * data.per_page, data.total)}件
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  前へ
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {data.page} / {data.total_pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                  disabled={page >= data.total_pages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
