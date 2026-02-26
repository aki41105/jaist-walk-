import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    const user = await requireAuth();

    // Get all active locations
    const { data: locations, error: locError } = await supabase
      .from('qr_locations')
      .select('id, name_ja, name_en, location_number')
      .eq('is_active', true)
      .order('location_number', { ascending: true });

    if (locError) throw locError;

    // Get user's visited locations (distinct qr_location_id)
    const { data: visits, error: visitError } = await supabase
      .from('scans')
      .select('qr_location_id, scanned_at')
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: true });

    if (visitError) throw visitError;

    // Build first-visit map
    const firstVisitMap = new Map<string, string>();
    for (const v of visits || []) {
      if (!firstVisitMap.has(v.qr_location_id)) {
        firstVisitMap.set(v.qr_location_id, v.scanned_at);
      }
    }

    const result = (locations || []).map(loc => ({
      id: loc.id,
      name_ja: loc.name_ja,
      name_en: loc.name_en,
      location_number: loc.location_number,
      visited: firstVisitMap.has(loc.id),
      visited_date: firstVisitMap.get(loc.id) || null,
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
