'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Announcement {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/jaist-walk/api/admin/announcements');
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) { setError('お知らせの取得に失敗しました'); return; }
      const data = await res.json();
      setAnnouncements(data);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/jaist-walk/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      if (res.ok) {
        setTitle('');
        setBody('');
        await fetchAnnouncements();
      } else {
        const data = await res.json();
        setError(data.error || '作成に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/jaist-walk/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      });
      if (res.ok) {
        setAnnouncements(prev =>
          prev.map(a => a.id === id ? { ...a, is_active: !isActive } : a)
        );
      } else {
        setError('更新に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    }
  };

  const handleDelete = async (id: string, announcementTitle: string) => {
    if (!confirm(`「${announcementTitle}」を削除しますか？`)) return;

    try {
      const res = await fetch('/jaist-walk/api/admin/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      } else {
        setError('削除に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/jaist-walk/images/jaileon-green.png" alt="ジャイレオン" width={64} height={64} className="mx-auto animate-bounce mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">お知らせ管理</h1>
          <button
            onClick={() => router.push('/admin')}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            ← 管理画面
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        {/* Create Form */}
        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow p-4 mb-6 space-y-3">
          <h2 className="font-bold text-gray-800">新規お知らせ作成</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="お知らせのタイトル"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">本文</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="お知らせの内容を入力..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !body.trim()}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? '作成中...' : '作成'}
          </button>
        </form>

        {/* Announcements List */}
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
              お知らせがありません
            </div>
          ) : (
            announcements.map(announcement => (
              <div key={announcement.id} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-gray-800 flex-1 min-w-0">{announcement.title}</h3>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      announcement.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {announcement.is_active ? '公開中' : '非公開'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{announcement.body}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDate(announcement.created_at)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(announcement.id, announcement.is_active)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        announcement.is_active
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {announcement.is_active ? '非公開にする' : '公開する'}
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id, announcement.title)}
                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
