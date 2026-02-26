'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QrLocation } from '@/types';

type LocationWithCount = QrLocation & { scan_count: number };

export default function AdminLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<LocationWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New location form
  const [showForm, setShowForm] = useState(false);
  const [nameJa, setNameJa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [locationNumber, setLocationNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/locations');
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError('アクセス権限がありません'); return; }
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setLocations(json.locations);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setLocations(prev =>
        prev.map(loc => loc.id === id ? { ...loc, is_active: !currentActive } : loc)
      );
    } catch {
      setError('通信エラーが発生しました');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ja: nameJa,
          name_en: nameEn,
          location_number: parseInt(locationNumber, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); return; }
      setLocations(prev => [...prev, { ...data.location, scan_count: 0 }].sort((a, b) => a.location_number - b.location_number));
      setNameJa('');
      setNameEn('');
      setLocationNumber('');
      setShowForm(false);
    } catch {
      setFormError('通信エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: do nothing
    }
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

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">QRロケーション管理</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {showForm ? '閉じる' : '+ 新規追加'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        {/* New Location Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-lg p-4 mb-4 space-y-3">
            <h2 className="font-bold text-gray-800">新規ロケーション追加</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">日本語名</label>
                <input
                  type="text"
                  value={nameJa}
                  onChange={(e) => setNameJa(e.target.value)}
                  placeholder="例: 情報科学棟"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">英語名</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. IS Building"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">番号</label>
                <input
                  type="number"
                  value={locationNumber}
                  onChange={(e) => setLocationNumber(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-gray-800 text-white rounded-xl font-medium text-sm hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
            >
              {submitting ? '追加中...' : '追加する'}
            </button>
          </form>
        )}

        {/* Locations List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">No.</th>
                  <th className="px-4 py-3 font-medium text-gray-600">名前</th>
                  <th className="px-4 py-3 font-medium text-gray-600">状態</th>
                  <th className="px-4 py-3 font-medium text-gray-600">スキャン数</th>
                  <th className="px-4 py-3 font-medium text-gray-600">QRコード</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : locations.length > 0 ? (
                  locations.map(loc => (
                    <tr key={loc.id} className="border-t border-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-600">#{loc.location_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{loc.name_ja}</p>
                        <p className="text-xs text-gray-400">{loc.name_en}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(loc.id, loc.is_active)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            loc.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${loc.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {loc.is_active ? 'アクティブ' : '非アクティブ'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{loc.scan_count}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyCode(loc.code, loc.id)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-mono text-gray-600 transition-colors"
                          title={loc.code}
                        >
                          {copiedId === loc.id ? 'コピー済み!' : `${loc.code.slice(0, 8)}...`}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      ロケーションがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
