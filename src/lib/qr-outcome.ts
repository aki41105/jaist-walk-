import { createHash } from 'crypto';
import sql from './db';
import type { CaptureOutcome } from '@/types';

// Cumulative thresholds for outcome determination
// Bird: 30%, Common: 30%, Uncommon: 20%, Rare: 15%, Super Rare: 5%
const OUTCOME_THRESHOLDS: { threshold: number; outcome: CaptureOutcome }[] = [
  // Bird (30%)
  { threshold: 0.30, outcome: 'bird' },
  // Common (30%): jai01(8%), jai02(6%), jai11(6%), jai13(5%), jai14(5%)
  { threshold: 0.38, outcome: 'jai01_front' },
  { threshold: 0.44, outcome: 'jai02_greeting' },
  { threshold: 0.50, outcome: 'jai11_basic' },
  { threshold: 0.55, outcome: 'jai13_call' },
  { threshold: 0.60, outcome: 'jai14_megaphone' },
  // Uncommon (20%): jai04(4%), jai06(3%), jai07(3%), jai09(3%), jai16(3%), jai23(4%)
  { threshold: 0.64, outcome: 'jai04_smile' },
  { threshold: 0.67, outcome: 'jai06_mask' },
  { threshold: 0.70, outcome: 'jai07_disinfection' },
  { threshold: 0.73, outcome: 'jai09_ventilation' },
  { threshold: 0.76, outcome: 'jai16_pointer' },
  { threshold: 0.80, outcome: 'jai23_walk' },
  // Rare (15%): jai05(3%), jai15(3%), jai17(3%), jai22(3%), jai18(3%)
  { threshold: 0.83, outcome: 'jai05_crying' },
  { threshold: 0.86, outcome: 'jai15_experiment' },
  { threshold: 0.89, outcome: 'jai17_pc' },
  { threshold: 0.92, outcome: 'jai22_reading' },
  { threshold: 0.95, outcome: 'jai18_think' },
  // Super Rare (5%): jai10(1.5%), jai19(1.5%), jai20(1%), jai21(1%)
  { threshold: 0.965, outcome: 'jai10_back' },
  { threshold: 0.98, outcome: 'jai19_wall' },
  { threshold: 0.99, outcome: 'jai20_globe' },
  { threshold: 1.00, outcome: 'jai21_rest' },
];

function determineOutcome(seed: string, qrLocationId: string, date: string): CaptureOutcome {
  const hash = createHash('sha256')
    .update(`${seed}:${qrLocationId}:${date}`)
    .digest('hex');

  const value = parseInt(hash.substring(0, 8), 16);
  const normalized = value / 0xFFFFFFFF;

  for (const { threshold, outcome } of OUTCOME_THRESHOLDS) {
    if (normalized < threshold) return outcome;
  }
  return 'jai21_rest';
}

export async function getDailyOutcome(
  qrLocationId: string,
  date: string
): Promise<CaptureOutcome> {
  const [existing] = await sql`
    SELECT outcome FROM daily_qr_outcomes
    WHERE qr_location_id = ${qrLocationId} AND date = ${date}
    LIMIT 1
  `;

  if (existing) {
    return existing.outcome as CaptureOutcome;
  }

  const seed = process.env.QR_OUTCOME_SEED || 'default-seed';
  const outcome = determineOutcome(seed, qrLocationId, date);

  await sql`
    INSERT INTO daily_qr_outcomes (qr_location_id, date, outcome)
    VALUES (${qrLocationId}, ${date}, ${outcome})
  `;

  return outcome;
}
