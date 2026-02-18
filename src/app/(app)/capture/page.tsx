'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CaptureGame } from '@/components/capture/CaptureGame';

function CaptureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrCode = searchParams.get('qr');

  if (!qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">QRコードが指定されていません</p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <CaptureGame
      qrCode={qrCode}
      onComplete={() => router.push('/home')}
    />
  );
}

export default function CapturePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-4xl animate-bounce">🦎</div>
        </div>
      }
    >
      <CaptureContent />
    </Suspense>
  );
}
