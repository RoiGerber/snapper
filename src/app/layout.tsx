import './globals.css';
import { Heebo } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/lib/auth';
import Script from 'next/script';

const heebo = Heebo({ subsets: ['hebrew', 'latin'] });

export const metadata = {
  title: 'Tsalamim - פלטפורמת הצלמים והלקוחות',
  description: 'הדרך הקלה ביותר למצוא צלם מקצועי לכל אירוע – אירוסין, ספורט, ימי הולדת ועוד.',
  keywords: [
    'צילום אירועים', 'צלם מקצועי', 'צלם פרילנסר', 'צלם חתונות', 'צלם אירוסין', 'בוק צילומים',
    'צלמים לאירועים', 'צלמים מקצועיים', 'צלמים לפרויקטים', 'צלמים לחתונה', 'צלמים לאירוסין',
    'צלמים למסיבות', 'צלמים לבר מצווה', 'צלמים לבת מצווה', 'צלמים להפקות אופנה', 'צלמים לכנסים',
    'צלמים לפרסום', 'צלמים למסעדות', 'צלמים לנדל״ן', 'צלמים לעסקים', 'צלמים לקטלוגים',
    'צלמים לאירועי ספורט', 'צלמים לאירועים קטנים', 'צלמים לצילומי חוץ', 'צלמים לסטודיו',
    'צלמים לאירועים משפחתיים', 'צלמים לצילומי פורטרטים', 'צלמים לשירותי צילום', 'צלמים לטבע',
    'צלמים לצילומי וידאו', 'צלמים לעריכת תמונות', 'צלמים לצילום הופעות', 'צלמים לצילום קליפים',
    'צלמים למגנטים', 'צלמים לאירועים ביתיים', 'צלמים מקצועיים לשירותכם', 'צלמים ליום הולדת',
    'צלמים לשירותי צילום תדמית', 'צלמים לצילום מוצרים', 'צלמים לצילום אוכל', 'צלמים לפרויקטים עסקיים',
    'צלמים לצילום משפחות', 'צלמים לאירועים עסקיים', 'צלמים מקצועיים לצילום אישי', 'צלמים לפרסום ושיווק',
    'צלמים מקצועיים לפרויקטים אומנותיים', 'צלמים לסטיילינג', 'צלמים מקצועיים לשירותים פרטיים',
    'צלמים לשירותי צילום מסחרי', 'צלמים לטיולים וצילום שטח', 'צלמים לתחום האירועים והפקות',
    'צלמים לפרויקטים יצירתיים', 'צלמים לשירותי צילום בהתאמה אישית', 'צלמים לצילום הופעות חיות',
    'צלמים לצילום עיתונאי', 'צלמים לצילום סרטונים שיווקיים'
  ],
  openGraph: {
    title: 'Tsalamim - מצא את הצלם שלך',
    description: 'מצאו צלם מקצועי לכל אירוע - אירוסין, ברית, ימי הולדת, ספורט ועוד.',
    url: 'https://tsalamim.com',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />

        {/* מטא-תגיות SEO */}
        <meta name="keywords" content="צילום אירועים, צלם מקצועי, צלם פרילנסר, צלם חתונות, צלם אירוסין, בוק צילומים, צלמים לאירועים, צלמים מקצועיים, צלמים לפרויקטים, צלמים לחתונה, צלמים לאירוסין, צלמים למסיבות, צלמים לבר מצווה, צלמים לבת מצווה, צלמים להפקות אופנה, צלמים לכנסים, צלמים לפרסום, צלמים למסעדות, צלמים לנדל״ן, צלמים לעסקים, צלמים לקטלוגים, צלמים לאירועי ספורט, צלמים לאירועים קטנים, צלמים לצילומי חוץ, צלמים לסטודיו, צלמים לאירועים משפחתיים, צלמים לצילומי פורטרטים, צלמים לשירותי צילום, צלמים לטבע, צלמים לצילומי וידאו, צלמים לעריכת תמונות, צלמים לצילום הופעות, צלמים לצילום קליפים, צלמים למגנטים, צלמים לאירועים ביתיים, צלמים מקצועיים לשירותכם, צלמים ליום הולדת, צלמים לשירותי צילום תדמית, צלמים לצילום מוצרים, צלמים לצילום אוכל, צלמים לפרויקטים עסקיים, צלמים לצילום משפחות, צלמים לאירועים עסקיים, צלמים מקצועיים לצילום אישי, צלמים לפרסום ושיווק, צלמים מקצועיים לפרויקטים אומנותיים, צלמים לסטיילינג, צלמים מקצועיים לשירותים פרטיים, צלמים לשירותי צילום מסחרי, צלמים לטיולים וצילום שטח, צלמים לתחום האירועים והפקות, צלמים לפרויקטים יצירתיים, צלמים לשירותי צילום בהתאמה אישית, צלמים לצילום הופעות חיות, צלמים לצילום עיתונאי, צלמים לצילום סרטונים שיווקיים" />
        <meta name="author" content="Tsalamim - פלטפורמת הצלמים והלקוחות" />
        <meta name="robots" content="index, follow" />

        {/* גוגל פונטים */}
        <link href="https://fonts.googleapis.com/css2?family=Alef&display=swap" rel="stylesheet" />
        {/* Meta Pixel Code */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1349648316212208');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1349648316212208&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}

      </head>
      <body>
        <AuthProvider>
          <Navbar />
          {/* Add top padding or margin to offset the fixed navbar height */}
          <main style={{ paddingTop: '64px' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
