import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
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

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().split('T')[0];

    const [scans, locations] = await Promise.all([
      sql`SELECT date, outcome, qr_location_id FROM scans WHERE date >= ${startDateStr}`,
      sql`SELECT id, name_ja, name_en, location_number FROM qr_locations`,
    ]);

    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      dailyCounts[d.toISOString().split('T')[0]] = 0;
    }
    for (const scan of scans) {
      const date = scan.date as string;
      if (dailyCounts[date] !== undefined) {
        dailyCounts[date]++;
      }
    }
    const daily_scans = Object.entries(dailyCounts).map(([scan_date, scan_count]) => ({
      scan_date,
      scan_count,
    }));

    const locCounts: Record<string, number> = {};
    for (const scan of scans) {
      const locId = scan.qr_location_id as string;
      locCounts[locId] = (locCounts[locId] || 0) + 1;
    }
    const location_ranking = locations
      .map(loc => ({
        location_id: loc.id as string,
        name_ja: loc.name_ja as string,
        name_en: loc.name_en as string,
        location_number: loc.location_number as number,
        scan_count: locCounts[loc.id as string] || 0,
      }))
      .sort((a, b) => b.scan_count - a.scan_count);

    const outcomeCounts: Record<string, number> = {};
    for (const scan of scans) {
      const outcome = scan.outcome as string;
      outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
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
