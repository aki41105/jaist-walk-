import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  try {
    await requireAdmin();

    const { data: exchanges, error } = await supabase
      .from('exchanges')
      .select('id, user_id, reward_id, points_spent, status, exchange_code, used_at, admin_id, created_at, rewards(name_ja, name_en), users!exchanges_user_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json(exchanges || []);
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

    const updateData: Record<string, unknown> = {
      status,
      admin_id: admin.id,
    };

    if (status === 'used') {
      updateData.used_at = new Date().toISOString();
    }

    // If cancelling, refund points
    if (status === 'cancelled') {
      const { data: exchange } = await supabase
        .from('exchanges')
        .select('user_id, points_spent, status')
        .eq('id', id)
        .single();

      if (!exchange) {
        return NextResponse.json({ error: '交換が見つかりません' }, { status: 404 });
      }

      if (exchange.status !== 'pending') {
        return NextResponse.json({ error: 'この交換は既に処理済みです' }, { status: 400 });
      }

      // Refund points
      await supabase.rpc('update_user_points', {
        p_user_id: exchange.user_id,
        p_amount: exchange.points_spent,
        p_reason: 'ポイント交換キャンセル（返還）',
        p_admin_id: admin.id,
      });
    }

    const { data, error } = await supabase
      .from('exchanges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin exchange update error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
