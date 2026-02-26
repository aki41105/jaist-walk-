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

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().split('T')[0];

    // Fetch scans and locations in parallel
    const [scansResult, locationsResult] = await Promise.all([
      supabase
        .from('scans')
        .select('date, outcome, qr_location_id')
        .gte('date', startDateStr),
      supabase
        .from('qr_locations')
        .select('id, name_ja, name_en, location_number'),
    ]);

    if (scansResult.error) throw scansResult.error;
    if (locationsResult.error) throw locationsResult.error;

    const scans = scansResult.data || [];
    const locations = locationsResult.data || [];

    // Build daily scan counts (fill in zero-days)
    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      dailyCounts[d.toISOString().split('T')[0]] = 0;
    }
    for (const scan of scans) {
      if (dailyCounts[scan.date] !== undefined) {
        dailyCounts[scan.date]++;
      }
    }
    const daily_scans = Object.entries(dailyCounts).map(([scan_date, scan_count]) => ({
      scan_date,
      scan_count,
    }));

    // Build location ranking
    const locCounts: Record<string, number> = {};
    for (const scan of scans) {
      locCounts[scan.qr_location_id] = (locCounts[scan.qr_location_id] || 0) + 1;
    }
    const location_ranking = locations
      .map(loc => ({
        location_id: loc.id,
        name_ja: loc.name_ja,
        name_en: loc.name_en,
        location_number: loc.location_number,
        scan_count: locCounts[loc.id] || 0,
      }))
      .sort((a, b) => b.scan_count - a.scan_count);

    // Build outcome distribution
    const outcomeCounts: Record<string, number> = {};
    for (const scan of scans) {
      outcomeCounts[scan.outcome] = (outcomeCounts[scan.outcome] || 0) + 1;
    }
    const outcome_distribution = Object.entries(outcomeCounts)
      .map(([outcome, outcome_count]) => ({ outcome, outcome_count }))
      .sort((a, b) => b.outcome_count - a.outcome_count);

    return NextResponse.json({
      daily_scans,
      location_ranking,
      outcome_distribution,
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
