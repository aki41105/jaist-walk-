import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import sql from '@/lib/db';
import { z } from 'zod';

const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  body: z.string().min(1, '本文は必須です').max(1000, '本文は1000文字以内で入力してください'),
});

const updateAnnouncementSchema = z.object({
  id: z.string().uuid('無効なIDです'),
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください').optional(),
  body: z.string().min(1, '本文は必須です').max(1000, '本文は1000文字以内で入力してください').optional(),
  is_active: z.boolean().optional(),
});

const deleteAnnouncementSchema = z.object({
  id: z.string().uuid('無効なIDです'),
});

export async function GET() {
  try {
    await requireAdmin();

    const announcements = await sql`
      SELECT * FROM announcements ORDER BY created_at DESC
    `;

    return NextResponse.json(announcements);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin announcements error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, body: announcementBody } = parsed.data;

    const [announcement] = await sql`
      INSERT INTO announcements (title, body)
      VALUES (${title}, ${announcementBody})
      RETURNING *
    `;

    return NextResponse.json(announcement, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin create announcement error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = updateAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { id, title, body: announcementBody, is_active } = parsed.data;

    if (title === undefined && announcementBody === undefined && is_active === undefined) {
      return NextResponse.json(
        { error: '更新する項目がありません' },
        { status: 400 }
      );
    }

    const [announcement] = await sql`
      UPDATE announcements SET
        title = COALESCE(${title ?? null}, title),
        body = COALESCE(${announcementBody ?? null}, body),
        is_active = COALESCE(${is_active ?? null}, is_active)
      WHERE id = ${id}
      RETURNING *
    `;

    if (!announcement) {
      return NextResponse.json(
        { error: 'お知らせが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin update announcement error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = deleteAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { id } = parsed.data;

    const [announcement] = await sql`
      DELETE FROM announcements
      WHERE id = ${id}
      RETURNING id
    `;

    if (!announcement) {
      return NextResponse.json(
        { error: 'お知らせが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (err.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Admin delete announcement error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
