import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内にしてください')
    .trim()
    .regex(/^[^\s<>"';&|\\]+$/, '使用できない文字が含まれています'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  affiliation: z.enum(['student', 'faculty', 'staff', 'other']),
  research_area: z.enum(['cs', 'is', 'ms', 'other']),
});

export const loginSchema = z.object({
  name: z.string().min(1, 'アカウント名を入力してください'),
});

export const recoverSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
});

export const captureSchema = z.object({
  qr_code: z.string().uuid('無効なQRコードです'),
});

export const pointOperationSchema = z.object({
  user_id: z.string().regex(/^JW-[A-HJ-NP-Z2-9]{6}$/, '無効なユーザーIDです'),
  amount: z.number().int('整数を入力してください').refine(val => val !== 0, 'ポイントは0以外にしてください'),
  reason: z.string().min(1, '理由を入力してください').max(200),
});

// Admin: user list query params
export const adminUserListSchema = z.object({
  search: z.string().max(100).optional(),
  affiliation: z.enum(['student', 'faculty', 'staff', 'other']).optional(),
  research_area: z.enum(['cs', 'is', 'ms', 'other']).optional(),
  sort: z.enum(['created_at', 'points', 'capture_count']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Admin: create location
export const createLocationSchema = z.object({
  name_ja: z.string().min(1, '日本語名を入力してください').max(100),
  name_en: z.string().min(1, '英語名を入力してください').max(100),
  location_number: z.number().int().min(1, 'ロケーション番号は1以上にしてください'),
});

// Admin: update location
export const updateLocationSchema = z.object({
  id: z.string().uuid('無効なロケーションIDです'),
  is_active: z.boolean().optional(),
  name_ja: z.string().min(1).max(100).optional(),
  name_en: z.string().min(1).max(100).optional(),
});

// Admin: scan stats query
export const scanStatsSchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(7),
});
