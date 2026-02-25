import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, destroySession } from '@/lib/session';

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete user - all related data (sessions, scans, point_transactions)
    // will be cascade-deleted by foreign key constraints
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (error) {
      console.error('Account delete error:', error.message);
      return NextResponse.json(
        { error: 'アカウントの削除に失敗しました' },
        { status: 500 }
      );
    }

    // Clear session cookie
    await destroySession();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
