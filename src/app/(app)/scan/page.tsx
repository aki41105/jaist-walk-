'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import jsQR from 'jsqr';
import { useLocale } from '@/lib/i18n';

const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false },
);

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
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if live camera is available (requires HTTPS)
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraAvailable(false);
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        setCameraAvailable(true);
      })
      .catch(() => {
        setCameraAvailable(false);
      });
  }, []);

  const handleFound = useCallback(
    (raw: string) => {
      if (scanned) return;
      const uuid = extractQrUuid(raw);
      if (uuid) {
        setScanned(true);
        playPopSound();
        if (navigator.vibrate) navigator.vibrate(100);
        router.push(`/capture?qr=${encodeURIComponent(uuid)}`);
      }
    },
    [scanned, router],
  );

  const handleScan = useCallback(
    (results: { rawValue: string }[]) => {
      if (results.length === 0) return;
      handleFound(results[0].rawValue);
    },
    [handleFound],
  );

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
          setError(`有効なQRコードではありません。\n読み取りデータ: ${data}`);
          setProcessing(false);
          return;
        }
        handleFound(data);
      } catch {
        setError('画像の処理に失敗しました。');
        setProcessing(false);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [scanned, handleFound],
  );

  // Loading state while checking camera
  if (cameraAvailable === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/jaist-walk/images/jaileon-green.png" alt="" width={64} height={64} className="mx-auto animate-bounce mb-4" />
          <p className="text-white/80 text-sm">カメラを確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${cameraAvailable ? 'bg-black' : 'bg-gradient-to-b from-green-50 to-green-100'}`}>
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

      <div className="flex-1 relative flex items-center justify-center">
        {scanned ? (
          <div className={`text-center ${cameraAvailable ? 'absolute inset-0 bg-gradient-to-b from-green-100 to-green-50 flex items-center justify-center' : ''}`}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/jaist-walk/images/jaileon-green.png" alt="" width={64} height={64} className="mx-auto animate-bounce mb-4" />
              <p className="text-green-700 font-medium animate-pulse">ジャイレオンを探しています...</p>
            </div>
          </div>
        ) : cameraAvailable ? (
          /* Live scanner with frame overlay */
          <div className="w-full h-full">
            <Scanner
              onScan={handleScan}
              onError={() => setCameraAvailable(false)}
              sound={false}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover' as const },
              }}
              components={{ finder: false }}
            />
            {/* Scan frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 relative">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                {/* Scan line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-green-400/80 animate-scan" />
              </div>
            </div>
            <p className="absolute bottom-8 left-0 right-0 text-center text-white/80 text-sm">
              {t('scan.guide')}
            </p>
          </div>
        ) : (
          /* Fallback: file capture */
          <div className="text-center w-full max-w-sm px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jaist-walk/images/jaileon-green.png" alt="" width={80} height={80} className="mx-auto mb-6" />

            <p className="text-gray-600 mb-6">
              QRコードを撮影してジャイレオンを捕まえよう！
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
            />

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
