"use client"; // This marks the file as a Client Component

import React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const AboutPage = () => {
  const router = useRouter();

  return (
    <DirectionProvider dir="rtl">
      <div className="bg-gradient-to-br from-purple-100 via-white to-purple-200 p-6 sm:p-10 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-6 text-center">
            קצת עלינו
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
            ברוכים הבאים לצלמים! החזון שלנו הוא לחבר בין צלמים בתחילת דרכם לבעלי אירועים קטנים.
          </p>
          <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
            אנחנו עוזרים לבעלי אירועים לתעד את האירוע שלהם בלי להוציא אלפי שקלים על שם ומותג.
            <br />
            <br />
            צוות הצלמים שלנו מורכב מצעירים חדורי מוטיבציה, בתחילת דרכם בעולם הצילום, בעלי מצלמת עדשה (DSLR) מקצועית - אותה הם יביאו כדי לתעד את האירוע שלך בצורה הטובה ביותר.
            <br />
            <br />
            יש לך אירוע קטן שתרצה לתעד בלי לסנג'ר את החבר עם המצלמה? אנחנו הכתובת בשבילך.
            <br />
            פרסם אירוע אצלנו באתר ותתחבר לצלם בתחילת דרכו לתיעוד האירוע.
          </p>
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            שימו לב, השירות לא כולל עריכה או סינון של התמונות, התמונות מועלות לאתר מיד לאחר האירוע וניתן להוריד אותם מהאתר שלנו.
          </p>
          <div className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            <p>אם יש לכם שאלות מוזמנים לפנות אלינו בעמוד צור קשר.</p>
          </div>
          <div className="flex justify-center">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
              onClick={() => router.push("/contact")}
            >
              צור קשר
            </Button>
          </div>
        </motion.div>
      </div>
    </DirectionProvider>
  );
};

export default AboutPage;
