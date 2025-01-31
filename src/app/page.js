'use client';

import useUserRole from '@/hooks/useUserRole';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Camera, Images, Settings, Calendar,Plus, CalendarPlus } from 'lucide-react';
import { DirectionProvider } from '@radix-ui/react-direction';


const MainPage = () => {
  const router = useRouter();
  const { role, isLoading } = useUserRole();
  const [isValidRole, setIsValidRole] = useState(false);

  useEffect(() => {
    if (isLoading) return;
  
    // Handle null/undefined roles
    if (!role) {
      console.log('No role found, redirecting...');
      setIsValidRole(false); // Update state to prevent rendering
      router.replace('/getStarted');
      return;
    }
  
    // Validate role
    if (['photographer', 'client'].includes(role)) {
      setIsValidRole(true);
    } else {
      console.log('Invalid role, redirecting:', role);
      setIsValidRole(false); // Update state to prevent rendering
      router.replace('/getStarted');
    }
  }, [role, isLoading, router]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isValidRole) {
    return null; // Redirecting or invalid state
  }

  return (
    <DirectionProvider dir="rtl">
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-32 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden">
        {/* Existing blob background elements */}
      </div>

      {/* Animated Role Title - Centered with reduced spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-8 text-center w-full"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mx-auto">
  ברוך הבא לסנאפפר
</h1>
        <p className="mt-2 md:mt-3 text-lg md:text-xl text-indigo-900/80 mx-auto max-w-xl">
          {role === 'photographer' 
            ? 'בונים ביחד אתך את תיק העבודות כצלם'
            : 'תעד את הרגעים החשובים שלך ותחווה אותם מחדש – צלם את האירוע שלך בעלות המשתלמת ביותר, עם צלמים שבונים את תיק העבודות שלהם יחד איתך.'}
        </p>
      </motion.div>

      {role === 'photographer' ? (
        <PhotographerDashboard />
      ) : (
        <ClientDashboard />
      )}
    </div>
    </DirectionProvider>
  );


};


const PhotographerDashboard = () => {
  return (
    <div className="flex p-4 space-x-4 h-[65vh] relative z-10"> {/* Reduced height */}
      <motion.div
        className="h-full flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 transition-all duration-300 cursor-pointer ml-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href="/marketplace" className="w-full h-full flex flex-col items-center justify-center text-center">
          <Camera className="w-12 h-12 mb-4 text-white opacity-90" />
          <div className="text-white text-4xl font-bold mb-4">אירועים זמינים</div>
          <p className="text-white text-lg opacity-80">
            בנה את תיק העבודות שלך, מצא בעל אירוע שמחפש צלם.
          </p>
        </Link>
      </motion.div>

      <motion.div
        className="h-full flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-600 transition-all duration-300 cursor-pointer mr-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href="/manage" className="w-full h-full flex flex-col items-center justify-center text-center">
          <Images className="w-12 h-12 mb-4 text-white opacity-90" />
          <div className="text-white text-4xl font-bold mb-4">ניהול האירועים שלי</div>
          <p className="text-white text-lg opacity-80">
            נהל את האירועים שלך, העלאת תמונות, פרטים ליצירת קשר ועוד.
          </p>
        </Link>
      </motion.div>
    </div>
  );
};

const ClientDashboard = () => {
  return (
    <div className="flex p-4 space-x-4 h-[65vh] relative z-10"> {/* Reduced height */}
      <motion.div
        className="h-full flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 transition-all duration-300 cursor-pointer ml-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href="/postevent" className="w-full h-full flex flex-col items-center justify-center text-center">
          <CalendarPlus className="w-12 h-12 mb-4 text-white opacity-90" />
          <div className="text-white text-4xl font-bold mb-4">פרסום אירוע</div>
          <p className="text-white text-lg opacity-80">
            חפש את הצלם לאירוע שלך.
          </p>
        </Link>
      </motion.div>

      <motion.div
        className="h-full flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-green-500 transition-all duration-300 cursor-pointer mx-4"


        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href="/myevents" className="w-full h-full flex flex-col items-center justify-center text-center">
          <Calendar className="w-12 h-12 mb-4 text-white opacity-90" />
          <div className="text-white text-4xl font-bold mb-4">האירועים שלי</div>
          <p className="text-white text-lg opacity-80">
          עיין באירועים שלך.
          </p>
        </Link>
      </motion.div>


    </div>
  );
};

export default MainPage;