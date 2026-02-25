'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { UserProfile, AvatarType } from '@/types';

const AVATAR_OPTIONS: { value: AvatarType; label: string; image: string }[] = [
  { value: 'green', label: '緑', image: '/images/jaileon-green.png' },
  { value: 'yellow', label: '黄', image: '/images/jaileon-yellow.png' },
  { value: 'blue', label: '青', image: '/images/jaileon-blue.png' },
  { value: 'rainbow', label: '虹', image: '/images/jaileon-logo.png' },
  { value: 'bird', label: '鳥', image: '/images/bird-yellow.png' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<AvatarType>('green');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setProfile(data);
      setName(data.name);
      setEmail(data.email);
      setAvatar(data.avatar || 'green');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), avatar }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setMessage('プロフィールを更新しました');
      localStorage.removeItem('jw_profile_cache');
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!profile) return null;

  const hasChanges = name.trim() !== profile.name || email.trim() !== profile.email || avatar !== (profile.avatar || 'green');

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/home')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 transition-colors"
        >
          <span className="text-xl">&larr;</span>
        </button>
        <h1 className="text-lg font-bold">プロフィール編集</h1>
      </div>

      <div className="px-4 mt-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-5 space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アイコン
            </label>
            <div className="flex gap-3 justify-center">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAvatar(opt.value)}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    avatar === opt.value
                      ? 'ring-3 ring-green-500 bg-green-50 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Image src={opt.image} alt={opt.label} width={48} height={48} className="object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* ID (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ユーザーID
            </label>
            <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm">
              {profile.id}
            </p>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              アカウント名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              maxLength={50}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Affiliation (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              身分
            </label>
            <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm">
              {profile.affiliation === 'student' ? '学生' :
               profile.affiliation === 'faculty' ? '教員' :
               profile.affiliation === 'staff' ? '職員' : 'その他'}
            </p>
          </div>

          {/* Research area (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              領域
            </label>
            <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm">
              {profile.research_area === 'cs' ? '情報科学 (CS)' :
               profile.research_area === 'is' ? '知識科学 (IS)' :
               profile.research_area === 'ms' ? 'マテリアルサイエンス (MS)' : 'その他'}
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}

          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  );
}
