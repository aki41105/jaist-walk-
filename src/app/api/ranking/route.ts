import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get('mode');

    if (mode === 'weekly') {
      const now = new Date();
      const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const dayOfWeek = jstNow.getUTCDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(jstNow);
      monday.setUTCDate(monday.getUTCDate() - mondayOffset);
      const weekStart = monday.toISOString().split('T')[0];

      const ranking = await sql`
        SELECT u.name, COALESCE(SUM(s.points_earned), 0)::int as points,
               u.capture_count, u.avatar, u.avatar_url
        FROM scans s
        JOIN users u ON u.id = s.user_id
        WHERE s.date >= ${weekStart}
        GROUP BY u.id, u.name, u.capture_count, u.avatar, u.avatar_url
        ORDER BY points DESC
        LIMIT 20
      `;

      return NextResponse.json(ranking);
    }

    const ranking = await sql`
      SELECT name, points, capture_count, avatar, avatar_url
      FROM users
      ORDER BY points DESC
      LIMIT 20
    `;

    return NextResponse.json(ranking);
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
