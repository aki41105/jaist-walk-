import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/session';
import { captureSchema } from '@/lib/validation';
import { getDailyOutcome } from '@/lib/qr-outcome';

const JAILEON_POINTS = 100;
const BIRD_POINTS = 10;

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

    // Check if already scanned today
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

    // Get daily outcome for this QR
    const outcome = await getDailyOutcome(qrLocation.id, today);
    const pointsEarned = outcome === 'jaileon' ? JAILEON_POINTS : BIRD_POINTS;

    // Record scan
    const { error: scanError } = await supabase.from('scans').insert({
      user_id: user.id,
      qr_location_id: qrLocation.id,
      outcome,
      points_earned: pointsEarned,
      date: today,
    });

    if (scanError) {
      // Handle race condition with unique constraint
      if (scanError.code === '23505') {
        return NextResponse.json(
          { error: '本日このQRコードは既にスキャン済みです', code: 'ALREADY_SCANNED' },
          { status: 409 }
        );
      }
      throw scanError;
    }

    // Update points and capture count
    const reason = outcome === 'jaileon'
      ? `ジャイレオン捕獲 (${qrLocation.name_ja})`
      : `小鳥発見 (${qrLocation.name_ja})`;

    await supabase.rpc('update_user_points', {
      p_user_id: user.id,
      p_amount: pointsEarned,
      p_reason: reason,
    });

    // Update capture count if jaileon
    if (outcome === 'jaileon') {
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

    return NextResponse.json({
      outcome,
      points_earned: pointsEarned,
      total_points: updatedUser?.points ?? 0,
      capture_count: updatedUser?.capture_count ?? 0,
      location_name: qrLocation.name_ja,
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
