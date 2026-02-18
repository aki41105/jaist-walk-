/**
 * QR Location Generator for JAIST Walk
 *
 * Usage: npx tsx scripts/generate-qr-locations.ts
 *
 * Generates SQL insert statements for QR locations and prints
 * the URLs that each QR code should link to.
 */

import { randomUUID } from 'crypto';

// Define campus locations
const LOCATIONS = [
  { number: 1, name_ja: '正門', name_en: 'Main Gate' },
  { number: 2, name_ja: '情報科学系研究棟 (I棟)', name_en: 'IS Building (Building I)' },
  { number: 3, name_ja: '知識科学系研究棟 (K棟)', name_en: 'KS Building (Building K)' },
  { number: 4, name_ja: 'マテリアルサイエンス系研究棟 (M棟)', name_en: 'MS Building (Building M)' },
  { number: 5, name_ja: '大学会館', name_en: 'University Hall' },
  { number: 6, name_ja: '図書館', name_en: 'Library' },
  { number: 7, name_ja: '食堂', name_en: 'Cafeteria' },
  { number: 8, name_ja: '体育館', name_en: 'Gymnasium' },
  { number: 9, name_ja: 'コラボレーションルーム', name_en: 'Collaboration Room' },
  { number: 10, name_ja: '事務局棟', name_en: 'Administration Building' },
  { number: 11, name_ja: '講義棟', name_en: 'Lecture Building' },
  { number: 12, name_ja: '保健管理センター', name_en: 'Health Center' },
  { number: 13, name_ja: '学生寮 (愛宕)', name_en: 'Dormitory (Atago)' },
  { number: 14, name_ja: '学生寮 (鶴来)', name_en: 'Dormitory (Tsurugi)' },
  { number: 15, name_ja: 'バス停', name_en: 'Bus Stop' },
];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jaist-walk.vercel.app';

console.log('-- JAIST Walk QR Location SQL Insert Statements');
console.log('-- Generated at:', new Date().toISOString());
console.log('');
console.log('INSERT INTO qr_locations (id, code, name_ja, name_en, location_number, is_active) VALUES');

const values: string[] = [];
const qrUrls: { number: number; name: string; url: string; code: string }[] = [];

for (const loc of LOCATIONS) {
  const id = randomUUID();
  const code = randomUUID();
  values.push(
    `  ('${id}', '${code}', '${loc.name_ja}', '${loc.name_en}', ${loc.number}, true)`
  );
  qrUrls.push({
    number: loc.number,
    name: loc.name_ja,
    url: `${APP_URL}/capture?qr=${code}`,
    code,
  });
}

console.log(values.join(',\n') + ';');
console.log('');
console.log('-- QR Code URLs (use these to generate QR code images):');
console.log('');

for (const qr of qrUrls) {
  console.log(`-- #${qr.number} ${qr.name}`);
  console.log(`--   URL: ${qr.url}`);
  console.log(`--   Code: ${qr.code}`);
  console.log('');
}

console.log('-- Total locations:', LOCATIONS.length);
console.log('-- To generate QR code images, use any QR code generator with the URLs above.');
console.log('-- Recommended: https://www.qrcode-monkey.com/ or `npx qrcode` CLI tool');
