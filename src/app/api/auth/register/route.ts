import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    // Check if name already exists
    const { data: existingName } = await supabase
      .from('users')
      .select('id')
      .eq('name', name)
      .single();

    if (existingName) {
      return NextResponse.json(
        { error: 'このアカウント名は既に使用されています' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }

    // Generate unique user ID
    let userId: string;
    let attempts = 0;
    do {
      userId = generateUserId();
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      if (!data) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'IDの生成に失敗しました。再度お試しください' },
        { status: 500 }
      );
    }

    // Create user
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      name,
      email,
      affiliation,
      research_area,
    });

    if (insertError) {
      console.error('User insert error:', insertError.message, insertError.code);
      return NextResponse.json(
        { error: '登録に失敗しました' },
        { status: 500 }
      );
    }

    // Send email with ID
    try {
      await sendRegistrationEmail(email, name);
    } catch {
      // Email failure shouldn't block registration
      console.error('Failed to send registration email');
    }

    // Create session
    await createSession(userId);

    return NextResponse.json({ user_id: userId, name }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
