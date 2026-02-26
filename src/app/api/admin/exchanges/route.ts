import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import sql from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();

    const exchanges = await sql`
      SELECT e.id, e.user_id, e.reward_id, e.points_spent, e.status,
             e.exchange_code, e.used_at, e.admin_id, e.created_at,
             json_build_object('name_ja', r.name_ja, 'name_en', r.name_en) as rewards,
             json_build_object('name', u.name) as users
      FROM exchanges e
      LEFT JOIN rewards r ON r.id = e.reward_id
      LEFT JOIN users u ON u.id = e.user_id
      ORDER BY e.created_at DESC
      LIMIT 100
    `;

    return NextResponse.json(exchanges);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin exchanges error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !['used', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: '無効なパラメータです' }, { status: 400 });
    }

    if (status === 'cancelled') {
      const [exchange] = await sql`
        SELECT user_id, points_spent, status FROM exchanges WHERE id = ${id}
      `;

      if (!exchange) {
        return NextResponse.json({ error: '交換が見つかりません' }, { status: 404 });
      }

      if (exchange.status !== 'pending') {
        return NextResponse.json({ error: 'この交換は既に処理済みです' }, { status: 400 });
      }

      await sql`SELECT update_user_points(${exchange.user_id}, ${exchange.points_spent}, ${'ポイント交換キャンセル（返還）'}, ${admin.id})`;
    }

    const usedAt = status === 'used' ? new Date().toISOString() : null;

    const [updated] = await sql`
      UPDATE exchanges SET
        status = ${status},
        admin_id = ${admin.id},
        used_at = COALESCE(${usedAt}, used_at)
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin exchange update error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
