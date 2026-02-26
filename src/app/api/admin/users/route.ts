import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { adminUserListSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = adminUserListSchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { search, affiliation, research_area, sort, order, page, per_page } = parsed.data;

    const offset = (page - 1) * per_page;
    const orderDir = order === 'asc' ? sql`ASC` : sql`DESC`;

    // Build dynamic WHERE clauses
    const conditions = [];
    if (search) {
      conditions.push(sql`(id ILIKE ${'%' + search + '%'} OR name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'})`);
    }
    if (affiliation) {
      conditions.push(sql`affiliation = ${affiliation}`);
    }
    if (research_area) {
      conditions.push(sql`research_area = ${research_area}`);
    }

    const whereClause = conditions.length > 0
      ? sql`WHERE ${conditions.reduce((acc, cond, i) => i === 0 ? cond : sql`${acc} AND ${cond}`)}`
      : sql``;

    // Map sort column safely
    const sortColumns: Record<string, ReturnType<typeof sql>> = {
      created_at: sql`created_at`,
      points: sql`points`,
      capture_count: sql`capture_count`,
      name: sql`name`,
    };
    const sortCol = sortColumns[sort] || sql`created_at`;

    const [countResult] = await sql`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `;

    const users = await sql`
      SELECT id, name, email, affiliation, research_area, role, points, capture_count, created_at
      FROM users ${whereClause}
      ORDER BY ${sortCol} ${orderDir}
      LIMIT ${per_page} OFFSET ${offset}
    `;

    const total = Number(countResult.total);

    return NextResponse.json({
      users,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
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
    console.error('Admin users error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
