import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  try {
    await requireAdmin();

    const today = new Date().toISOString().split('T')[0];

    const [usersResult, scansResult, qrResult, pointsResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('scans').select('*', { count: 'exact', head: true }).eq('date', today),
      supabase.from('qr_locations').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('point_transactions').select('amount').gt('amount', 0),
    ]);

    const totalPointsDistributed = (pointsResult.data || []).reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      total_users: usersResult.count || 0,
      today_scans: scansResult.count || 0,
      active_qr_codes: qrResult.count || 0,
      total_points_distributed: totalPointsDistributed,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin stats error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
