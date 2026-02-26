'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { CaptureState, CaptureOutcome, CaptureResponse } from '@/types';
import { Confetti } from './Confetti';
import { NetAnimation } from './NetAnimation';
import { useLocale } from '@/lib/i18n';
import { ShareButton } from '@/components/ui/ShareButton';

interface CaptureGameProps {
  qrCode: string;
  onComplete: () => void;
}

export function CaptureGame({ qrCode, onComplete }: CaptureGameProps) {
  const { t, locale } = useLocale();
  const [state, setState] = useState<CaptureState>('LOADING');
  const [outcome, setOutcome] = useState<CaptureOutcome | null>(null);
  const [captured, setCaptured] = useState<boolean>(true);
  const [result, setResult] = useState<CaptureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isJaileonType = outcome !== null && outcome !== 'bird';

  const outcomeConfig: Record<string, { color: string; bgGradient: string; btnColor: string }> = {
    jaileon: { color: 'text-green-700', bgGradient: 'bg-gradient-to-b from-green-100 to-green-50', btnColor: 'bg-green-600 hover:bg-green-700' },
    yellow_jaileon: { color: 'text-yellow-700', bgGradient: 'bg-gradient-to-b from-yellow-100 to-yellow-50', btnColor: 'bg-yellow-500 hover:bg-yellow-600' },
    blue_jaileon: { color: 'text-blue-700', bgGradient: 'bg-gradient-to-b from-blue-100 to-blue-50', btnColor: 'bg-blue-600 hover:bg-blue-700' },
    rainbow_jaileon: { color: 'text-purple-600', bgGradient: 'bg-gradient-to-b from-purple-100 via-pink-50 to-yellow-50', btnColor: 'bg-purple-600 hover:bg-purple-700' },
    golden_jaileon: { color: 'text-amber-700', bgGradient: 'bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-50', btnColor: 'bg-amber-500 hover:bg-amber-600' },
    bird: { color: 'text-yellow-600', bgGradient: 'bg-gradient-to-b from-yellow-100 to-yellow-50', btnColor: 'bg-yellow-500 hover:bg-yellow-600' },
  };

  const config = outcome ? outcomeConfig[outcome] : outcomeConfig.jaileon;
  const charName = outcome ? t(`capture.characters.${outcome}`) : t('capture.characters.jaileon');

  const startCapture = useCallback(async () => {
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('common.error'));
        return;
      }

      setResult(data);
      setOutcome(data.outcome);
      setCaptured(data.captured);
      setState('APPEARING');
    } catch {
      setError(t('errors.networkError'));
    }
  }, [qrCode, t]);

  useEffect(() => {
    startCapture();
  }, [startCapture]);

  useEffect(() => {
    if (state === 'APPEARING') {
      const timer = setTimeout(() => setState('IDLE'), 600);
      return () => clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    if (state === 'ESCAPED') {
      const timer = setTimeout(() => setState('RESULT'), 1500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleCatch = () => {
    if (state !== 'IDLE') return;
    setState('CATCHING');
    setTimeout(() => {
      if (captured) {
        setState('RESULT');
      } else {
        setState('ESCAPED');
      }
    }, 1500);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-gray-700 font-medium mb-2">{error}</p>
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl font-bold"
          >
            {t('capture.goHome')}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-green-100 to-green-50">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/jaileon-green.png" alt="" width={64} height={64} className="mx-auto animate-bounce mb-4" />
          <p className="text-green-700 font-medium animate-pulse">
            {t('capture.searching')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${config.bgGradient}`} />

      {/* Location name */}
      {result && (
        <div className="relative z-10 mb-4">
          <p className="text-green-700 font-medium text-sm bg-white/80 px-4 py-1 rounded-full">
            📍 {result.location_name}
          </p>
        </div>
      )}

      {/* Special Jaileon discovery text */}
      {outcome === 'rainbow_jaileon' && (state === 'APPEARING' || state === 'IDLE') && (
        <div className="relative z-10 mb-2">
          <p className="text-purple-600 font-bold text-lg animate-pulse">
            {t('capture.discovery.rainbow')}
          </p>
        </div>
      )}
      {outcome === 'blue_jaileon' && (state === 'APPEARING' || state === 'IDLE') && (
        <div className="relative z-10 mb-2">
          <p className="text-blue-600 font-bold text-lg animate-pulse">
            {t('capture.discovery.blue')}
          </p>
        </div>
      )}
      {outcome === 'yellow_jaileon' && (state === 'APPEARING' || state === 'IDLE') && (
        <div className="relative z-10 mb-2">
          <p className="text-yellow-600 font-bold text-lg animate-pulse">
            {t('capture.discovery.yellow')}
          </p>
        </div>
      )}
      {outcome === 'golden_jaileon' && (state === 'APPEARING' || state === 'IDLE') && (
        <div className="relative z-10 mb-2">
          <p className="text-amber-600 font-bold text-lg animate-pulse">
            {t('capture.discovery.golden')}
          </p>
        </div>
      )}

      {/* Character area */}
      <div className="relative z-10 w-64 h-64 flex items-center justify-center">
        {isJaileonType ? (
          <>
            {/* Jaileon / Rainbow Jaileon */}
            <div
              className={`relative ${
                state === 'APPEARING'
                  ? 'animate-bounce-in'
                  : state === 'IDLE'
                  ? 'animate-wobble'
                  : state === 'CATCHING'
                  ? 'animate-shake'
                  : state === 'ESCAPED'
                  ? 'animate-escape-poof'
                  : ''
              }`}
            >
              <Image
                src={
                  outcome === 'blue_jaileon'
                    ? '/images/jaileon-blue.png'
                    : outcome === 'yellow_jaileon'
                    ? '/images/jaileon-yellow.png'
                    : outcome === 'golden_jaileon'
                    ? '/images/jaileon-golden.png'
                    : '/images/jaileon-green.png'
                }
                alt={charName}
                width={200}
                height={200}
                className={`object-contain drop-shadow-lg ${
                  outcome === 'rainbow_jaileon' && state !== 'ESCAPED' ? 'animate-rainbow-glow' :
                  outcome === 'golden_jaileon' && state !== 'ESCAPED' ? 'animate-golden-glow' : ''
                }`}
                priority
              />
            </div>

            {/* Net animation during catching */}
            {state === 'CATCHING' && <NetAnimation />}
          </>
        ) : (
          <>
            {/* Bird */}
            <div
              className={`relative ${
                state === 'APPEARING'
                  ? 'animate-fly-in'
                  : state === 'IDLE'
                  ? 'animate-wobble'
                  : state === 'RESULT'
                  ? 'animate-fly-away'
                  : ''
              }`}
            >
              <Image
                src="/images/bird-yellow.png"
                alt={t('capture.characters.bird')}
                width={120}
                height={120}
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </>
        )}
      </div>

      {/* Confetti for successful jaileon-type capture only */}
      {state === 'RESULT' && isJaileonType && captured && <Confetti />}

      {/* Action area */}
      <div className="relative z-10 mt-8 text-center">
        {state === 'IDLE' && isJaileonType && (
          <button
            onClick={handleCatch}
            className={`px-10 py-4 text-white text-xl font-bold rounded-2xl shadow-lg animate-pulse-glow transition-colors active:scale-95 ${config.btnColor}`}
          >
            {t('capture.catchButton')}
          </button>
        )}

        {state === 'IDLE' && outcome === 'bird' && (
          <div className="space-y-3">
            <p className="text-gray-600">{t('capture.birdAppeared')}</p>
            <button
              onClick={() => setState('RESULT')}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-2xl shadow-lg transition-colors"
            >
              {t('capture.watchButton')}
            </button>
          </div>
        )}

        {state === 'CATCHING' && (
          <p className="text-green-700 font-bold text-lg animate-pulse">
            {t('capture.catching')}
          </p>
        )}

        {state === 'ESCAPED' && (
          <p className="text-red-500 font-bold text-lg animate-pulse">
            {t('capture.escaped')}
          </p>
        )}

        {state === 'RESULT' && result && (
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm">
            {isJaileonType && captured ? (
              <>
                <h2 className={`text-2xl font-bold mb-2 ${config.color}`}>
                  {t('capture.success.title')}
                </h2>
                <p className="text-gray-600 mb-4">
                  {charName}{outcome === 'golden_jaileon' ? t('capture.caughtMessageGolden') : outcome === 'rainbow_jaileon' ? t('capture.caughtMessageRainbow') : t('capture.caughtMessage')}
                </p>
              </>
            ) : isJaileonType && !captured ? (
              <>
                <h2 className="text-xl font-bold text-red-500 mb-2">
                  {t('capture.escapedResult.title')}
                </h2>
                <p className="text-gray-600 mb-4">
                  {charName}{t('capture.escapedMessage')}
                </p>
                <p className="text-gray-400 text-sm mb-4">{t('capture.escapedResult.consolation')}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-yellow-600 mb-2">
                  {t('capture.birdResult.title')}
                </h2>
                <p className="text-gray-600 mb-4">{t('capture.birdResult.message')}</p>
              </>
            )}

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{t('capture.earnedPoints')}</span>
                <span className={`text-xl font-bold ${
                  isJaileonType && !captured ? 'text-gray-400' : 'text-green-600'
                }`}>
                  +{result.points_earned}pt
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500 text-sm">{t('capture.totalPoints')}</span>
                <span className="font-bold text-gray-700">{result.total_points}pt</span>
              </div>
              {isJaileonType && captured && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-500 text-sm">{t('capture.totalCaptures')}</span>
                  <span className="font-bold text-gray-700">{result.capture_count}匹</span>
                </div>
              )}
              {result.streak_bonus && result.streak_bonus > 0 && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-orange-500 text-sm font-medium">
                    {t('home.streakBonus')} ({result.streak}{t('home.streakDays')})
                  </span>
                  <span className="text-orange-500 font-bold">+{result.streak_bonus}pt</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onComplete}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
              >
                {t('capture.goHome')}
              </button>
              <ShareButton
                title="JAIST Walk"
                text={`JAIST Walk${locale === 'ja' ? 'で' : ': caught '}${charName}${locale === 'ja' ? 'を捕まえた！' : '!'} +${result.points_earned}pt #JAISTWalk`}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
