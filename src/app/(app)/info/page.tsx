'use client';

import { useRouter } from 'next/navigation';

export default function InfoPage() {
  const router = useRouter();

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
        <h1 className="text-lg font-bold">遊び方・お知らせ</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* How to play */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">遊び方</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-green-600 shrink-0">1.</span>
              <span>キャンパス内に設置されたQRコードを探そう</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600 shrink-0">2.</span>
              <span>ホーム画面の「QR スキャン」ボタンでQRコードを読み取ろう</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600 shrink-0">3.</span>
              <span>出現するキャラクターを捕まえてポイントをゲット！</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600 shrink-0">4.</span>
              <span>ポイントを貯めてランキング上位を目指そう</span>
            </li>
          </ol>
        </div>

        {/* Characters */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">キャラクター</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <span className="text-2xl">🦎</span>
              <div className="flex-1">
                <p className="font-bold text-green-700">ジャイレオン</p>
                <p className="text-xs text-gray-500">捕獲率 50%</p>
              </div>
              <p className="font-bold text-green-600">100pt</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <span className="text-2xl">🌈</span>
              <div className="flex-1">
                <p className="font-bold text-purple-700">虹色ジャイレオン</p>
                <p className="text-xs text-gray-500">捕獲率 40%（レア！）</p>
              </div>
              <p className="font-bold text-purple-600">500pt</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
              <span className="text-2xl">🐦</span>
              <div className="flex-1">
                <p className="font-bold text-yellow-700">小鳥</p>
                <p className="text-xs text-gray-500">捕獲率 100%</p>
              </div>
              <p className="font-bold text-yellow-600">10pt</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">💨</span>
              <div className="flex-1">
                <p className="font-bold text-gray-700">逃げられた場合</p>
                <p className="text-xs text-gray-500">参加賞</p>
              </div>
              <p className="font-bold text-gray-500">5pt</p>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">ルール</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-green-500">-</span>
              <span>同じQRコードは1日1回のみスキャンできます</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500">-</span>
              <span>出現するキャラクターは日によって変わります</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500">-</span>
              <span>貯めたポイントはイベントで利用できます</span>
            </li>
          </ul>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">お知らせ</h2>
          <div className="space-y-3 text-sm">
            <div className="border-l-4 border-green-500 pl-3 py-1">
              <p className="font-medium text-gray-800">JAIST Walk リリース！</p>
              <p className="text-xs text-gray-400">2026年2月</p>
              <p className="text-gray-600 mt-1">キャンパス内のQRコードを探して、ジャイレオンを捕まえよう！</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-green-700 mb-3">お問い合わせ</h2>
          <p className="text-sm text-gray-600">
            バグ報告・ご質問はこちら：
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
