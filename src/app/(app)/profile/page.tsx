'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { UserProfile, AvatarType } from '@/types';
import { useLocale } from '@/lib/i18n';

const AVATAR_KEYS: AvatarType[] = ['green', 'yellow', 'blue', 'rainbow', 'bird'];

const AVATAR_IMAGES: Record<AvatarType, string> = {
  green: '/images/jaileon-green.png',
  yellow: '/images/jaileon-yellow.png',
  blue: '/images/jaileon-blue.png',
  rainbow: '/images/jaileon-logo.png',
  bird: '/images/bird-yellow.png',
};

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
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
        body: JSON.stringify({ name: name.trim(), avatar }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setMessage(t('profile.updated'));
      localStorage.removeItem('jw_profile_cache');
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (!profile) return null;

  const hasChanges = name.trim() !== profile.name || avatar !== (profile.avatar || 'green');

  const affiliationLabel = (key: string) => {
    const map: Record<string, string> = {
      student: t('register.affiliations.student'),
      faculty: t('register.affiliations.faculty'),
      staff: t('register.affiliations.staff'),
      other: t('register.affiliations.other'),
    };
    return map[key] || key;
  };

  const researchAreaLabel = (key: string) => {
    const map: Record<string, string> = {
      cs: t('register.researchAreas.cs'),
      is: t('register.researchAreas.is'),
      ms: t('register.researchAreas.ms'),
      other: t('register.researchAreas.other'),
    };
    return map[key] || key;
  };

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
        <h1 className="text-lg font-bold">{t('profile.title')}</h1>
      </div>

      <div className="px-4 mt-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-5 space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.iconLabel')}
            </label>
            <div className="flex gap-3 justify-center">
              {AVATAR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAvatar(key)}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    avatar === key
                      ? 'ring-3 ring-green-500 bg-green-50 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Image src={AVATAR_IMAGES[key]} alt={t(`profile.avatarLabels.${key}`)} width={48} height={48} className="object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* ID (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.userIdLabel')}
            </label>
            <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm">
              {profile.id}
            </p>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.nameLabel')}
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

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.emailLabel')}
            </label>
            <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm">
              {profile.email}
            </p>
          </div>

          {/* Affiliation (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.affiliationLabel')}
            </label>
            <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm">
              {affiliationLabel(profile.affiliation)}
            </p>
          </div>

          {/* Research area (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.researchAreaLabel')}
            </label>
            <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm">
              {researchAreaLabel(profile.research_area)}
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
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
