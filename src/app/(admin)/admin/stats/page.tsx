'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface DailyScan {
  scan_date: string;
  scan_count: number;
}

interface LocationRank {
  location_id: string;
  name_ja: string;
  name_en: string;
  location_number: number;
  scan_count: number;
}

interface OutcomeDistribution {
  outcome: string;
  outcome_count: number;
}

interface ScanStats {
  daily_scans: DailyScan[];
  location_ranking: LocationRank[];
  outcome_distribution: OutcomeDistribution[];
}

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  jaileon: { label: 'ジャイレオン', color: 'bg-green-500' },
  yellow_jaileon: { label: 'イエロー', color: 'bg-yellow-400' },
  blue_jaileon: { label: 'ブルー', color: 'bg-blue-500' },
  rainbow_jaileon: { label: 'レインボー', color: 'bg-purple-500' },
  bird: { label: 'バード', color: 'bg-gray-400' },
};

const PERIOD_OPTIONS = [
  { value: 7, label: '7日間' },
  { value: 14, label: '14日間' },
  { value: 30, label: '30日間' },
];

export default function AdminStatsPage() {
  const router = useRouter();
  const [days, setDays] = useState(7);
  const [data, setData] = useState<ScanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/scans?days=${days}`);
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError('アクセス権限がありません'); return; }
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setData(json);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [days, router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const maxScanCount = data
    ? Math.max(...data.daily_scans.map(d => d.scan_count), 1)
    : 1;

  const totalOutcomes = data
    ? data.outcome_distribution.reduce((sum, d) => sum + d.outcome_count, 0)
    : 0;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/admin')}
          className="text-green-600 hover:text-green-700 text-sm font-medium mb-4 block"
        >
          ← 管理画面に戻る
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">スキャン統計</h1>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  days === opt.value
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                <div className="h-40 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Daily Scan Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="font-bold text-gray-800 mb-4">日別スキャン数</h2>
              <div className="space-y-1.5">
                {data.daily_scans.map(d => (
                  <div key={d.scan_date} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12 text-right shrink-0">
                      {new Date(d.scan_date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(d.scan_count / maxScanCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-8 text-right shrink-0">
                      {d.scan_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Ranking */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="font-bold text-gray-800 mb-4">人気ロケーションランキング</h2>
              {data.location_ranking.length > 0 ? (
                <div className="space-y-2">
                  {data.location_ranking.map((loc, i) => (
                    <div key={loc.location_id} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? 'bg-yellow-400 text-yellow-900'
                        : i === 1 ? 'bg-gray-300 text-gray-700'
                        : i === 2 ? 'bg-orange-300 text-orange-800'
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{loc.name_ja}</p>
                        <p className="text-xs text-gray-400">#{loc.location_number}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-700 shrink-0">
                        {loc.scan_count}回
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">データがありません</p>
              )}
            </div>

            {/* Outcome Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="font-bold text-gray-800 mb-4">出現キャラクター分布</h2>
              {data.outcome_distribution.length > 0 ? (
                <div className="space-y-3">
                  {/* Stacked bar */}
                  <div className="flex h-8 rounded-full overflow-hidden">
                    {data.outcome_distribution.map(d => {
                      const info = OUTCOME_LABELS[d.outcome] || { label: d.outcome, color: 'bg-gray-300' };
                      const pct = (d.outcome_count / totalOutcomes) * 100;
                      return (
                        <div
                          key={d.outcome}
                          className={`${info.color} transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                          title={`${info.label}: ${d.outcome_count} (${pct.toFixed(1)}%)`}
                        />
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3">
                    {data.outcome_distribution.map(d => {
                      const info = OUTCOME_LABELS[d.outcome] || { label: d.outcome, color: 'bg-gray-300' };
                      const pct = ((d.outcome_count / totalOutcomes) * 100).toFixed(1);
                      return (
                        <div key={d.outcome} className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-full ${info.color}`} />
                          <span className="text-xs text-gray-600">
                            {info.label} {d.outcome_count}回 ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">データがありません</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
