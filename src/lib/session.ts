import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import sql from '@/lib/db';
import type { User } from '@/types';

const SESSION_COOKIE_NAME = 'jw_session';
const SESSION_DURATION_DAYS = 30;

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateUserId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
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

  const [session] = await sql`
    SELECT user_id, expires_at FROM sessions WHERE token = ${token}
  `;

  if (!session) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  if (new Date(session.expires_at as string) < new Date()) {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const [user] = await sql`
    SELECT * FROM users WHERE id = ${session.user_id}
  `;

  if (!user) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return user as unknown as User;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
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
