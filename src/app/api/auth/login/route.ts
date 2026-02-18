import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    const { user_id } = parsed.data;

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'IDが見つかりません' },
        { status: 404 }
      );
    }

    await createSession(user_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
