import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import sql from '@/lib/db';
import type { UserProfile, CaptureOutcome } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const recentScans = await sql`
      SELECT s.*, ql.name_ja, ql.name_en
      FROM scans s
      LEFT JOIN qr_locations ql ON ql.id = s.qr_location_id
      WHERE s.user_id = ${user.id}
      ORDER BY s.scanned_at DESC
      LIMIT 20
    `;

    const recentTransactions = await sql`
      SELECT * FROM point_transactions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const today = new Date().toISOString().split('T')[0];
    const scanDates = await sql`
      SELECT DISTINCT date FROM scans
      WHERE user_id = ${user.id}
      ORDER BY date DESC
      LIMIT 60
    `;

    let streak = 0;
    if (scanDates.length > 0) {
      const uniqueDates = scanDates.map(s => s.date as string).sort().reverse();
      const checkDate = new Date(today + 'T00:00:00Z');
      for (const dateStr of uniqueDates) {
        const expected = new Date(checkDate);
        expected.setUTCDate(expected.getUTCDate() - streak);
        if (dateStr === expected.toISOString().split('T')[0]) {
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
    }

    const emailParts = user.email.split('@');
    const maskedLocal = emailParts[0].slice(0, 2) + '***';
    const maskedEmail = `${maskedLocal}@${emailParts[1]}`;

    const profile: UserProfile = {
      id: user.id,
      name: user.name,
      email: maskedEmail,
      affiliation: user.affiliation,
      research_area: user.research_area,
      role: user.role,
      avatar: user.avatar || 'green',
      avatar_url: user.avatar_url || null,
      points: user.points,
      capture_count: user.capture_count,
      streak,
      recent_scans: recentScans.map((scan) => ({
        id: scan.id as string,
        user_id: scan.user_id as string,
        qr_location_id: scan.qr_location_id as string,
        outcome: scan.outcome as CaptureOutcome,
        points_earned: scan.points_earned as number,
        date: scan.date as string,
        scanned_at: scan.scanned_at as string,
        location_name: (scan.name_ja as string) || '',
      })),
      recent_transactions: recentTransactions as unknown as UserProfile['recent_transactions'],
    };

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
