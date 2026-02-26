import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/session';
import { captureSchema } from '@/lib/validation';
import { getDailyOutcome } from '@/lib/qr-outcome';
import { checkAndAwardBadges } from '@/lib/badges';
import type { CaptureOutcome } from '@/types';

const CATCH_RATES: Record<CaptureOutcome, number> = {
  jaileon: 0.50,
  yellow_jaileon: 0.45,
  blue_jaileon: 0.40,
  rainbow_jaileon: 0.35,
  bird: 1.0,
  golden_jaileon: 1.0,
};

const SUCCESS_POINTS: Record<CaptureOutcome, number> = {
  jaileon: 100,
  yellow_jaileon: 150,
  blue_jaileon: 200,
  rainbow_jaileon: 500,
  bird: 10,
  golden_jaileon: 300,
};

const ESCAPE_POINTS = 5;

const OUTCOME_NAMES: Record<CaptureOutcome, string> = {
  jaileon: 'ジャイレオン',
  yellow_jaileon: '黄ジャイレオン',
  blue_jaileon: '青ジャイレオン',
  rainbow_jaileon: '虹色ジャイレオン',
  bird: '小鳥',
  golden_jaileon: '金色ジャイレオン',
};

// Streak milestone bonuses
const STREAK_BONUSES: Record<number, number> = {
  3: 50,
  7: 150,
  14: 300,
  30: 500,
};

function isJSTMorning(): boolean {
  const now = new Date();
  const jstHour = (now.getUTCHours() + 9) % 24;
  return jstHour >= 7 && jstHour < 10;
}

async function getUserStreak(userId: string, today: string): Promise<number> {
  const { data: scanDates } = await supabase
    .from('scans')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(60);

  if (!scanDates || scanDates.length === 0) return 0;

  const uniqueDates = [...new Set(scanDates.map(s => s.date))].sort().reverse();

  // Count streak backwards from today (or yesterday if no scan today yet)
  let streak = 0;
  const checkDate = new Date(today + 'T00:00:00Z');

  for (const dateStr of uniqueDates) {
    const expected = new Date(checkDate);
    expected.setUTCDate(expected.getUTCDate() - streak);
    const expectedStr = expected.toISOString().split('T')[0];

    if (dateStr === expectedStr) {
      streak++;
    } else if (streak === 0 && dateStr === new Date(new Date(today + 'T00:00:00Z').getTime() - 86400000).toISOString().split('T')[0]) {
      // If no scan today yet, start counting from yesterday
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = captureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { qr_code } = parsed.data;
    const today = new Date().toISOString().split('T')[0];

    // Find QR location
    const { data: qrLocation } = await supabase
      .from('qr_locations')
      .select('*')
      .eq('code', qr_code)
      .single();

    if (!qrLocation) {
      return NextResponse.json(
        { error: '無効なQRコードです', code: 'INVALID_QR' },
        { status: 404 }
      );
    }

    if (!qrLocation.is_active) {
      return NextResponse.json(
        { error: 'このQRコードは現在無効です', code: 'INACTIVE_QR' },
        { status: 403 }
      );
    }

    // Check if already scanned today at this location
    const { data: existingScan } = await supabase
      .from('scans')
      .select('id')
      .eq('user_id', user.id)
      .eq('qr_location_id', qrLocation.id)
      .eq('date', today)
      .single();

    if (existingScan) {
      return NextResponse.json(
        { error: '本日このQRコードは既にスキャン済みです', code: 'ALREADY_SCANNED' },
        { status: 409 }
      );
    }

    // Check if this is the user's first scan today (for golden jaileon)
    const { count: todayScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('date', today);

    const isFirstScanToday = (todayScans || 0) === 0;
    const isMorning = isJSTMorning();

    // Determine outcome
    let outcome: CaptureOutcome;
    if (isFirstScanToday && isMorning) {
      outcome = 'golden_jaileon';
    } else {
      outcome = await getDailyOutcome(qrLocation.id, today);
    }

    // Determine capture success
    const catchRate = CATCH_RATES[outcome];
    const captured = Math.random() < catchRate;
    const pointsEarned = captured ? SUCCESS_POINTS[outcome] : ESCAPE_POINTS;

    // Check streak bonus (awarded on first scan of the day)
    let streakBonus = 0;
    let streakCount = 0;
    if (isFirstScanToday) {
      streakCount = (await getUserStreak(user.id, today)) + 1; // +1 for today
      streakBonus = STREAK_BONUSES[streakCount] || 0;
    }

    // Record scan
    const { error: scanError } = await supabase.from('scans').insert({
      user_id: user.id,
      qr_location_id: qrLocation.id,
      outcome,
      points_earned: pointsEarned + streakBonus,
      date: today,
    });

    if (scanError) {
      if (scanError.code === '23505') {
        return NextResponse.json(
          { error: '本日このQRコードは既にスキャン済みです', code: 'ALREADY_SCANNED' },
          { status: 409 }
        );
      }
      throw scanError;
    }

    // Build reason message
    const charName = OUTCOME_NAMES[outcome];
    let reason: string;
    if (outcome === 'bird') {
      reason = `${charName}発見 (${qrLocation.name_ja})`;
    } else {
      reason = captured
        ? `${charName}捕獲${outcome === 'rainbow_jaileon' || outcome === 'golden_jaileon' ? '！' : ''} (${qrLocation.name_ja})`
        : `${charName}に逃げられた (${qrLocation.name_ja})`;
    }

    await supabase.rpc('update_user_points', {
      p_user_id: user.id,
      p_amount: pointsEarned,
      p_reason: reason,
    });

    // Record streak bonus as separate transaction
    if (streakBonus > 0) {
      await supabase.rpc('update_user_points', {
        p_user_id: user.id,
        p_amount: streakBonus,
        p_reason: `${streakCount}日連続スキャンボーナス！`,
      });
    }

    // Update capture count for jaileon-type captures that succeeded
    if (captured && outcome !== 'bird') {
      await supabase
        .from('users')
        .update({ capture_count: user.capture_count + 1 })
        .eq('id', user.id);
    }

    // Record anonymous statistics
    await supabase.from('privacy_scan_log').insert({
      affiliation: user.affiliation,
      research_area: user.research_area,
      location_number: qrLocation.location_number,
    });

    // Get updated user data
    const { data: updatedUser } = await supabase
      .from('users')
      .select('points, capture_count')
      .eq('id', user.id)
      .single();

    // Check and award badges
    let new_badges: string[] = [];
    try {
      new_badges = await checkAndAwardBadges(user.id);
    } catch (e) {
      console.error('Badge check error:', e);
    }

    return NextResponse.json({
      outcome,
      captured,
      points_earned: pointsEarned,
      total_points: updatedUser?.points ?? 0,
      capture_count: updatedUser?.capture_count ?? 0,
      location_name: qrLocation.name_ja,
      streak: isFirstScanToday ? streakCount : undefined,
      streak_bonus: streakBonus > 0 ? streakBonus : undefined,
      new_badges,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Capture error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
