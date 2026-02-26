'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredId, setRegisteredId] = useState('');

  const affiliations = [
    { value: 'student', label: t('register.affiliations.student') },
    { value: 'faculty', label: t('register.affiliations.faculty') },
    { value: 'staff', label: t('register.affiliations.staff') },
    { value: 'other', label: t('register.affiliations.other') },
  ];

  const researchAreas = [
    { value: 'cs', label: t('register.researchAreas.cs') },
    { value: 'is', label: t('register.researchAreas.is') },
    { value: 'ms', label: t('register.researchAreas.ms') },
    { value: 'other', label: t('register.researchAreas.other') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/jaist-walk/api/auth/register', {
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
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  if (registeredId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">{t('register.success.title')}</h1>
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">{t('register.success.yourName')}</p>
            <p className="text-3xl font-bold text-green-700">
              {registeredId}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            {t('register.success.warning')}
          </p>

          <button
            onClick={() => router.push('/home')}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
          >
            {t('register.success.startButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Language toggle */}
        <div className="flex justify-end mb-2">
          <LanguageToggle className="border-green-300 text-green-700 hover:bg-green-50" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">{t('register.title')}</h1>
          <p className="text-gray-500 mt-1">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('register.nameLabel')}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('register.namePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('register.emailLabel')}
            </label>
            <p className="text-xs text-orange-600 mb-1">{t('register.emailNote')}</p>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('register.emailPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700 mb-1">
              {t('register.affiliationLabel')}
            </label>
            <select
              id="affiliation"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">{t('register.affiliationPlaceholder')}</option>
              {affiliations.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="researchArea" className="block text-sm font-medium text-gray-700 mb-1">
              {t('register.researchAreaLabel')}
            </label>
            <select
              id="researchArea"
              value={researchArea}
              onChange={(e) => setResearchArea(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">{t('register.researchAreaPlaceholder')}</option>
              {researchAreas.map((a) => (
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
            {loading ? t('register.registering') : t('register.registerButton')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            {t('register.loginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
