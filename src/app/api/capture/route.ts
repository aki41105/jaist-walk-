import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAuth } from '@/lib/session';
import { captureSchema } from '@/lib/validation';
import { getDailyOutcome } from '@/lib/qr-outcome';
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
  golden_jaileon: '早起きジャイレオン',
};

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
  const scanDates = await sql`
    SELECT DISTINCT date FROM scans
    WHERE user_id = ${userId}
    ORDER BY date DESC
    LIMIT 60
  `;

  if (scanDates.length === 0) return 0;

  const uniqueDates = scanDates.map(s => s.date as string).sort().reverse();

  let streak = 0;
  const checkDate = new Date(today + 'T00:00:00Z');

  for (const dateStr of uniqueDates) {
    const expected = new Date(checkDate);
    expected.setUTCDate(expected.getUTCDate() - streak);
    const expectedStr = expected.toISOString().split('T')[0];

    if (dateStr === expectedStr) {
      streak++;
    } else if (streak === 0 && dateStr === new Date(new Date(today + 'T00:00:00Z').getTime() - 86400000).toISOString().split('T')[0]) {
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

    const [qrLocation] = await sql`
      SELECT * FROM qr_locations WHERE code = ${qr_code}
    `;

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

    const isTest = qrLocation.is_test as boolean;

    if (isTest) {
      // Test QR: delete existing scan for today so it can be re-scanned
      await sql`
        DELETE FROM scans
        WHERE user_id = ${user.id} AND qr_location_id = ${qrLocation.id} AND date = ${today}
      `;
    } else {
      const [existingScan] = await sql`
        SELECT id FROM scans
        WHERE user_id = ${user.id} AND qr_location_id = ${qrLocation.id} AND date = ${today}
      `;

      if (existingScan) {
        return NextResponse.json(
          { error: '本日このQRコードは既にスキャン済みです', code: 'ALREADY_SCANNED' },
          { status: 409 }
        );
      }
    }

    const [todayScansResult] = await sql`
      SELECT COUNT(*) as count FROM scans
      WHERE user_id = ${user.id} AND date = ${today}
    `;

    const isFirstScanToday = Number(todayScansResult.count) === 0;
    const isMorning = isJSTMorning();

    let outcome: CaptureOutcome;
    if (isTest) {
      // Test QR: random outcome each scan based on existing probabilities
      const roll = Math.random();
      if (roll < 0.05) outcome = 'rainbow_jaileon';
      else if (roll < 0.15) outcome = 'blue_jaileon';
      else if (roll < 0.35) outcome = 'yellow_jaileon';
      else if (roll < 0.80) outcome = 'jaileon';
      else outcome = 'bird';
    } else if (isFirstScanToday && isMorning) {
      outcome = 'golden_jaileon';
    } else {
      outcome = await getDailyOutcome(qrLocation.id as string, today);
    }

    const catchRate = CATCH_RATES[outcome];
    const captured = Math.random() < catchRate;
    const pointsEarned = captured ? SUCCESS_POINTS[outcome] : ESCAPE_POINTS;

    let streakBonus = 0;
    let streakCount = 0;
    if (isFirstScanToday) {
      streakCount = (await getUserStreak(user.id, today)) + 1;
      streakBonus = STREAK_BONUSES[streakCount] || 0;
    }

    try {
      await sql`
        INSERT INTO scans (user_id, qr_location_id, outcome, points_earned, date)
        VALUES (${user.id}, ${qrLocation.id}, ${outcome}, ${pointsEarned + streakBonus}, ${today})
      `;
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('23505')) {
        return NextResponse.json(
          { error: '本日このQRコードは既にスキャン済みです', code: 'ALREADY_SCANNED' },
          { status: 409 }
        );
      }
      throw e;
    }

    const charName = OUTCOME_NAMES[outcome];
    let reason: string;
    if (outcome === 'bird') {
      reason = `${charName}発見 (${qrLocation.name_ja})`;
    } else {
      reason = captured
        ? `${charName}捕獲${outcome === 'rainbow_jaileon' || outcome === 'golden_jaileon' ? '！' : ''} (${qrLocation.name_ja})`
        : `${charName}に逃げられた (${qrLocation.name_ja})`;
    }

    await sql`SELECT update_user_points(${user.id}, ${pointsEarned}, ${reason}, NULL)`;

    if (streakBonus > 0) {
      await sql`SELECT update_user_points(${user.id}, ${streakBonus}, ${`${streakCount}日連続スキャンボーナス！`}, NULL)`;
    }

    if (captured && outcome !== 'bird') {
      await sql`
        UPDATE users SET capture_count = capture_count + 1 WHERE id = ${user.id}
      `;
    }

    await sql`
      INSERT INTO privacy_scan_log (affiliation, research_area, location_number)
      VALUES (${user.affiliation}, ${user.research_area}, ${qrLocation.location_number})
    `;

    const [updatedUser] = await sql`
      SELECT points, capture_count FROM users WHERE id = ${user.id}
    `;

    return NextResponse.json({
      outcome,
      captured,
      points_earned: pointsEarned,
      total_points: (updatedUser?.points as number) ?? 0,
      capture_count: (updatedUser?.capture_count as number) ?? 0,
      location_name: qrLocation.name_ja,
      streak: isFirstScanToday ? streakCount : undefined,
      streak_bonus: streakBonus > 0 ? streakBonus : undefined,
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
