'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { useLocale } from '@/lib/i18n';

/** Play a short pop sound using Web Audio API */
function playPopSound() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch {
    // Audio not supported - silently ignore
  }
}

function extractQrUuid(raw: string): string | null {
  try {
    const url = new URL(raw);
    const qr = url.searchParams.get('qr');
    if (qr) return qr;
  } catch {
    // not a URL – treat the raw value as a UUID directly
  }
  // bare UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) {
    return raw;
  }
  return null;
}

function decodeQrFromImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      resolve(code ? code.data : null);
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

export default function ScanPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || scanned) return;

      setProcessing(true);
      setError(null);

      try {
        const data = await decodeQrFromImage(file);
        if (!data) {
          setError('QRコードを読み取れませんでした。もう一度撮影してください。');
          setProcessing(false);
          return;
        }

        const uuid = extractQrUuid(data);
        if (!uuid) {
          setError('有効なQRコードではありません。JAIST Walkのスポットを撮影してください。');
          setProcessing(false);
          return;
        }

        setScanned(true);
        playPopSound();
        if (navigator.vibrate) navigator.vibrate(100);
        router.push(`/capture?qr=${encodeURIComponent(uuid)}`);
      } catch {
        setError('画像の処理に失敗しました。');
        setProcessing(false);
      }

      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [scanned, router],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 z-10">
        <button
          onClick={() => router.push('/home')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 transition-colors"
        >
          <span className="text-xl">&larr;</span>
        </button>
        <h1 className="text-lg font-bold">{t('scan.title')}</h1>
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center px-6">
        {scanned ? (
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jaist-walk/images/jaileon-green.png" alt="" width={64} height={64} className="mx-auto animate-bounce mb-4" />
            <p className="text-green-700 font-medium animate-pulse">ジャイレオンを探しています...</p>
          </div>
        ) : (
          <div className="text-center w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jaist-walk/images/jaileon-green.png" alt="" width={80} height={80} className="mx-auto mb-6" />

            <p className="text-gray-600 mb-6">
              QRコードを撮影してジャイレオンを捕まえよう！
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
            />

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-2xl font-bold text-lg shadow-lg transition-colors"
            >
              {processing ? '読み取り中...' : '📷 カメラで撮影'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <p className="text-gray-400 text-xs mt-6">
              {t('scan.guide')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
