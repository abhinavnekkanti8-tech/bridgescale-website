import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'BridgeScale — Fractional Diaspora Senior Talent for India\'s Startups & MSMEs',
  description:
    'BridgeScale matches Indian startups and MSMEs with vetted diaspora sales leaders, pipeline builders, and BD operators — for fractional, scoped engagements that produce real commercial outcomes in international markets.',
  keywords: [
    'BridgeScale', 'Indian diaspora', 'fractional sales', 'sales leadership',
    'business development', 'Indian startups', 'MSMEs', 'international growth',
    'fractional talent', 'cross-border sales', 'senior talent',
  ],
  openGraph: {
    title: 'BridgeScale — Fractional Diaspora Senior Talent',
    description: 'Vetted diaspora senior talent for India\'s startups & MSMEs. Fractional, scoped, platform-managed.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BridgeScale — Fractional Diaspora Senior Talent',
    description: 'Connecting Indian startups with vetted diaspora senior talent for international growth.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
