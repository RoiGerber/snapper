"use client"; // This marks the file as a Client Component

import React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const PricingPage = () => {
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
            מחירים
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            המחיר הינו 450 ש"ח לאירוע.
            <br />
            <br />
            המחיר כולל עלויות תפעול, אחזקת האתר ושמירת התמונות.
            <br />
            <br />
            בנוסף, אנו מפעילים מנגנון מיוחד למציאת הצלמים המתאימים ביותר לאירוע שלך.
            <br />
            <br />
            מתוך סכום זה, 350 ש"ח מועברים ישירות לצלם עבור צילום האירוע עצמו.
          </p>
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

export default PricingPage;
