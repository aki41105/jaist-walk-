'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { User, PointTransaction } from '@/types';

function PointsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get('user');

  const [user, setUser] = useState<(User & { recent_transactions: PointTransaction[] }) | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState('');

  const [forbidden, setForbidden] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!userName) return;
    try {
      const res = await fetch(`/jaist-walk/api/users?name=${encodeURIComponent(userName)}`);
      const data = await res.json();
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setUser(data);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [userName, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/jaist-walk/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user!.id,
          amount: parseInt(amount, 10),
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(`ポイントを${parseInt(amount) > 0 ? '付与' : '差引'}しました (残高: ${data.new_points}pt)`);
      setAmount('');
      setReason('');
      fetchUser();
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (!userName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-500">ユーザーが指定されていません</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <p className="text-gray-700 font-medium mb-2">アクセス権限がありません</p>
          <p className="text-gray-500 text-sm mb-4">この画面は運営スタッフのみ利用可能です</p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-2 bg-green-600 text-white rounded-xl"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/jaileon-green.png" alt="ジャイレオン" width={64} height={64} className="mx-auto animate-bounce mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'ユーザーが見つかりません'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-2 bg-gray-800 text-white rounded-xl"
          >
            検索に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push('/admin')}
          className="text-green-600 hover:text-green-700 text-sm font-medium mb-4 block"
        >
          ← 検索に戻る
        </button>

        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">アカウント名</p>
              <p className="text-xl font-bold">{user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">現在のポイント</p>
              <p className="text-2xl font-bold text-yellow-500">{user.points}pt</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">身分</p>
              <p className="font-medium">{user.affiliation}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">領域</p>
              <p className="font-medium">{user.research_area}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">捕獲数</p>
              <p className="font-medium">{user.capture_count}</p>
            </div>
          </div>
        </div>

        {/* Point Operation */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">ポイント操作</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">ポイント数</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAmount(String((parseInt(amount) || 0) - 100))}
                  className="px-3 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors text-sm"
                >
                  -100
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(String((parseInt(amount) || 0) - 10))}
                  className="px-3 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors text-sm"
                >
                  -10
                </button>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 min-w-0 px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-bold text-lg"
                />
                <button
                  type="button"
                  onClick={() => setAmount(String((parseInt(amount) || 0) + 10))}
                  className="px-3 py-3 bg-green-50 hover:bg-green-100 text-green-600 font-bold rounded-xl transition-colors text-sm"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(String((parseInt(amount) || 0) + 100))}
                  className="px-3 py-3 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-xl transition-colors text-sm"
                >
                  +100
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">ボタンまたは直接入力で操作</p>

              {/* 0未満警告 */}
              {amount && parseInt(amount) < 0 && user.points + parseInt(amount) < 0 && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                  ⚠ この操作でポイントが0未満になります（現在: {user.points}pt → {user.points + parseInt(amount)}pt）
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">理由</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="例: イベント参加賞"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={200}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              onClick={() => {
                if (!amount || !reason || parseInt(amount) === 0) {
                  setError('ポイント数と理由を入力してください');
                  return;
                }
                setError('');
                setShowConfirm(true);
              }}
              disabled={submitting}
              className="w-full py-3 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors"
            >
              {submitting ? '処理中...' : '決定'}
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-3">確認</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-bold">{user.name}</span> に対して
              </p>
              <p className="text-2xl font-bold mb-1">
                <span className={parseInt(amount) > 0 ? 'text-green-600' : 'text-red-500'}>
                  {parseInt(amount) > 0 ? '+' : ''}{amount}pt
                </span>
              </p>
              <p className="text-gray-500 text-sm mb-4">理由: {reason}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-xl font-medium"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2 bg-gray-800 text-white rounded-xl font-bold"
                >
                  確定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <h2 className="font-bold text-gray-800 p-4 pb-2">ポイント履歴</h2>
          {user.recent_transactions.length === 0 ? (
            <p className="p-4 text-center text-gray-400 text-sm">履歴はありません</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {user.recent_transactions.map((tx: PointTransaction) => (
                <div key={tx.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{tx.reason}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleString('ja-JP')}
                      {tx.admin_id && ` (管理者: ${tx.admin_id})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      tx.amount > 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}pt
                    </p>
                    <p className="text-xs text-gray-400">{tx.balance_after}pt</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PointsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/jaileon-green.png" alt="ジャイレオン" width={64} height={64} className="mx-auto animate-bounce mb-4" />
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      }
    >
      <PointsContent />
    </Suspense>
  );
}
