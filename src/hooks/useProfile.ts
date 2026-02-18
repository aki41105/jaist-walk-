'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/types';

export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/auth/me');

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setProfile(data);
      localStorage.setItem('jw_profile_cache', JSON.stringify(data));
      localStorage.setItem('jw_profile_updated', new Date().toISOString());
    } catch {
      const cached = localStorage.getItem('jw_profile_cache');
      if (cached) {
        setProfile(JSON.parse(cached));
      }
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
