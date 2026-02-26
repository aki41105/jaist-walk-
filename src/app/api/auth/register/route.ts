import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { generateUserId, createSession } from '@/lib/session';
import { registerSchema } from '@/lib/validation';
import { sendRegistrationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, affiliation, research_area } = parsed.data;

    const [existingName] = await sql`
      SELECT id FROM users WHERE name = ${name}
    `;

    if (existingName) {
      return NextResponse.json(
        { error: 'このアカウント名は既に使用されています' },
        { status: 409 }
      );
    }

    const [existing] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }

    let userId: string;
    let attempts = 0;
    do {
      userId = generateUserId();
      const [data] = await sql`
        SELECT id FROM users WHERE id = ${userId}
      `;
      if (!data) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'IDの生成に失敗しました。再度お試しください' },
        { status: 500 }
      );
    }

    await sql`
      INSERT INTO users (id, name, email, affiliation, research_area)
      VALUES (${userId}, ${name}, ${email}, ${affiliation}, ${research_area})
    `;

    try {
      await sendRegistrationEmail(email, name);
    } catch {
      console.error('Failed to send registration email');
    }

    await createSession(userId);

    return NextResponse.json({ user_id: userId, name }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
