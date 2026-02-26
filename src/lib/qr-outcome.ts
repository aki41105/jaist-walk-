import { createHash } from 'crypto';
import sql from '@/lib/db';
import type { CaptureOutcome } from '@/types';

function determineOutcome(seed: string, qrLocationId: string, date: string): CaptureOutcome {
  const hash = createHash('sha256')
    .update(`${seed}:${qrLocationId}:${date}`)
    .digest('hex');

  const value = parseInt(hash.substring(0, 8), 16);
  const normalized = value / 0xFFFFFFFF;

  if (normalized < 0.05) return 'rainbow_jaileon';
  if (normalized < 0.15) return 'blue_jaileon';
  if (normalized < 0.35) return 'yellow_jaileon';
  if (normalized < 0.80) return 'jaileon';
  return 'bird';
}

export async function getDailyOutcome(
  qrLocationId: string,
  date: string
): Promise<CaptureOutcome> {
  const [existing] = await sql`
    SELECT outcome FROM daily_qr_outcomes
    WHERE qr_location_id = ${qrLocationId} AND date = ${date}
  `;

  if (existing) {
    return existing.outcome as CaptureOutcome;
  }

  const seed = process.env.QR_OUTCOME_SEED || 'default-seed';
  const outcome = determineOutcome(seed, qrLocationId, date);

  await sql`
    INSERT INTO daily_qr_outcomes (qr_location_id, date, outcome)
    VALUES (${qrLocationId}, ${date}, ${outcome})
    ON CONFLICT (qr_location_id, date) DO NOTHING
  `;

  return outcome;
}
