"use client";

import React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const HowItWorksPage = () => {
  const router = useRouter();

  return (
    <DirectionProvider dir="rtl">
      <div className="bg-gradient-to-br from-purple-100 via-white to-purple-200 p-6 sm:p-10 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-6 text-center">
            כיצד זה עובד
          </h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                1. הרשמה ופרסום אירוע
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                בעלי אירועים נרשמים בקלות, מפרסמים את האירוע שלהם ומוסיפים אמצעי תשלום מאובטח.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                2. התאמת צלם
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                הצלמים שלנו מקבלים התראה על אירועים חדשים באזורם ובוחרים האם לקבל את האירוע.
                התשלום מעובד ברקע והפרטים המלאים של האירוע נשלחים לשני הצדדים.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                3. תיעוד האירוע
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                ביום האירוע, גם בעל האירוע וגם הצלם מקבלים התראה לאשר שהכל מתנהל כשורה.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                4. העלאת תמונות וסיום האירוע
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                מיד לאחר האירוע, הצלם מקבל התראה להעלות את התמונות תוך 24 שעות. לאחר ההעלאה,
                התשלום מועבר לצלם. והתמונות זמינות להורדה לבעל האירוע למשך חודש.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
              onClick={() => router.push("/contact")}
            >
              צור קשר למידע נוסף
            </Button>
          </div>
        </motion.div>
      </div>
    </DirectionProvider>
  );
};

export default HowItWorksPage;
