import './globals.css';

export const metadata = {
  title: 'Dear Journey',
  description: 'A little book for every journey.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Dear Journey', statusBarStyle: 'default' },
};
export const viewport = { themeColor: '#F5F2E8', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

const FONTS =
  'https://fonts.googleapis.com/css2?family=Prata' +
  '&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
