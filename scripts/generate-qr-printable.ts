/**
 * QR Code Printable HTML Generator for JAIST Walk
 *
 * Usage: npx tsx scripts/generate-qr-printable.ts
 *
 * Fetches QR locations from PostgreSQL and generates a printable A4 HTML file
 * with QR codes for all campus locations.
 *
 * Requires .env.local with:
 *   DATABASE_URL
 *   NEXT_PUBLIC_APP_URL (optional, defaults to https://jaist-walk.vercel.app)
 */

import postgres from 'postgres';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  console.warn('[warn] .env.local not found, using environment variables');
}

const databaseUrl = process.env.DATABASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jaist-walk.vercel.app';

if (!databaseUrl) {
  console.error('Error: DATABASE_URL must be set.');
  console.error('Set it in .env.local or as an environment variable.');
  process.exit(1);
}

const sql = postgres(databaseUrl);

interface QrLocation {
  id: string;
  code: string;
  name_ja: string;
  name_en: string;
  location_number: number;
  is_active: boolean;
}

function generateQrImageUrl(data: string, size: number = 300): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=4`;
}

function generateHtml(locations: QrLocation[]): string {
  const sorted = [...locations].sort((a, b) => a.location_number - b.location_number);

  // Group into pages of 2
  const pages: QrLocation[][] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    pages.push(sorted.slice(i, i + 2));
  }

  const locationCards = pages
    .map(
      (page, pageIndex) => `
    <div class="page${pageIndex > 0 ? ' page-break' : ''}">
      ${page
        .map((loc) => {
          const captureUrl = `${APP_URL}/capture?qr=${loc.code}`;
          const qrImgUrl = generateQrImageUrl(captureUrl, 400);
          return `
      <div class="card">
        <div class="card-header">
          <span class="location-number">#${loc.location_number}</span>
          <div class="location-names">
            <div class="name-ja">${loc.name_ja}</div>
            <div class="name-en">${loc.name_en}</div>
          </div>
        </div>
        <div class="qr-container">
          <img src="${qrImgUrl}" alt="QR Code for ${loc.name_en}" class="qr-image" />
        </div>
        <div class="card-footer">
          <div class="app-name">JAIST Walk</div>
          <div class="instruction">スマホのカメラでスキャン / Scan with your phone camera</div>
        </div>
      </div>`;
        })
        .join('\n')}
    </div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JAIST Walk - QR Codes</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
      background: #f5f5f5;
      color: #333;
    }

    @media print {
      body {
        background: white;
      }
      .no-print {
        display: none !important;
      }
    }

    .no-print {
      background: #16a34a;
      color: white;
      padding: 16px 24px;
      text-align: center;
      font-size: 16px;
    }

    .no-print button {
      background: white;
      color: #16a34a;
      border: none;
      padding: 8px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-left: 16px;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 15mm 15mm;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: center;
      gap: 10mm;
    }

    .page-break {
      page-break-before: always;
    }

    @media screen {
      .page {
        margin: 20px auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
    }

    .card {
      width: 100%;
      border: 3px solid #16a34a;
      border-radius: 16px;
      padding: 12mm 10mm;
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8mm;
    }

    .location-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #16a34a;
      color: white;
      border-radius: 50%;
      font-size: 20px;
      font-weight: bold;
      flex-shrink: 0;
    }

    .location-names {
      text-align: left;
    }

    .name-ja {
      font-size: 22px;
      font-weight: bold;
      color: #333;
    }

    .name-en {
      font-size: 14px;
      color: #666;
      margin-top: 2px;
    }

    .qr-container {
      margin: 4mm 0;
    }

    .qr-image {
      width: 50mm;
      height: 50mm;
    }

    .card-footer {
      margin-top: 6mm;
    }

    .app-name {
      font-size: 18px;
      font-weight: bold;
      color: #16a34a;
    }

    .instruction {
      font-size: 11px;
      color: #888;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="no-print">
    JAIST Walk QR Codes - ${sorted.length} locations
    <button onclick="window.print()">印刷 / Print</button>
  </div>
${locationCards}
</body>
</html>`;
}

async function main() {
  console.log('Fetching QR locations from database...');

  const locations = await sql`
    SELECT * FROM qr_locations
    WHERE is_active = true
    ORDER BY location_number ASC
  `;

  if (locations.length === 0) {
    console.error('No QR locations found in database.');
    process.exit(1);
  }

  console.log(`Found ${locations.length} locations:`);
  for (const loc of locations) {
    console.log(`  #${loc.location_number} ${loc.name_ja} (${loc.name_en})`);
  }

  const html = generateHtml(locations as unknown as QrLocation[]);
  const outputPath = resolve(__dirname, '..', 'qr-codes.html');
  writeFileSync(outputPath, html, 'utf-8');

  console.log('');
  console.log(`QR codes HTML generated: ${outputPath}`);
  console.log('Open in a browser and press Ctrl+P to print.');

  await sql.end();
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
