import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/session';
import { exchangeSchema } from '@/lib/validation';

export async function GET() {
  try {
    const user = await requireAuth();

    const { data: exchanges, error } = await supabase
      .from('exchanges')
      .select('id, reward_id, points_spent, status, exchange_code, used_at, created_at, rewards(name_ja, name_en)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(exchanges || []);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Exchange history error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = exchangeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { reward_id } = parsed.data;

    const { data, error } = await supabase.rpc('execute_exchange', {
      p_user_id: user.id,
      p_reward_id: reward_id,
    });

    if (error) {
      const msg = error.message;
      if (msg.includes('INSUFFICIENT_POINTS')) {
        return NextResponse.json({ error: 'ポイントが不足しています' }, { status: 400 });
      }
      if (msg.includes('OUT_OF_STOCK')) {
        return NextResponse.json({ error: '在庫がありません' }, { status: 400 });
      }
      if (msg.includes('REWARD_INACTIVE')) {
        return NextResponse.json({ error: 'この景品は現在利用できません' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Exchange error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
