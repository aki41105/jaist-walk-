export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/jaileon-green.png"
          alt="ジャイレオン"
          width={64}
          height={64}
          className="mx-auto animate-bounce mb-4"
        />
        <p className="text-gray-500">読み込み中...</p>
      </div>
    </div>
  );
}
