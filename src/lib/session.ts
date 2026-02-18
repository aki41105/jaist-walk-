import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { supabase } from './supabase';
import type { User } from '@/types';

const SESSION_COOKIE_NAME = 'jw_session';
const SESSION_DURATION_DAYS = 30;

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateUserId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let code = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `JW-${code}`;
}

export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await supabase.from('sessions').insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (!session) {
    // Session not found in DB (e.g. after data reset) - clear stale cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  // Check expiration
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from('sessions').delete().eq('token', token);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user_id)
    .single();

  if (!user) {
    // User deleted but session remains - clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return user as User | null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await supabase.from('sessions').delete().eq('token', token);
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}
