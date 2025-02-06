import './globals.css';
import { Heebo } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/lib/auth';

const heebo = Heebo({ subsets: ['hebrew', 'latin'] });

export const metadata = {
  title: 'Tsalamim',
  description: 'connects photographers and their clients',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
