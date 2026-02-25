'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

/** Resize image on client side using canvas (max 200x200) */
function resizeImage(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
      } else {
        if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      // Fill white background to prevent transparent areas from becoming black
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas conversion failed')),
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarType>('green');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      setAvatarUrl(data.avatar_url || null);
      setUseCustomAvatar(!!data.avatar_url);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setMessage('');
    setUploading(true);

    try {
      const resized = await resizeImage(file, 200);
      const formData = new FormData();
      formData.append('file', resized, 'avatar.jpg');

      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setAvatarUrl(data.avatar_url);
      setUseCustomAvatar(true);
      setMessage(t('profile.updated'));
      localStorage.removeItem('jw_profile_cache');
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveCustomAvatar = async () => {
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), avatar, avatar_url: null }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setAvatarUrl(null);
      setUseCustomAvatar(false);
      setMessage(t('profile.updated'));
      localStorage.removeItem('jw_profile_cache');
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPreset = (key: AvatarType) => {
    setAvatar(key);
    setUseCustomAvatar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatar,
          // Clear avatar_url when switching back to preset
          ...(useCustomAvatar ? {} : { avatar_url: null }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      if (!useCustomAvatar) {
        setAvatarUrl(null);
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

  const hasChanges =
    name.trim() !== profile.name ||
    avatar !== (profile.avatar || 'green') ||
    (useCustomAvatar !== !!profile.avatar_url);

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

  // Current display avatar
  const displayAvatarSrc = useCustomAvatar && avatarUrl
    ? avatarUrl
    : AVATAR_IMAGES[avatar];

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
          {/* Current avatar preview */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayAvatarSrc}
                alt="Avatar"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>

          {/* Avatar selector: presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.iconLabel')}
            </label>
            <div className="flex gap-3 justify-center flex-wrap">
              {AVATAR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPreset(key)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    !useCustomAvatar && avatar === key
                      ? 'ring-3 ring-green-500 bg-green-50 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Image src={AVATAR_IMAGES[key]} alt={t(`profile.avatarLabels.${key}`)} width={40} height={40} className="object-contain" />
                </button>
              ))}

              {/* Custom upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  useCustomAvatar
                    ? 'ring-3 ring-green-500 bg-green-50 scale-110'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {uploading ? (
                  <span className="text-xs text-gray-400 animate-pulse">...</span>
                ) : avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatarUrl} alt="Custom" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <span className="text-2xl text-gray-400">+</span>
                )}
              </button>
            </div>

            {useCustomAvatar && avatarUrl && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleRemoveCustomAvatar}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  カスタム画像を削除
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-400 text-center mt-2">
              +ボタンで好きな画像をアップロード（JPEG/PNG/WebP、2MB以下）
            </p>
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
