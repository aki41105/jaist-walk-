// Master character definition - single source of truth for all character data
// All files should import from here to avoid scattered definitions

export type Rarity = 'common' | 'uncommon' | 'rare' | 'super_rare' | 'morning' | 'bird';

export interface CharacterDef {
  id: string;
  image: string;         // path relative to /jaist-walk/images/
  nameJa: string;
  nameEn: string;
  rarity: Rarity;
  points: number;
  catchRate: number;
  spawnRate: number;      // percentage for normal pool (0 for morning/bird special)
  color: string;          // tailwind text color class
  bgGradient: string;     // tailwind bg gradient class
  btnColor: string;       // tailwind button color class
  bgCard: string;         // tailwind bg card class for info page
}

// All 20 Jaileon characters + bird (bird is a meta-entry, actual birds are tori01-10)
export const CHARACTERS: Record<string, CharacterDef> = {
  // === Common (30% total) ===
  jai01_front: {
    id: 'jai01_front',
    image: 'jai01-front.png',
    nameJa: 'ジャイレオン',
    nameEn: 'Jaileon',
    rarity: 'common',
    points: 100,
    catchRate: 0.55,
    spawnRate: 8,
    color: 'text-green-700',
    bgGradient: 'bg-gradient-to-b from-green-100 to-green-50',
    btnColor: 'bg-green-600 hover:bg-green-700',
    bgCard: 'bg-green-50',
  },
  jai02_greeting: {
    id: 'jai02_greeting',
    image: 'jai02-greeting.png',
    nameJa: 'おじぎジャイレオン',
    nameEn: 'Bowing Jaileon',
    rarity: 'common',
    points: 100,
    catchRate: 0.55,
    spawnRate: 6,
    color: 'text-green-700',
    bgGradient: 'bg-gradient-to-b from-green-100 to-green-50',
    btnColor: 'bg-green-600 hover:bg-green-700',
    bgCard: 'bg-green-50',
  },
  jai11_basic: {
    id: 'jai11_basic',
    image: 'jai11-basic.png',
    nameJa: 'きほんジャイレオン',
    nameEn: 'Basic Jaileon',
    rarity: 'common',
    points: 100,
    catchRate: 0.55,
    spawnRate: 6,
    color: 'text-green-700',
    bgGradient: 'bg-gradient-to-b from-green-100 to-green-50',
    btnColor: 'bg-green-600 hover:bg-green-700',
    bgCard: 'bg-green-50',
  },
  jai13_call: {
    id: 'jai13_call',
    image: 'jai13-call.png',
    nameJa: 'よびかけジャイレオン',
    nameEn: 'Calling Jaileon',
    rarity: 'common',
    points: 100,
    catchRate: 0.55,
    spawnRate: 5,
    color: 'text-green-700',
    bgGradient: 'bg-gradient-to-b from-green-100 to-green-50',
    btnColor: 'bg-green-600 hover:bg-green-700',
    bgCard: 'bg-green-50',
  },
  jai14_megaphone: {
    id: 'jai14_megaphone',
    image: 'jai14-megaphone.png',
    nameJa: 'メガホンジャイレオン',
    nameEn: 'Megaphone Jaileon',
    rarity: 'common',
    points: 100,
    catchRate: 0.55,
    spawnRate: 5,
    color: 'text-green-700',
    bgGradient: 'bg-gradient-to-b from-green-100 to-green-50',
    btnColor: 'bg-green-600 hover:bg-green-700',
    bgCard: 'bg-green-50',
  },

  // === Uncommon (20% total) ===
  jai04_smile: {
    id: 'jai04_smile',
    image: 'jai04-smile.png',
    nameJa: 'えがおジャイレオン',
    nameEn: 'Smiling Jaileon',
    rarity: 'uncommon',
    points: 150,
    catchRate: 0.45,
    spawnRate: 4,
    color: 'text-yellow-700',
    bgGradient: 'bg-gradient-to-b from-yellow-100 to-yellow-50',
    btnColor: 'bg-yellow-500 hover:bg-yellow-600',
    bgCard: 'bg-yellow-50',
  },
  jai06_mask: {
    id: 'jai06_mask',
    image: 'jai06-mask.png',
    nameJa: 'マスクジャイレオン',
    nameEn: 'Mask Jaileon',
    rarity: 'uncommon',
    points: 150,
    catchRate: 0.45,
    spawnRate: 3,
    color: 'text-yellow-700',
    bgGradient: 'bg-gradient-to-b from-yellow-100 to-yellow-50',
    btnColor: 'bg-yellow-500 hover:bg-yellow-600',
    bgCard: 'bg-yellow-50',
  },
  jai07_disinfection: {
    id: 'jai07_disinfection',
    image: 'jai07-disinfection.png',
    nameJa: '消毒ジャイレオン',
    nameEn: 'Sanitizer Jaileon',
    rarity: 'uncommon',
    points: 150,
    catchRate: 0.45,
    spawnRate: 3,
    color: 'text-yellow-700',
    bgGradient: 'bg-gradient-to-b from-yellow-100 to-yellow-50',
    btnColor: 'bg-yellow-500 hover:bg-yellow-600',
    bgCard: 'bg-yellow-50',
  },
  jai09_ventilation: {
    id: 'jai09_ventilation',
    image: 'jai09-ventilation.png',
    nameJa: '換気ジャイレオン',
    nameEn: 'Ventilation Jaileon',
    rarity: 'uncommon',
    points: 150,
    catchRate: 0.45,
    spawnRate: 3,
    color: 'text-yellow-700',
    bgGradient: 'bg-gradient-to-b from-yellow-100 to-yellow-50',
    btnColor: 'bg-yellow-500 hover:bg-yellow-600',
    bgCard: 'bg-yellow-50',
  },
  jai16_pointer: {
    id: 'jai16_pointer',
    image: 'jai16-pointer.png',
    nameJa: 'さしぼうジャイレオン',
    nameEn: 'Pointer Jaileon',
    rarity: 'uncommon',
    points: 150,
    catchRate: 0.45,
    spawnRate: 3,
    color: 'text-yellow-700',
    bgGradient: 'bg-gradient-to-b from-yellow-100 to-yellow-50',
    btnColor: 'bg-yellow-500 hover:bg-yellow-600',
    bgCard: 'bg-yellow-50',
  },
  jai23_walk: {
    id: 'jai23_walk',
    image: 'jai23-walk.png',
    nameJa: 'おさんぽジャイレオン',
    nameEn: 'Walking Jaileon',
    rarity: 'uncommon',
    points: 150,
    catchRate: 0.45,
    spawnRate: 4,
    color: 'text-yellow-700',
    bgGradient: 'bg-gradient-to-b from-yellow-100 to-yellow-50',
    btnColor: 'bg-yellow-500 hover:bg-yellow-600',
    bgCard: 'bg-yellow-50',
  },

  // === Rare (15% total) ===
  jai05_crying: {
    id: 'jai05_crying',
    image: 'jai05-crying.png',
    nameJa: 'なきむしジャイレオン',
    nameEn: 'Crying Jaileon',
    rarity: 'rare',
    points: 250,
    catchRate: 0.35,
    spawnRate: 3,
    color: 'text-blue-700',
    bgGradient: 'bg-gradient-to-b from-blue-100 to-blue-50',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    bgCard: 'bg-blue-50',
  },
  jai15_experiment: {
    id: 'jai15_experiment',
    image: 'jai15-experiment.png',
    nameJa: 'はかせジャイレオン',
    nameEn: 'Scientist Jaileon',
    rarity: 'rare',
    points: 250,
    catchRate: 0.35,
    spawnRate: 3,
    color: 'text-blue-700',
    bgGradient: 'bg-gradient-to-b from-blue-100 to-blue-50',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    bgCard: 'bg-blue-50',
  },
  jai17_pc: {
    id: 'jai17_pc',
    image: 'jai17-pc.png',
    nameJa: 'PCジャイレオン',
    nameEn: 'PC Jaileon',
    rarity: 'rare',
    points: 250,
    catchRate: 0.35,
    spawnRate: 3,
    color: 'text-blue-700',
    bgGradient: 'bg-gradient-to-b from-blue-100 to-blue-50',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    bgCard: 'bg-blue-50',
  },
  jai22_reading: {
    id: 'jai22_reading',
    image: 'jai22-reading.png',
    nameJa: 'どくしょジャイレオン',
    nameEn: 'Reading Jaileon',
    rarity: 'rare',
    points: 250,
    catchRate: 0.35,
    spawnRate: 3,
    color: 'text-blue-700',
    bgGradient: 'bg-gradient-to-b from-blue-100 to-blue-50',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    bgCard: 'bg-blue-50',
  },
  jai18_think: {
    id: 'jai18_think',
    image: 'jai18-think.png',
    nameJa: 'かんがえるジャイレオン',
    nameEn: 'Thinking Jaileon',
    rarity: 'rare',
    points: 250,
    catchRate: 0.35,
    spawnRate: 3,
    color: 'text-blue-700',
    bgGradient: 'bg-gradient-to-b from-blue-100 to-blue-50',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    bgCard: 'bg-blue-50',
  },

  // === Super Rare (5% total) ===
  jai10_back: {
    id: 'jai10_back',
    image: 'jai10-back.png',
    nameJa: 'うしろすがたジャイレオン',
    nameEn: 'Backside Jaileon',
    rarity: 'super_rare',
    points: 500,
    catchRate: 0.25,
    spawnRate: 1.5,
    color: 'text-purple-700',
    bgGradient: 'bg-gradient-to-b from-purple-100 via-pink-50 to-purple-50',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    bgCard: 'bg-purple-50',
  },
  jai19_wall: {
    id: 'jai19_wall',
    image: 'jai19-wall.png',
    nameJa: 'かべジャイレオン',
    nameEn: 'Wall Jaileon',
    rarity: 'super_rare',
    points: 500,
    catchRate: 0.25,
    spawnRate: 1.5,
    color: 'text-purple-700',
    bgGradient: 'bg-gradient-to-b from-purple-100 via-pink-50 to-purple-50',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    bgCard: 'bg-purple-50',
  },
  jai20_globe: {
    id: 'jai20_globe',
    image: 'jai20-globe.png',
    nameJa: 'ちきゅうぎジャイレオン',
    nameEn: 'Globe Jaileon',
    rarity: 'super_rare',
    points: 500,
    catchRate: 0.25,
    spawnRate: 1,
    color: 'text-purple-700',
    bgGradient: 'bg-gradient-to-b from-purple-100 via-pink-50 to-purple-50',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    bgCard: 'bg-purple-50',
  },
  jai21_rest: {
    id: 'jai21_rest',
    image: 'jai21-rest.png',
    nameJa: 'おひるねジャイレオン',
    nameEn: 'Napping Jaileon',
    rarity: 'super_rare',
    points: 500,
    catchRate: 0.25,
    spawnRate: 1,
    color: 'text-purple-700',
    bgGradient: 'bg-gradient-to-b from-purple-100 via-pink-50 to-purple-50',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    bgCard: 'bg-purple-50',
  },

  // === Morning special ===
  morning_jai23: {
    id: 'morning_jai23',
    image: 'jai23-walk.png',
    nameJa: 'おさんぽジャイレオン',
    nameEn: 'Walking Jaileon',
    rarity: 'morning',
    points: 300,
    catchRate: 1.0,
    spawnRate: 0,
    color: 'text-amber-700',
    bgGradient: 'bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-50',
    btnColor: 'bg-amber-500 hover:bg-amber-600',
    bgCard: 'bg-amber-50',
  },

  // === Bird (meta-entry) ===
  bird: {
    id: 'bird',
    image: 'tori01.png',
    nameJa: '小鳥',
    nameEn: 'Little Bird',
    rarity: 'bird',
    points: 10,
    catchRate: 1.0,
    spawnRate: 30,
    color: 'text-orange-600',
    bgGradient: 'bg-gradient-to-b from-orange-100 to-orange-50',
    btnColor: 'bg-orange-500 hover:bg-orange-600',
    bgCard: 'bg-orange-50',
  },
};

