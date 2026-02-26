import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get('mode');

    if (mode === 'weekly') {
      // Weekly ranking: sum points_earned from scans this week (Mon-Sun JST)
      const now = new Date();
      const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const dayOfWeek = jstNow.getUTCDay(); // 0=Sun
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(jstNow);
      monday.setUTCDate(monday.getUTCDate() - mondayOffset);
      const weekStart = monday.toISOString().split('T')[0];

      const { data: scans, error } = await supabase
        .from('scans')
        .select('user_id, points_earned')
        .gte('date', weekStart);

      if (error) throw error;

      // Aggregate points per user
      const userPoints: Record<string, number> = {};
      for (const scan of scans || []) {
        userPoints[scan.user_id] = (userPoints[scan.user_id] || 0) + scan.points_earned;
      }

      // Sort and take top 20
      const topUserIds = Object.entries(userPoints)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

      if (topUserIds.length === 0) {
        return NextResponse.json([]);
      }

      // Fetch user info
      const { data: users } = await supabase
        .from('users')
        .select('id, name, capture_count, avatar, avatar_url')
        .in('id', topUserIds.map(([id]) => id));

      const userMap: Record<string, typeof users extends (infer U)[] | null ? U : never> = {};
      for (const u of users || []) {
        userMap[u.id] = u;
      }

      const ranking = topUserIds.map(([userId, points]) => {
        const u = userMap[userId];
        return {
          name: u?.name || 'Unknown',
          points,
          capture_count: u?.capture_count || 0,
          avatar: u?.avatar || 'green',
          avatar_url: u?.avatar_url || null,
        };
      });

      return NextResponse.json(ranking);
    }

    // Default: all-time ranking
    const { data: ranking, error } = await supabase
      .from('users')
      .select('name, points, capture_count, avatar, avatar_url')
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
