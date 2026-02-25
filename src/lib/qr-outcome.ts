import { createHash } from 'crypto';
import { supabase } from './supabase';
import type { CaptureOutcome } from '@/types';

// Outcome thresholds (cumulative):
// 0.00 - 0.05 = rainbow_jaileon (5%)
// 0.05 - 0.15 = blue_jaileon (10%)
// 0.15 - 0.35 = yellow_jaileon (20%)
// 0.35 - 0.65 = jaileon/green (30%)
// 0.65 - 1.00 = bird (35%)

function determineOutcome(seed: string, qrLocationId: string, date: string): CaptureOutcome {
  const hash = createHash('sha256')
    .update(`${seed}:${qrLocationId}:${date}`)
    .digest('hex');

  const value = parseInt(hash.substring(0, 8), 16);
  const normalized = value / 0xFFFFFFFF;

  if (normalized < 0.05) return 'rainbow_jaileon';
  if (normalized < 0.15) return 'blue_jaileon';
  if (normalized < 0.35) return 'yellow_jaileon';
  if (normalized < 0.65) return 'jaileon';
  return 'bird';
}

export async function getDailyOutcome(
  qrLocationId: string,
  date: string
): Promise<CaptureOutcome> {
  const { data: existing } = await supabase
    .from('daily_qr_outcomes')
    .select('outcome')
    .eq('qr_location_id', qrLocationId)
    .eq('date', date)
    .single();

  if (existing) {
    return existing.outcome as CaptureOutcome;
  }

  const seed = process.env.QR_OUTCOME_SEED || 'default-seed';
  const outcome = determineOutcome(seed, qrLocationId, date);

  await supabase.from('daily_qr_outcomes').insert({
    qr_location_id: qrLocationId,
    date,
    outcome,
  });

  return outcome;
}
