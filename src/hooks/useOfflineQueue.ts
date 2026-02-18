'use client';

import { useEffect, useCallback } from 'react';

interface QueuedCapture {
  qr_code: string;
  timestamp: number;
}

const QUEUE_KEY = 'jw_offline_queue';

export function useOfflineQueue() {
  const addToQueue = useCallback((qrCode: string) => {
    const queue = getQueue();
    queue.push({ qr_code: qrCode, timestamp: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, []);

  const processQueue = useCallback(async () => {
    const queue = getQueue();
    if (queue.length === 0) return;

    const remaining: QueuedCapture[] = [];

    for (const item of queue) {
      try {
        const res = await fetch('/api/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qr_code: item.qr_code }),
        });

        if (!res.ok) {
          const data = await res.json();
          // Don't retry if already scanned or invalid
          if (data.code === 'ALREADY_SCANNED' || data.code === 'INVALID_QR') {
            continue;
          }
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  }, []);

  // Process queue when online
  useEffect(() => {
    const handler = () => processQueue();
    window.addEventListener('online', handler);

    // Also try processing on mount
    if (navigator.onLine) {
      processQueue();
    }

    return () => window.removeEventListener('online', handler);
  }, [processQueue]);

  return { addToQueue, processQueue, getQueueLength: () => getQueue().length };
}

function getQueue(): QueuedCapture[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}
