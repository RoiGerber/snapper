import './globals.css'
import { Heebo } from 'next/font/google'
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/lib/auth';

const heebo = Heebo({ subsets: ['hebrew', 'latin'] })

export const metadata = {
  title: 'Tsalamim',
  description: 'connects photographers and their clients',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  
  return (
    <html lang="he" dir="rtl">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
