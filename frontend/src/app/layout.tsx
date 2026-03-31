import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BridgeSales — Fractional Diaspora Commercial Talent for India\'s Startups & MSMEs',
  description:
    'BridgeSales connects Indian startups and MSMEs with vetted diaspora sales leaders, executors, and BD operators — for fractional, scoped, compensated international growth engagements.',
  keywords: [
    'BridgeSales', 'Indian diaspora', 'fractional sales', 'sales leadership',
    'business development', 'Indian startups', 'MSMEs', 'international growth',
    'fractional talent', 'cross-border sales',
  ],
  openGraph: {
    title: 'BridgeSales — Fractional Diaspora Commercial Talent',
    description: 'Vetted diaspora sales leaders for India\'s startups & MSMEs. Fractional, scoped, compensated.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BridgeSales — Fractional Diaspora Talent',
    description: 'Connecting Indian startups with vetted diaspora sales leaders for international growth.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bridgesales-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
