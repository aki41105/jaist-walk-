'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ExchangeRecord {
  id: string;
  user_id: string;
  points_spent: number;
  status: string;
  exchange_code: string;
  used_at: string | null;
  admin_id: string | null;
  created_at: string;
  rewards: { name_ja: string; name_en: string } | null;
  users: { name: string } | null;
}

export default function AdminExchangesPage() {
  const router = useRouter();
  const [exchanges, setExchanges] = useState<ExchangeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExchanges = async () => {
    try {
      const res = await fetch('/jaist-walk/api/admin/exchanges');
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      setExchanges(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExchanges(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const msg = newStatus === 'used' ? '使用済みにしますか？' : 'キャンセル（ポイント返還）しますか？';
    if (!confirm(msg)) return;

    try {
      const res = await fetch('/jaist-walk/api/admin/exchanges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }
      await fetchExchanges();
    } catch {
      alert('エラーが発生しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/jaist-walk/images/jaileon-green.png" alt="ジャイレオン" width={64} height={64} className="mx-auto animate-bounce mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="text-xl text-gray-600">&larr;</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">交換チケット管理</h1>
        </div>

        {exchanges.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
            <p>交換チケットはまだありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exchanges.map(ex => (
              <div key={ex.id} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono font-bold text-gray-800">{ex.exchange_code}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      ex.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      ex.status === 'used' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {ex.status === 'pending' ? '未使用' : ex.status === 'used' ? '使用済み' : 'キャンセル'}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 space-y-0.5">
                  <p>ユーザー: {ex.users?.name || ex.user_id}</p>
                  <p>景品: {ex.rewards?.name_ja}</p>
                  <p>消費: {ex.points_spent}pt</p>
                  <p>日時: {new Date(ex.created_at).toLocaleString('ja-JP')}</p>
                  {ex.used_at && <p>使用日時: {new Date(ex.used_at).toLocaleString('ja-JP')}</p>}
                </div>

                {ex.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleStatusChange(ex.id, 'used')}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                      使用済みにする
                    </button>
                    <button
                      onClick={() => handleStatusChange(ex.id, 'cancelled')}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
