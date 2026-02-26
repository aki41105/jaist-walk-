import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const announcements = await sql`
      SELECT id, title, body, created_at
      FROM announcements
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 10
    `;
    return NextResponse.json(announcements);
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
