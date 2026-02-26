import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { pointOperationSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = pointOperationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { user_id, amount, reason } = parsed.data;

    const [targetUser] = await sql`
      SELECT id, points FROM users WHERE id = ${user_id}
    `;

    if (!targetUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    try {
      const result = await sql`SELECT update_user_points(${user_id}, ${amount}, ${reason}, ${admin.id})`;
      return NextResponse.json({
        success: true,
        new_points: result[0]?.update_user_points ?? 0,
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Insufficient points')) {
        return NextResponse.json(
          { error: 'ポイントが不足しています' },
          { status: 400 }
        );
      }
      throw e;
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Points error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
