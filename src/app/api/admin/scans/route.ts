import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/session';
import { scanStatsSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = scanStatsSchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { days } = parsed.data;

    // Fetch all three stats in parallel
    const [dailyResult, rankingResult, outcomeResult] = await Promise.all([
      supabase.rpc('get_daily_scan_counts', { days_back: days }),
      supabase.rpc('get_location_ranking', { days_back: days }),
      supabase.rpc('get_outcome_distribution', { days_back: days }),
    ]);

    if (dailyResult.error) throw dailyResult.error;
    if (rankingResult.error) throw rankingResult.error;
    if (outcomeResult.error) throw outcomeResult.error;

    return NextResponse.json({
      daily_scans: dailyResult.data || [],
      location_ranking: rankingResult.data || [],
      outcome_distribution: outcomeResult.data || [],
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin scans error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
