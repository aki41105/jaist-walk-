'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Reward {
  id: string;
  name_ja: string;
  name_en: string;
  description_ja: string;
  description_en: string;
  required_points: number;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminRewardsPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name_ja: '', name_en: '', description_ja: '', description_en: '',
    required_points: 1000, stock: 50,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/admin/rewards');
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      setRewards(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRewards(); }, []);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ name_ja: '', name_en: '', description_ja: '', description_en: '', required_points: 1000, stock: 50 });
        await fetchRewards();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch { alert('エラーが発生しました'); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch('/api/admin/rewards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    await fetchRewards();
  };

  const handleUpdateStock = async (id: string, currentStock: number) => {
    const input = prompt('新しい在庫数を入力:', String(currentStock));
    if (input === null) return;
    const stock = parseInt(input);
    if (isNaN(stock) || stock < 0) { alert('有効な数値を入力してください'); return; }

    await fetch('/api/admin/rewards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stock }),
    });
    await fetchRewards();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">景品管理</h1>
          <button onClick={() => router.push('/admin')} className="text-green-600 hover:text-green-700 text-sm font-medium">
            管理画面に戻る
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mb-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
        >
          {showForm ? 'キャンセル' : '景品を追加'}
        </button>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-4 mb-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500">日本語名</label>
              <input type="text" value={form.name_ja} onChange={e => setForm({...form, name_ja: e.target.value})}
                className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">英語名</label>
              <input type="text" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})}
                className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">説明 (日本語)</label>
              <input type="text" value={form.description_ja} onChange={e => setForm({...form, description_ja: e.target.value})}
                className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">説明 (英語)</label>
              <input type="text" value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})}
                className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">必要ポイント</label>
                <input type="number" value={form.required_points} onChange={e => setForm({...form, required_points: parseInt(e.target.value) || 0})}
                  className="w-full border rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">在庫数</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})}
                  className="w-full border rounded-lg p-2 text-sm" />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={submitting || !form.name_ja || !form.name_en}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? '作成中...' : '作成'}
            </button>
          </div>
        )}

        {/* Rewards list */}
        <div className="space-y-3">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800">{reward.name_ja}</h3>
                <button
                  onClick={() => handleToggle(reward.id, reward.is_active)}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    reward.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {reward.is_active ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-sm text-gray-500">{reward.name_en}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-purple-600 font-bold">{reward.required_points}pt</span>
                <button
                  onClick={() => handleUpdateStock(reward.id, reward.stock)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  在庫: {reward.stock}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
