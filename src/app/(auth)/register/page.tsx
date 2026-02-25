'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AFFILIATIONS = [
  { value: 'student', label: '学生' },
  { value: 'faculty', label: '教員' },
  { value: 'staff', label: '職員' },
  { value: 'other', label: 'その他' },
];

const RESEARCH_AREAS = [
  { value: 'cs', label: '情報科学 (CS)' },
  { value: 'is', label: '知識科学 (IS)' },
  { value: 'ms', label: 'マテリアルサイエンス (MS)' },
  { value: 'other', label: 'その他' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredId, setRegisteredId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          affiliation,
          research_area: researchArea,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setRegisteredId(data.name);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (registeredId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">登録完了！</h1>
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">アカウント名</p>
            <p className="text-3xl font-bold text-green-700">
              {registeredId}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            このアカウント名でログインできます
          </p>

          <button
            onClick={() => router.push('/home')}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
          >
            はじめる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">新規登録</h1>
          <p className="text-gray-500 mt-1">JAIST Walkに参加しよう</p>
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
              placeholder="ニックネーム"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <p className="text-xs text-orange-600 mb-1">※ JAISTメール以外でお願いします（Gmail等）</p>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700 mb-1">
              身分
            </label>
            <select
              id="affiliation"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">選択してください</option>
              {AFFILIATIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="researchArea" className="block text-sm font-medium text-gray-700 mb-1">
              領域
            </label>
            <select
              id="researchArea"
              value={researchArea}
              onChange={(e) => setResearchArea(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">選択してください</option>
              {RESEARCH_AREAS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-gray-700 space-y-2">
            <p className="font-bold text-yellow-800">注意事項</p>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>IDに紐づいた情報（メールアドレス、身分、領域、QRを読み取った日時）は運営側で記録されます</li>
              <li>大学のメールアドレス以外の使用を推奨します（ご自身の判断でJAISTアドレスも使用可）</li>
              <li>入力したメールアドレスは忘れないようにしてください（ID復旧に必要です）</li>
            </ul>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-600">上記の注意事項を確認しました</span>
          </label>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors"
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            既にIDをお持ちの方
          </Link>
        </div>
      </div>
    </div>
  );
}
