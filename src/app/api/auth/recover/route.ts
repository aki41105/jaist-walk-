import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { recoverSchema } from '@/lib/validation';
import { sendRecoveryEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = recoverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const [user] = await sql`
      SELECT id, name FROM users WHERE email = ${email}
    `;

    if (user) {
      try {
        await sendRecoveryEmail(email, user.name as string);
      } catch {
        console.error('Failed to send recovery email');
      }
    }

    return NextResponse.json({
      message: '登録されたメールアドレスの場合、アカウント名を送信しました',
    });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
