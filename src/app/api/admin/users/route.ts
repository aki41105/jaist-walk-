import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    let query = supabase
      .from('users')
      .select('id, name, email, affiliation, research_area, role, points, capture_count, created_at', { count: 'exact' });

    // Text search (ID, name, or email partial match)
    if (search) {
      query = query.or(`id.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Filters
    if (affiliation) {
      query = query.eq('affiliation', affiliation);
    }
    if (research_area) {
      query = query.eq('research_area', research_area);
    }

    // Sort
    query = query.order(sort, { ascending: order === 'asc' });

    // Pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data: users, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
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
