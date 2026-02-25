import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/session';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_NAME = 'avatars';

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET_NAME);
  if (!data) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPEG, PNG, WebP形式のみ対応しています' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズは2MB以下にしてください' },
        { status: 400 },
      );
    }

    await ensureBucket();

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `${user.id}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError.message);
      return NextResponse.json(
        { error: 'アップロードに失敗しました' },
        { status: 500 },
      );
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Append cache-busting timestamp
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Avatar URL update error:', updateError.message);
      return NextResponse.json(
        { error: 'プロフィールの更新に失敗しました' },
        { status: 500 },
      );
    }

    return NextResponse.json({ avatar_url: avatarUrl });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 },
    );
  }
}
