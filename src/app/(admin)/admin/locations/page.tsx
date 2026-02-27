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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameJa, setEditNameJa] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch('/jaist-walk/api/admin/locations');
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
      const res = await fetch('/jaist-walk/api/admin/locations', {
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

  const startEdit = (loc: LocationWithCount) => {
    setEditingId(loc.id);
    setEditNameJa(loc.name_ja);
    setEditNameEn(loc.name_en);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNameJa('');
    setEditNameEn('');
  };

  const saveEdit = async () => {
    if (!editingId || !editNameJa.trim() || !editNameEn.trim()) return;
    setEditSaving(true);
    setError('');

    try {
      const res = await fetch('/jaist-walk/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name_ja: editNameJa.trim(), name_en: editNameEn.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setLocations(prev =>
        prev.map(loc => loc.id === editingId ? { ...loc, name_ja: editNameJa.trim(), name_en: editNameEn.trim() } : loc)
      );
      setEditingId(null);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setEditSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/jaist-walk/api/admin/locations', {
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
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/admin')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="text-xl text-gray-600">&larr;</span>
          </button>
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
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/jaist-walk/images/jaileon-green.png" alt="ジャイレオン" width={64} height={64} className="mx-auto animate-bounce mb-4" />
                <p className="text-gray-500">読み込み中...</p>
              </div>
            </div>
          ) : locations.length > 0 ? (
            locations.map(loc => (
              <div key={loc.id} className="bg-white rounded-2xl shadow p-4">
                {editingId === loc.id ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-gray-500">#{loc.location_number}</span>
                      <span className="text-xs text-blue-600 font-medium">編集中</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">日本語名</label>
                        <input
                          type="text"
                          value={editNameJa}
                          onChange={(e) => setEditNameJa(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">英語名</label>
                        <input
                          type="text"
                          value={editNameEn}
                          onChange={(e) => setEditNameEn(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={editSaving || !editNameJa.trim() || !editNameEn.trim()}
                        className="flex-1 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900 disabled:bg-gray-400"
                      >
                        {editSaving ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-500 shrink-0">#{loc.location_number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{loc.name_ja}</p>
                      <p className="text-xs text-gray-400 truncate">{loc.name_en}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">{loc.scan_count}回</span>
                      <button
                        onClick={() => handleToggle(loc.id, loc.is_active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          loc.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${loc.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {loc.is_active ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => copyCode(loc.code, loc.id)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-mono text-gray-600 transition-colors"
                        title={loc.code}
                      >
                        {copiedId === loc.id ? 'OK!' : 'UUID'}
                      </button>
                      <button
                        onClick={() => startEdit(loc)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs text-blue-600 font-medium transition-colors"
                      >
                        編集
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
              ロケーションがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
