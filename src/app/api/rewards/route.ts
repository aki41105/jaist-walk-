import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import sql from '@/lib/db';

export async function GET() {
  try {
    await requireAuth();

    const rewards = await sql`
      SELECT id, name_ja, name_en, description_ja, description_en, required_points, stock
      FROM rewards
      WHERE is_active = true
      ORDER BY required_points ASC
    `;

    return NextResponse.json(rewards);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Rewards error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
