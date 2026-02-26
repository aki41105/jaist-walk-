import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
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
  avatar: z.enum(['green', 'yellow', 'blue', 'rainbow', 'bird'])
    .optional(),
  avatar_url: z.string().url().nullable().optional(),
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

    const updates: Record<string, string | null> = {};

    if (parsed.data.avatar && parsed.data.avatar !== user.avatar) {
      updates.avatar = parsed.data.avatar;
    }

    if (parsed.data.avatar_url !== undefined) {
      updates.avatar_url = parsed.data.avatar_url;
    }

    if (parsed.data.name && parsed.data.name !== user.name) {
      const [existingName] = await sql`
        SELECT id FROM users WHERE name = ${parsed.data.name}
      `;

      if (existingName) {
        return NextResponse.json(
          { error: 'このアカウント名は既に使用されています' },
          { status: 409 }
        );
      }
      updates.name = parsed.data.name;
    }

    if (parsed.data.email && parsed.data.email !== user.email) {
      const [existingEmail] = await sql`
        SELECT id FROM users WHERE email = ${parsed.data.email}
      `;

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

    await sql`
      UPDATE users SET
        name = COALESCE(${updates.name ?? null}, name),
        email = COALESCE(${updates.email ?? null}, email),
        avatar = COALESCE(${updates.avatar ?? null}, avatar),
        avatar_url = ${updates.avatar_url !== undefined ? updates.avatar_url : null}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
