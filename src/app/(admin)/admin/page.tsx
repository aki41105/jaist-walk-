'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(searchId.toUpperCase().trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push(`/admin/points?user=${encodeURIComponent(data.id)}`);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">管理画面</h1>
          <button
            onClick={() => router.push('/home')}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            ホームに戻る
          </button>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="searchId" className="block text-sm font-medium text-gray-700 mb-1">
              ユーザーID検索
            </label>
            <input
              id="searchId"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="JW-XXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
              maxLength={9}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors"
          >
            {loading ? '検索中...' : 'ユーザーを検索'}
          </button>
        </form>
      </div>
    </div>
  );
}
