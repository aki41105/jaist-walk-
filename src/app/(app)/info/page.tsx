'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLocale } from '@/lib/i18n';
import { getCharactersByRarity, RARITY_CONFIG, type Rarity } from '@/lib/characters';

export default function InfoPage() {
  const router = useRouter();
  const { t, locale } = useLocale();

  const charsByRarity = getCharactersByRarity();
  const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'super_rare', 'morning', 'bird'];

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

        {/* Characters by rarity */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">{t('info.characters')}</h2>
          <div className="space-y-4">
            {rarityOrder.map(rarity => {
              const chars = charsByRarity[rarity];
              if (chars.length === 0) return null;
              const rarityConf = RARITY_CONFIG[rarity];
              return (
                <div key={rarity}>
                  <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2 ${rarityConf.bgColor} ${rarityConf.color}`}>
                    {locale === 'ja' ? rarityConf.labelJa : rarityConf.labelEn}
                  </div>
                  <div className="space-y-2">
                    {chars.map(char => (
                      <div key={char.id} className={`flex items-center gap-3 p-3 ${char.bgCard} rounded-xl`}>
                        <Image
                          src={`/jaist-walk/images/${char.image}`}
                          alt=""
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${char.color}`}>
                            {locale === 'ja' ? char.nameJa : char.nameEn}
                          </p>
                          <p className="text-xs text-gray-500">
                            {rarity === 'morning'
                              ? (locale === 'ja' ? '朝7〜10時限定・初回スキャン' : 'Morning 7-10AM · First scan')
                              : rarity === 'bird'
                              ? `${t('info.spawnRate')} ${char.spawnRate}%`
                              : `${t('info.spawnRate')} ${char.spawnRate}% ｜ ${t('info.catchRate')} ${Math.round(char.catchRate * 100)}%`
                            }
                          </p>
                        </div>
                        <p className={`font-bold text-sm shrink-0 ${char.color}`}>{char.points}pt</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Escaped consolation */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-10 h-10 flex items-center justify-center text-2xl shrink-0">💨</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-700">{t('info.escapedLabel')}</p>
                <p className="text-xs text-gray-500">{t('info.consolation')}</p>
              </div>
              <p className="font-bold text-sm text-gray-500">5pt</p>
            </div>
          </div>
        </div>

        {/* Streak bonuses */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">{t('info.streakTitle')}</h2>
          <p className="text-sm text-gray-600 mb-3">{t('info.streakDesc')}</p>
          <div className="space-y-2">
            {[
              { days: 3, bonus: 50 },
              { days: 7, bonus: 150 },
              { days: 14, bonus: 300 },
              { days: 30, bonus: 500 },
            ].map(({ days, bonus }) => (
              <div key={days} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-700">
                  {days}{locale === 'ja' ? '日連続' : '-day streak'}
                </span>
                <span className="font-bold text-orange-600">+{bonus}pt</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">{t('info.morningNote')}</p>
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
            <li className="flex gap-2">
              <span className="text-green-500">-</span>
              <span>{t('info.rule4')}</span>
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
            href="mailto:laboratry@ml.jaist.ac.jp"
            className="text-green-600 hover:underline text-sm font-medium"
          >
            laboratry@ml.jaist.ac.jp
          </a>
        </div>
      </div>
    </div>
  );
}
