import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { exchangeSchema } from '@/lib/validation';
import sql from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();

    const exchanges = await sql`
      SELECT e.id, e.reward_id, e.points_spent, e.status, e.exchange_code,
             e.used_at, e.created_at,
             json_build_object('name_ja', r.name_ja, 'name_en', r.name_en) as rewards
      FROM exchanges e
      LEFT JOIN rewards r ON r.id = e.reward_id
      WHERE e.user_id = ${user.id}
      ORDER BY e.created_at DESC
    `;

    return NextResponse.json(exchanges);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Exchange history error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = exchangeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { reward_id } = parsed.data;

    // Execute exchange via direct SQL in a transaction
    const result = await sql.begin(async (tx) => {
      // Lock user and reward rows
      const [userData] = await tx`
        SELECT id, points FROM users WHERE id = ${user.id} FOR UPDATE
      `;
      const [reward] = await tx`
        SELECT id, required_points, stock, is_active FROM rewards WHERE id = ${reward_id} FOR UPDATE
      `;

      if (!reward || !reward.is_active) {
        throw new Error('REWARD_INACTIVE');
      }
      if ((reward.stock as number) <= 0) {
        throw new Error('OUT_OF_STOCK');
      }
      if ((userData.points as number) < (reward.required_points as number)) {
        throw new Error('INSUFFICIENT_POINTS');
      }

      const requiredPoints = reward.required_points as number;

      // Deduct points
      await tx`
        UPDATE users SET points = points - ${requiredPoints} WHERE id = ${user.id}
      `;

      // Decrease stock
      await tx`
        UPDATE rewards SET stock = stock - 1 WHERE id = ${reward_id}
      `;

      // Generate exchange code
      const code = 'EX-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create exchange record
      const [exchange] = await tx`
        INSERT INTO exchanges (user_id, reward_id, points_spent, status, exchange_code)
        VALUES (${user.id}, ${reward_id}, ${requiredPoints}, 'pending', ${code})
        RETURNING id, exchange_code
      `;

      // Record point transaction
      await tx`
        INSERT INTO point_transactions (user_id, amount, reason)
        VALUES (${user.id}, ${-requiredPoints}, ${'ポイント交換: ' + code})
      `;

      const pointsAfter = (userData.points as number) - requiredPoints;

      return {
        exchange_id: exchange.id,
        exchange_code: exchange.exchange_code,
        points_after: pointsAfter,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof Error) {
      const msg = err.message;
      if (msg === 'INSUFFICIENT_POINTS') {
        return NextResponse.json({ error: 'ポイントが不足しています' }, { status: 400 });
      }
      if (msg === 'OUT_OF_STOCK') {
        return NextResponse.json({ error: '在庫がありません' }, { status: 400 });
      }
      if (msg === 'REWARD_INACTIVE') {
        return NextResponse.json({ error: 'この景品は現在利用できません' }, { status: 400 });
      }
    }
    console.error('Exchange error:', err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
