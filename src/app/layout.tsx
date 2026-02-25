import type { Metadata, Viewport } from 'next';
import { ServiceWorkerProvider } from '@/components/ui/ServiceWorkerProvider';
import { LocaleProvider } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'JAIST Walk',
  description: 'JAISTキャンパスお散歩アプリ - ジャイレオンを捕まえよう！',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-green-50 text-gray-900 antialiased">
        <LocaleProvider>
          <ServiceWorkerProvider>
            {children}
          </ServiceWorkerProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
