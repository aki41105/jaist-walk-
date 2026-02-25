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
