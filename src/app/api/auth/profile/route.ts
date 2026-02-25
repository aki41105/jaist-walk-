import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/session';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内にしてください')
    .trim()
    .regex(/^[^\s<>"';&|\\]+$/, '使用できない文字が含まれています')
    .optional(),
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updates: Record<string, string> = {};

    // Check name uniqueness
    if (parsed.data.name && parsed.data.name !== user.name) {
      const { data: existingName } = await supabase
        .from('users')
        .select('id')
        .eq('name', parsed.data.name)
        .single();

      if (existingName) {
        return NextResponse.json(
          { error: 'このアカウント名は既に使用されています' },
          { status: 409 }
        );
      }
      updates.name = parsed.data.name;
    }

    // Check email uniqueness
    if (parsed.data.email && parsed.data.email !== user.email) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', parsed.data.email)
        .single();

      if (existingEmail) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 409 }
        );
      }
      updates.email = parsed.data.email;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: '変更はありません' });
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Profile update error:', error.message);
      return NextResponse.json(
        { error: 'プロフィールの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
