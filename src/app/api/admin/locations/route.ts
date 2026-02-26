import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { createLocationSchema, updateLocationSchema } from '@/lib/validation';

export async function GET() {
  try {
    await requireAdmin();

    const locations = await sql`
      SELECT * FROM qr_locations ORDER BY location_number ASC
    `;

    const scanCounts = await sql`
      SELECT qr_location_id, COUNT(*)::int as count FROM scans GROUP BY qr_location_id
    `;

    const countMap: Record<string, number> = {};
    for (const sc of scanCounts) {
      countMap[sc.qr_location_id as string] = sc.count as number;
    }

    const locationsWithCounts = locations.map(loc => ({
      ...loc,
      scan_count: countMap[loc.id as string] || 0,
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

    const [existing] = await sql`
      SELECT id FROM qr_locations WHERE location_number = ${location_number}
    `;

    if (existing) {
      return NextResponse.json(
        { error: 'このロケーション番号は既に使用されています' },
        { status: 409 }
      );
    }

    const [location] = await sql`
      INSERT INTO qr_locations (name_ja, name_en, location_number)
      VALUES (${name_ja}, ${name_en}, ${location_number})
      RETURNING *
    `;

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

    const [location] = await sql`
      UPDATE qr_locations SET
        is_active = COALESCE(${updates.is_active !== undefined ? updates.is_active : null}, is_active),
        name_ja = COALESCE(${updates.name_ja !== undefined ? updates.name_ja as string : null}, name_ja),
        name_en = COALESCE(${updates.name_en !== undefined ? updates.name_en as string : null}, name_en)
      WHERE id = ${id}
      RETURNING *
    `;

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
