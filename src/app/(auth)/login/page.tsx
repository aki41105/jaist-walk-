'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/home';
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push(redirectTo);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🦎</div>
          <h1 className="text-3xl font-bold text-green-700">JAIST Walk</h1>
          <p className="text-gray-500 mt-1">ジャイレオンを捕まえよう！</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              アカウント名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="登録したアカウント名"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              maxLength={50}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/register"
            className="block text-green-600 hover:text-green-700 font-medium"
          >
            新規登録はこちら
          </Link>
          <Link
            href="/recover"
            className="block text-gray-500 hover:text-gray-700 text-sm"
          >
            アカウント名を忘れた方
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            お問い合わせ:{' '}
            <a
              href="mailto:jaist-walk@jaist.ac.jp"
              className="text-green-600 hover:underline"
            >
              jaist-walk@jaist.ac.jp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
