import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    // Always return success to prevent email enumeration
    if (user) {
      try {
        await sendRecoveryEmail(email, user.id);
      } catch {
        console.error('Failed to send recovery email');
      }
    }

    return NextResponse.json({
      message: '登録されたメールアドレスの場合、IDを送信しました',
    });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
