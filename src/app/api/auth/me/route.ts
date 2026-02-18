import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch recent scans with location names
    const { data: recentScans } = await supabase
      .from('scans')
      .select(`
        *,
        qr_locations (name_ja, name_en)
      `)
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: false })
      .limit(20);

    // Fetch recent point transactions
    const { data: recentTransactions } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      affiliation: user.affiliation,
      research_area: user.research_area,
      role: user.role,
      points: user.points,
      capture_count: user.capture_count,
      recent_scans: (recentScans || []).map((scan: Record<string, unknown>) => ({
        ...scan,
        location_name: (scan.qr_locations as Record<string, string>)?.name_ja || '',
      })),
      recent_transactions: recentTransactions || [],
    };

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
