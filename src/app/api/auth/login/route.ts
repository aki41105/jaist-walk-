import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { createSession } from '@/lib/session';
import { loginSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    const [user] = await sql`
      SELECT id FROM users WHERE name = ${name}
    `;

    if (!user) {
      return NextResponse.json(
        { error: 'アカウント名が正しくありません' },
        { status: 401 }
      );
    }

    await createSession(user.id as string);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
