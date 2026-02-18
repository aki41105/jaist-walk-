'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { CaptureState, CaptureOutcome, CaptureResponse } from '@/types';
import { Confetti } from './Confetti';
import { NetAnimation } from './NetAnimation';

interface CaptureGameProps {
  qrCode: string;
  onComplete: () => void;
}

export function CaptureGame({ qrCode, onComplete }: CaptureGameProps) {
  const [state, setState] = useState<CaptureState>('LOADING');
  const [outcome, setOutcome] = useState<CaptureOutcome | null>(null);
  const [captured, setCaptured] = useState<boolean>(true);
  const [result, setResult] = useState<CaptureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isJaileonType = outcome === 'jaileon' || outcome === 'rainbow_jaileon';

  const startCapture = useCallback(async () => {
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'エラーが発生しました');
        return;
      }

      setResult(data);
      setOutcome(data.outcome);
      setCaptured(data.captured);
      setState('APPEARING');
    } catch {
      setError('通信エラーが発生しました');
    }
  }, [qrCode]);

  useEffect(() => {
    startCapture();
  }, [startCapture]);

  useEffect(() => {
    if (state === 'APPEARING') {
      const timer = setTimeout(() => setState('IDLE'), 1000);
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
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (state === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🔍</div>
          <p className="text-green-700 font-medium animate-pulse">
            ジャイレオンを探しています...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${
        outcome === 'rainbow_jaileon'
          ? 'bg-gradient-to-b from-purple-100 via-pink-50 to-yellow-50'
          : 'bg-gradient-to-b from-green-100 to-green-50'
      }`} />

      {/* Location name */}
      {result && (
        <div className="relative z-10 mb-4">
          <p className="text-green-700 font-medium text-sm bg-white/80 px-4 py-1 rounded-full">
            📍 {result.location_name}
          </p>
        </div>
      )}

      {/* Rainbow Jaileon discovery text */}
      {outcome === 'rainbow_jaileon' && (state === 'APPEARING' || state === 'IDLE') && (
        <div className="relative z-10 mb-2">
          <p className="text-purple-600 font-bold text-lg animate-pulse">
            ！？ 虹色に輝いている！？
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
                  state === 'CATCHING'
                    ? '/images/jaileon-blue.png'
                    : state === 'RESULT' && captured
                    ? '/images/jaileon-yellow.png'
                    : '/images/jaileon-green.png'
                }
                alt={outcome === 'rainbow_jaileon' ? '虹色ジャイレオン' : 'ジャイレオン'}
                width={200}
                height={200}
                className={`object-contain drop-shadow-lg ${
                  outcome === 'rainbow_jaileon' && state !== 'ESCAPED' ? 'animate-rainbow-glow' : ''
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
                alt="小鳥"
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
            className={`px-10 py-4 text-white text-xl font-bold rounded-2xl shadow-lg animate-pulse-glow transition-colors active:scale-95 ${
              outcome === 'rainbow_jaileon'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            つかまえる！
          </button>
        )}

        {state === 'IDLE' && outcome === 'bird' && (
          <div className="space-y-3">
            <p className="text-gray-600">小鳥が遊びに来ました！</p>
            <button
              onClick={() => setState('RESULT')}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-2xl shadow-lg transition-colors"
            >
              見守る 👀
            </button>
          </div>
        )}

        {state === 'CATCHING' && (
          <p className="text-green-700 font-bold text-lg animate-pulse">
            捕獲中...!
          </p>
        )}

        {state === 'ESCAPED' && (
          <p className="text-red-500 font-bold text-lg animate-pulse">
            あっ...!
          </p>
        )}

        {state === 'RESULT' && result && (
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm">
            {isJaileonType && captured ? (
              <>
                <h2 className={`text-2xl font-bold mb-2 ${
                  outcome === 'rainbow_jaileon' ? 'text-purple-600' : 'text-green-700'
                }`}>
                  捕獲成功！🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  {outcome === 'rainbow_jaileon'
                    ? '虹色ジャイレオンを捕まえた！！'
                    : 'ジャイレオンを捕まえた！'}
                </p>
              </>
            ) : isJaileonType && !captured ? (
              <>
                <h2 className="text-xl font-bold text-red-500 mb-2">
                  逃げてしまった...💨
                </h2>
                <p className="text-gray-600 mb-4">
                  {outcome === 'rainbow_jaileon'
                    ? '虹色ジャイレオンは去っていった...'
                    : 'ジャイレオンは逃げてしまった...'}
                </p>
                <p className="text-gray-400 text-sm mb-4">慰めポイントをもらった</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-yellow-600 mb-2">
                  小鳥は飛んでいった...🐦
                </h2>
                <p className="text-gray-600 mb-4">でもポイントは少しもらえた！</p>
              </>
            )}

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">獲得ポイント</span>
                <span className={`text-xl font-bold ${
                  isJaileonType && !captured ? 'text-gray-400' : 'text-green-600'
                }`}>
                  +{result.points_earned}pt
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500 text-sm">合計ポイント</span>
                <span className="font-bold text-gray-700">{result.total_points}pt</span>
              </div>
              {isJaileonType && captured && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-500 text-sm">捕獲数</span>
                  <span className="font-bold text-gray-700">{result.capture_count}匹</span>
                </div>
              )}
            </div>

            <button
              onClick={onComplete}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
