import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/session';
import { pointOperationSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = pointOperationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { user_id, amount, reason } = parsed.data;

    // Verify target user exists
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, points')
      .eq('id', user_id)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // Use the safe point update function
    const { data, error } = await supabase.rpc('update_user_points', {
      p_user_id: user_id,
      p_amount: amount,
      p_reason: reason,
      p_admin_id: admin.id,
    });

    if (error) {
      if (error.message.includes('Insufficient points')) {
        return NextResponse.json(
          { error: 'ポイントが不足しています' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      new_points: data?.[0]?.new_points ?? 0,
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
    console.error('Points error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
