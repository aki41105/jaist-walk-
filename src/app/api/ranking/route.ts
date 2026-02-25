import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: ranking, error } = await supabase
      .from('users')
      .select('name, points, capture_count')
      .order('points', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json(ranking || []);
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
