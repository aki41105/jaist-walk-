import sql from '@/lib/db';

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  // 1. Get user data
  const [user] = await sql`
    SELECT points, capture_count FROM users WHERE id = ${userId} LIMIT 1
  `;

  if (!user) return [];

  // 2. Get existing badges
  const existingBadges = await sql`
    SELECT badge_id FROM user_badges WHERE user_id = ${userId}
  `;

  const earnedSet = new Set(existingBadges.map(b => b.badge_id as string));

  // 3. Check conditions for each badge
  const newBadges: string[] = [];

  // Capture count badges
  if (!earnedSet.has('first_capture') && user.capture_count >= 1) {
    newBadges.push('first_capture');
  }
  if (!earnedSet.has('captures_10') && user.capture_count >= 10) {
    newBadges.push('captures_10');
  }
  if (!earnedSet.has('captures_50') && user.capture_count >= 50) {
    newBadges.push('captures_50');
  }

  // Points badges
  if (!earnedSet.has('points_1000') && user.points >= 1000) {
    newBadges.push('points_1000');
  }
  if (!earnedSet.has('points_5000') && user.points >= 5000) {
    newBadges.push('points_5000');
  }

  // Rainbow / Golden catch badges - check scans for successful captures
  if (!earnedSet.has('rainbow_catch')) {
    const [result] = await sql`
      SELECT COUNT(*) as count FROM scans
      WHERE user_id = ${userId} AND outcome = 'rainbow_jaileon' AND points_earned > 10
    `;
    if (result && Number(result.count) > 0) newBadges.push('rainbow_catch');
  }

  if (!earnedSet.has('golden_catch')) {
    const [result] = await sql`
      SELECT COUNT(*) as count FROM scans
      WHERE user_id = ${userId} AND outcome = 'golden_jaileon' AND points_earned > 10
    `;
    if (result && Number(result.count) > 0) newBadges.push('golden_catch');
  }

  // All locations badge
  if (!earnedSet.has('all_locations')) {
    const [activeResult] = await sql`
      SELECT COUNT(*) as count FROM qr_locations WHERE is_active = true
    `;
    const activeCount = Number(activeResult?.count || 0);

    const visitedLocs = await sql`
      SELECT DISTINCT qr_location_id FROM scans WHERE user_id = ${userId}
    `;

    if (activeCount > 0 && visitedLocs.length >= activeCount) {
      newBadges.push('all_locations');
    }
  }

  // Streak badges
  if (!earnedSet.has('streak_3') || !earnedSet.has('streak_7') ||
      !earnedSet.has('streak_14') || !earnedSet.has('streak_30')) {
    const today = new Date().toISOString().split('T')[0];
    const scanDates = await sql`
      SELECT DISTINCT date FROM scans
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT 60
    `;

    if (scanDates.length > 0) {
      const uniqueDates = scanDates.map(s => s.date as string);
      let streak = 0;
      const checkDate = new Date(today + 'T00:00:00Z');

      for (const dateStr of uniqueDates) {
        const expected = new Date(checkDate);
        expected.setUTCDate(expected.getUTCDate() - streak);
        const expectedStr = expected.toISOString().split('T')[0];

        if (dateStr === expectedStr) {
          streak++;
        } else if (streak === 0) {
          const yesterday = new Date(checkDate.getTime() - 86400000).toISOString().split('T')[0];
          if (dateStr === yesterday) {
            streak++;
            checkDate.setUTCDate(checkDate.getUTCDate() - 1);
          } else {
            break;
          }
        } else {
          break;
        }
      }

      if (!earnedSet.has('streak_3') && streak >= 3) newBadges.push('streak_3');
      if (!earnedSet.has('streak_7') && streak >= 7) newBadges.push('streak_7');
      if (!earnedSet.has('streak_14') && streak >= 14) newBadges.push('streak_14');
      if (!earnedSet.has('streak_30') && streak >= 30) newBadges.push('streak_30');
    }
  }

  // 4. Insert new badges
  if (newBadges.length > 0) {
    await sql`
      INSERT INTO user_badges (user_id, badge_id)
      SELECT ${userId}, unnest(${newBadges}::text[])
      ON CONFLICT (user_id, badge_id) DO NOTHING
    `;
  }

  return newBadges;
}
