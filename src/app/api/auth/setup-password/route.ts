import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { setupPasswordSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = setupPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Verify identity: name + email must match
    const [user] = await sql`
      SELECT id, password_hash FROM users WHERE name = ${name} AND email = ${email}
    `;

    if (!user) {
      return NextResponse.json(
        { error: 'アカウント名またはメールアドレスが正しくありません' },
        { status: 401 }
      );
    }

    // Only allow if password hasn't been set yet
    if (user.password_hash) {
      return NextResponse.json(
        { error: 'パスワードは既に設定されています。ログインしてください。' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    await sql`
      UPDATE users SET password_hash = ${passwordHash} WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
