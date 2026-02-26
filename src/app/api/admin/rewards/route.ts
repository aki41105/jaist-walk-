import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { createRewardSchema, updateRewardSchema } from '@/lib/validation';
import sql from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();

    const rewards = await sql`
      SELECT * FROM rewards ORDER BY created_at DESC
    `;

    return NextResponse.json(rewards);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin rewards error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = createRewardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const d = parsed.data;
    const [reward] = await sql`
      INSERT INTO rewards (name_ja, name_en, description_ja, description_en, required_points, stock)
      VALUES (${d.name_ja}, ${d.name_en}, ${d.description_ja}, ${d.description_en}, ${d.required_points}, ${d.stock})
      RETURNING *
    `;

    return NextResponse.json(reward, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create reward error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = updateRewardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;

    // Build dynamic update
    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        setClauses.push(key);
        values.push(value);
      }
    }

    // Use individual field updates
    const [reward] = await sql`
      UPDATE rewards SET
        name_ja = COALESCE(${updates.name_ja ?? null}, name_ja),
        name_en = COALESCE(${updates.name_en ?? null}, name_en),
        description_ja = COALESCE(${updates.description_ja ?? null}, description_ja),
        description_en = COALESCE(${updates.description_en ?? null}, description_en),
        required_points = COALESCE(${updates.required_points ?? null}, required_points),
        stock = COALESCE(${updates.stock ?? null}, stock),
        is_active = COALESCE(${updates.is_active ?? null}, is_active)
      WHERE id = ${id}
      RETURNING *
    `;

    if (!reward) {
      return NextResponse.json({ error: '景品が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(reward);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update reward error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
