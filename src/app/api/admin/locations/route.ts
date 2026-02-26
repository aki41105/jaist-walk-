import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/session';
import { createLocationSchema, updateLocationSchema } from '@/lib/validation';

// GET: List all locations with scan counts
export async function GET() {
  try {
    await requireAdmin();

    const { data: locations, error } = await supabase
      .from('qr_locations')
      .select('*')
      .order('location_number', { ascending: true });

    if (error) throw error;

    // Get scan counts per location
    const { data: scanCounts, error: scanError } = await supabase
      .from('scans')
      .select('qr_location_id');

    if (scanError) throw scanError;

    // Count scans per location
    const countMap: Record<string, number> = {};
    for (const scan of scanCounts || []) {
      countMap[scan.qr_location_id] = (countMap[scan.qr_location_id] || 0) + 1;
    }

    const locationsWithCounts = (locations || []).map(loc => ({
      ...loc,
      scan_count: countMap[loc.id] || 0,
    }));

    return NextResponse.json({ locations: locationsWithCounts });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin locations error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// POST: Create a new location
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createLocationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name_ja, name_en, location_number } = parsed.data;

    // Check for duplicate location_number
    const { data: existing } = await supabase
      .from('qr_locations')
      .select('id')
      .eq('location_number', location_number)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'このロケーション番号は既に使用されています' },
        { status: 409 }
      );
    }

    const { data: location, error } = await supabase
      .from('qr_locations')
      .insert({
        name_ja,
        name_en,
        location_number,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ location }, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin create location error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// PATCH: Update location (toggle active status)
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = updateLocationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { id, is_active, name_ja, name_en } = parsed.data;

    const updates: Record<string, unknown> = {};
    if (is_active !== undefined) updates.is_active = is_active;
    if (name_ja !== undefined) updates.name_ja = name_ja;
    if (name_en !== undefined) updates.name_en = name_en;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '更新する項目がありません' },
        { status: 400 }
      );
    }

    const { data: location, error } = await supabase
      .from('qr_locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!location) {
      return NextResponse.json(
        { error: 'ロケーションが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ location });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin update location error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
