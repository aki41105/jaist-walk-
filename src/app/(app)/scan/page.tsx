'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false },
);

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

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  const handleScan = useCallback(
    (results: { rawValue: string }[]) => {
      if (scanned || results.length === 0) return;
      const value = results[0].rawValue;
      const uuid = extractQrUuid(value);
      if (uuid) {
        setScanned(true);
        router.push(`/capture?qr=${encodeURIComponent(uuid)}`);
      }
    },
    [scanned, router],
  );

  const handleError = useCallback((err: unknown) => {
    const message =
      err instanceof Error ? err.message : String(err);
    if (message.includes('Permission') || message.includes('NotAllowed')) {
      setError('カメラへのアクセスが許可されていません。\n端末の設定からカメラの権限を許可してください。');
    } else {
      setError(`カメラの起動に失敗しました: ${message}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 z-10">
        <button
          onClick={() => router.push('/home')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 transition-colors"
        >
          <span className="text-xl">&larr;</span>
        </button>
        <h1 className="text-lg font-bold">QR&thinsp;スキャン</h1>
      </div>

      {/* Scanner area */}
      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="text-center px-6">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-white whitespace-pre-line mb-6">{error}</p>
            <button
              onClick={() => router.push('/home')}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold"
            >
              ホームに戻る
            </button>
          </div>
        ) : scanned ? (
          <div className="text-center">
            <div className="text-4xl animate-bounce mb-4">🦎</div>
            <p className="text-white">読み込み中...</p>
          </div>
        ) : (
          <div className="w-full h-full">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover' as const },
              }}
              components={{ finder: false }}
            />
            {/* Overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/60 rounded-2xl" />
            </div>
            <p className="absolute bottom-8 left-0 right-0 text-center text-white/80 text-sm">
              QRコードを枠内に合わせてください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
