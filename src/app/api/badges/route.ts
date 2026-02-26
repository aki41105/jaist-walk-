import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    const user = await requireAuth();

    // Get all badges
    const { data: badges, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .order('sort_order', { ascending: true });

    if (badgeError) throw badgeError;

    // Get user's earned badges
    const { data: userBadges, error: ubError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id);

    if (ubError) throw ubError;

    const earnedMap = new Map(
      (userBadges || []).map(ub => [ub.badge_id, ub.earned_at])
    );

    const result = (badges || []).map(badge => ({
      id: badge.id,
      name_ja: badge.name_ja,
      name_en: badge.name_en,
      description_ja: badge.description_ja,
      description_en: badge.description_en,
      icon: badge.icon,
      earned: earnedMap.has(badge.id),
      earned_at: earnedMap.get(badge.id) || null,
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