// CaptureOutcome type values - these are stored in the DB
export const ALL_JAILEON_OUTCOMES = [
  'jai01_front', 'jai02_greeting', 'jai11_basic', 'jai13_call', 'jai14_megaphone',
  'jai04_smile', 'jai06_mask', 'jai07_disinfection', 'jai09_ventilation', 'jai16_pointer', 'jai23_walk',
  'jai05_crying', 'jai15_experiment', 'jai17_pc', 'jai22_reading', 'jai18_think',
  'jai10_back', 'jai19_wall', 'jai20_globe', 'jai21_rest',
] as const;

export const ALL_OUTCOMES = [
  ...ALL_JAILEON_OUTCOMES,
  'morning_jai23',
  'bird',
] as const;

// Rarity display config
export const RARITY_CONFIG: Record<Rarity, { labelJa: string; labelEn: string; color: string; bgColor: string }> = {
  common:     { labelJa: 'コモン',     labelEn: 'Common',     color: 'text-green-700',  bgColor: 'bg-green-100' },
  uncommon:   { labelJa: 'アンコモン', labelEn: 'Uncommon',   color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  rare:       { labelJa: 'レア',       labelEn: 'Rare',       color: 'text-blue-700',   bgColor: 'bg-blue-100' },
  super_rare: { labelJa: 'スーパーレア', labelEn: 'Super Rare', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  morning:    { labelJa: '朝限定',     labelEn: 'Morning',    color: 'text-amber-700',  bgColor: 'bg-amber-100' },
  bird:       { labelJa: '小鳥',       labelEn: 'Bird',       color: 'text-orange-600', bgColor: 'bg-orange-100' },
};

// Avatar types available for profile selection
export const AVATAR_KEYS = [
  'jai01_front', 'jai02_greeting', 'jai04_smile', 'jai05_crying',
  'jai06_mask', 'jai07_disinfection', 'jai09_ventilation', 'jai10_back',
  'jai11_basic', 'jai13_call', 'jai14_megaphone', 'jai15_experiment',
  'jai16_pointer', 'jai17_pc', 'jai18_think', 'jai19_wall',
  'jai20_globe', 'jai21_rest', 'jai22_reading', 'jai23_walk', 'bird',
] as const;

// Helper: get image path for a CaptureOutcome
export function getOutcomeImagePath(outcome: string): string {
  if (outcome === 'bird') {
    // Random bird from tori01-10
    const birdNum = String(Math.floor(Math.random() * 10) + 1).padStart(2, '0');
    return `/jaist-walk/images/tori${birdNum}.png`;
  }
  const char = CHARACTERS[outcome];
  if (char) return `/jaist-walk/images/${char.image}`;
  return '/jaist-walk/images/jai01-front.png';
}

// Helper: get image path for an avatar type
export function getAvatarImagePath(avatar: string): string {
  if (avatar === 'bird') return '/jaist-walk/images/tori01.png';
  const char = CHARACTERS[avatar];
  if (char) return `/jaist-walk/images/${char.image}`;
  // Fallback for old avatar values
  if (avatar === 'green') return '/jaist-walk/images/jai01-front.png';
  if (avatar === 'yellow') return '/jaist-walk/images/jai04-smile.png';
  if (avatar === 'blue') return '/jaist-walk/images/jai05-crying.png';
  if (avatar === 'rainbow') return '/jaist-walk/images/jaileon-logo.png';
  return '/jaist-walk/images/jai01-front.png';
}

// Helper: get a deterministic bird image from a scan or seed
export function getBirdImagePath(seed?: string): string {
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    const idx = (Math.abs(hash) % 10) + 1;
    return `/jaist-walk/images/tori${String(idx).padStart(2, '0')}.png`;
  }
  const num = Math.floor(Math.random() * 10) + 1;
  return `/jaist-walk/images/tori${String(num).padStart(2, '0')}.png`;
}

// Characters grouped by rarity for display
export function getCharactersByRarity(): Record<Rarity, CharacterDef[]> {
  const result: Record<Rarity, CharacterDef[]> = {
    common: [], uncommon: [], rare: [], super_rare: [], morning: [], bird: [],
  };
  for (const char of Object.values(CHARACTERS)) {
    result[char.rarity].push(char);
  }
  return result;
}
