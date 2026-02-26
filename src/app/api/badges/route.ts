import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import sql from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();

    const badges = await sql`
      SELECT id, name_ja, name_en, description_ja, description_en, icon
      FROM badges
      ORDER BY sort_order
    `;

    const userBadges = await sql`
      SELECT badge_id, earned_at
      FROM user_badges
      WHERE user_id = ${user.id}
    `;

    const earnedMap = new Map(
      userBadges.map(ub => [ub.badge_id as string, ub.earned_at as string])
    );

    const result = badges.map(badge => ({
      id: badge.id as string,
      name_ja: badge.name_ja as string,
      name_en: badge.name_en as string,
      description_ja: badge.description_ja as string,
      description_en: badge.description_en as string,
      icon: badge.icon as string,
      earned: earnedMap.has(badge.id as string),
      earned_at: earnedMap.get(badge.id as string) || null,
    }));

    const earned_count = result.filter(b => b.earned).length;

    return NextResponse.json({
      badges: result,
      earned_count,
      total_count: result.length,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Badges error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
