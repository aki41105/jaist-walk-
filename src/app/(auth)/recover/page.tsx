'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSent(true);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">メール送信完了</h1>
          <p className="text-gray-600 mb-6">
            登録されたメールアドレスの場合、IDを記載したメールを送信しました。
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-center"
          >
            ログインに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">ID復旧</h1>
          <p className="text-gray-500 mt-1">登録時のメールアドレスを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@jaist.ac.jp"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            {loading ? '送信中...' : 'IDを再送信'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ログインに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
