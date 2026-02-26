import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    await requireAuth();

    const { data: rewards, error } = await supabase
      .from('rewards')
      .select('id, name_ja, name_en, description_ja, description_en, required_points, stock, is_active')
      .eq('is_active', true)
      .order('required_points', { ascending: true });

    if (error) throw error;

    return NextResponse.json(rewards || []);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Rewards error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
