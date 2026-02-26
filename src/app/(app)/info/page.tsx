'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLocale } from '@/lib/i18n';

export default function InfoPage() {
  const router = useRouter();
  const { t } = useLocale();

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
        <h1 className="text-lg font-bold">{t('info.title')}</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* How to play */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">{t('info.howToPlay')}</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-green-600 shrink-0">1.</span>
              <span>{t('info.step1')}</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600 shrink-0">2.</span>
              <span>{t('info.step2')}</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600 shrink-0">3.</span>
              <span>{t('info.step3')}</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600 shrink-0">4.</span>
              <span>{t('info.step4')}</span>
            </li>
          </ol>
        </div>

        {/* Characters */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">{t('info.characters')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Image src="/images/jaileon-green.png" alt="" width={40} height={40} className="w-10 h-10 object-contain shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-green-700">{t('capture.characters.jaileon')}</p>
                <p className="text-xs text-gray-500">{t('info.spawnRate')} 30% ｜ {t('info.catchRate')} 50%</p>
              </div>
              <p className="font-bold text-green-600">100pt</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
              <Image src="/images/jaileon-yellow.png" alt="" width={40} height={40} className="w-10 h-10 object-contain shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-yellow-700">{t('capture.characters.yellow_jaileon')}</p>
                <p className="text-xs text-gray-500">{t('info.spawnRate')} 20% ｜ {t('info.catchRate')} 45%</p>
              </div>
              <p className="font-bold text-yellow-600">150pt</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Image src="/images/jaileon-blue.png" alt="" width={40} height={40} className="w-10 h-10 object-contain shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-blue-700">{t('capture.characters.blue_jaileon')}</p>
                <p className="text-xs text-gray-500">{t('info.spawnRate')} 10% ｜ {t('info.catchRate')} 40%</p>
              </div>
              <p className="font-bold text-blue-600">200pt</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <Image src="/images/jaileon-logo.png" alt="" width={40} height={40} className="w-10 h-10 object-contain shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-purple-700">{t('capture.characters.rainbow_jaileon')}</p>
                <p className="text-xs text-gray-500">{t('info.spawnRate')} 5% ｜ {t('info.catchRate')} 35%（{t('info.superRare')}）</p>
              </div>
              <p className="font-bold text-purple-600">500pt</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <Image src="/images/bird-yellow.png" alt="" width={40} height={40} className="w-10 h-10 object-contain shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-orange-700">{t('capture.characters.bird')}</p>
                <p className="text-xs text-gray-500">{t('info.spawnRate')} 35% ｜ {t('info.catchRate')} 100%</p>
              </div>
              <p className="font-bold text-orange-600">10pt</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-10 h-10 flex items-center justify-center text-2xl shrink-0">💨</span>
              <div className="flex-1">
                <p className="font-bold text-gray-700">{t('info.escapedLabel')}</p>
                <p className="text-xs text-gray-500">{t('info.consolation')}</p>
              </div>
              <p className="font-bold text-gray-500">5pt</p>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">{t('info.rules')}</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-green-500">-</span>
              <span>{t('info.rule1')}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500">-</span>
              <span>{t('info.rule2')}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500">-</span>
              <span>{t('info.rule3')}</span>
            </li>
          </ul>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">{t('info.announcements')}</h2>
          <div className="space-y-3 text-sm">
            <div className="border-l-4 border-green-500 pl-3 py-1">
              <p className="font-medium text-gray-800">{t('info.releaseTitle')}</p>
              <p className="text-xs text-gray-400">{t('info.releaseDate')}</p>
              <p className="text-gray-600 mt-1">{t('info.releaseDesc')}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">{t('info.contact')}</h2>
          <p className="text-sm text-gray-600">
            {t('info.contactDesc')}
          </p>
          <a
            href="mailto:jaist-walk@jaist.ac.jp"
            className="text-green-600 hover:underline text-sm font-medium"
          >
            jaist-walk@jaist.ac.jp
          </a>
        </div>
      </div>
    </div>
  );
}
