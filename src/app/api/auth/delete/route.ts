import { NextResponse } from 'next/server';
import sql from '@/lib/db';
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

    await sql`DELETE FROM users WHERE id = ${user.id}`;

    await destroySession();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
