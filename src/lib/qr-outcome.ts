import { createHash } from 'crypto';
import { supabase } from './supabase';
import type { CaptureOutcome } from '@/types';

const JAILEON_PROBABILITY = 0.6; // 60% chance of Jaileon

function determineOutcome(seed: string, qrLocationId: string, date: string): CaptureOutcome {
  const hash = createHash('sha256')
    .update(`${seed}:${qrLocationId}:${date}`)
    .digest('hex');

  // Use first 8 hex chars as a number (0 to 4294967295)
  const value = parseInt(hash.substring(0, 8), 16);
  const normalized = value / 0xFFFFFFFF;

  return normalized < JAILEON_PROBABILITY ? 'jaileon' : 'bird';
}

export async function getDailyOutcome(
  qrLocationId: string,
  date: string
): Promise<CaptureOutcome> {
  // Check if outcome already exists for today
  const { data: existing } = await supabase
    .from('daily_qr_outcomes')
    .select('outcome')
    .eq('qr_location_id', qrLocationId)
    .eq('date', date)
    .single();

  if (existing) {
    return existing.outcome as CaptureOutcome;
  }

  // Determine and store the outcome
  const seed = process.env.QR_OUTCOME_SEED || 'default-seed';
  const outcome = determineOutcome(seed, qrLocationId, date);

  await supabase.from('daily_qr_outcomes').insert({
    qr_location_id: qrLocationId,
    date,
    outcome,
  });

  return outcome;
}
