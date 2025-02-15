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
            איך זה עובד בחמישה שלבים? 📸
          </h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                1. נרשמים כמשתמשים באתר
              </h2>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                2. ממלאים טופס ובו תזינו את פרטי האירוע שלכם
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                כתובת, תאריך, שעה, וכמובן סוג האירוע שתרצו לתעד.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                3. פרטי תשלום
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                תועברו לטופס הזנת פרטי תשלום, החיוב בפועל יתבצע רק לאחר שהמערכת תמצא צלם עבורכם.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                4. חיפוש אוטומטי של צלם עבור האירוע שלכם
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                המערכת אוטומטית תעדכן אתכם בSMS ובאתר כשאר נקבע הצלם לאירוע שלכם בצירוף פרטי ההתקשרות איתו.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                5. קבלת התמונות והורדתן
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                מזל טוב! חגגתם באירוע משמח!
                בתוך כ24 שעות, הצלם יעלה את התמונות ללא סינון או עריכה למערכת האתר, והתמונות יהיו זמינות עבורכם להורדה למשך חודש.
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
