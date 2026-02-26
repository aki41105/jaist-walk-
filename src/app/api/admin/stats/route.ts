import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/session';

export async function GET() {
  try {
    await requireAdmin();

    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

    if (error) throw error;

    return NextResponse.json(data);
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
