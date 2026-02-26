import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  try {
    await requireAdmin();

    const today = new Date().toISOString().split('T')[0];

    const [[usersResult], [scansResult], [qrResult], [pointsResult]] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM scans WHERE date = ${today}`,
      sql`SELECT COUNT(*) as count FROM qr_locations WHERE is_active = true`,
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM point_transactions WHERE amount > 0`,
    ]);

    return NextResponse.json({
      total_users: Number(usersResult.count),
      today_scans: Number(scansResult.count),
      active_qr_codes: Number(qrResult.count),
      total_points_distributed: Number(pointsResult.total),
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
