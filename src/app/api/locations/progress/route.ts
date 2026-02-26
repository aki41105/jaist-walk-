import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    const user = await requireAuth();

    const locations = await sql`
      SELECT id, name_ja, name_en, location_number
      FROM qr_locations
      WHERE is_active = true
      ORDER BY location_number ASC
    `;

    const visits = await sql`
      SELECT qr_location_id, scanned_at
      FROM scans
      WHERE user_id = ${user.id}
      ORDER BY scanned_at ASC
    `;

    const firstVisitMap = new Map<string, string>();
    for (const v of visits) {
      const locId = v.qr_location_id as string;
      if (!firstVisitMap.has(locId)) {
        firstVisitMap.set(locId, v.scanned_at as string);
      }
    }

    const result = locations.map(loc => ({
      id: loc.id as string,
      name_ja: loc.name_ja as string,
      name_en: loc.name_en as string,
      location_number: loc.location_number as number,
      visited: firstVisitMap.has(loc.id as string),
      visited_date: firstVisitMap.get(loc.id as string) || null,
    }));

    const visited_count = result.filter(l => l.visited).length;

    return NextResponse.json({
      locations: result,
      visited_count,
      total_count: result.length,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Location progress error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
