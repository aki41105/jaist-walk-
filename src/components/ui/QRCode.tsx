'use client';

import { useState } from 'react';

interface QRCodeProps {
  data: string;
  size?: number;
}

export function QRCode({ data, size = 200 }: QRCodeProps) {
  const [error, setError] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=8`;

  if (error) {
    // Fallback: display the data as text
    return (
      <div
        className="bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="text-center p-2">
          <p className="font-mono text-lg font-bold text-green-700 break-all">{data}</p>
          <p className="text-xs text-gray-400 mt-2">QR読込不可</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt={`QR Code: ${data}`}
      width={size}
      height={size}
      className="rounded-lg"
      onError={() => setError(true)}
    />
  );
}
