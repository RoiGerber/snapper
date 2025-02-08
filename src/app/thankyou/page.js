"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const ThankYouPage = () => {
  const [orderId, setOrderId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const orderId = query.get("Order");
    const transactionId = query.get("Id");
    
    setOrderId(orderId);
    setTransactionId(transactionId);

    const updateEventStatus = async () => {
      if (orderId) {
        try {
          const eventRef = doc(db, "events", orderId);
          await updateDoc(eventRef, { 
            status: "paid",
            transaction_id: transactionId
          });
          console.log(`Event with Order ID ${orderId} marked as paid. Transaction ID: ${transactionId}`);
        } catch (error) {
          console.error("Error updating event status:", error);
        }
      }
    };

    if (orderId) updateEventStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-indigo-800 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              האירוע נוצר במערכת בהצלחה!
            </motion.h1>
            
            <motion.div
              className="text-lg text-gray-700 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {transactionId ? (
                <>
                  <p className="leading-relaxed">
                    ההזמנה שלך השלמה בהצלחה. <br />
                    מספר הזמנה: <strong className="text-indigo-600">{transactionId}</strong>
                  </p>
                  <p className="text-gray-600 text-sm md:text-base">
                    החיוב בפועל יתרחש לאחר מציאת הצלם לאירוע שלך.
                  </p>
                </>
              ) : (
                <p className="text-gray-600">אנחנו מעבדים את התשלום שלך. אנא המתן...</p>
              )}
            </motion.div>
          </div>

          <motion.div
            className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>אם יש לך שאלות, אנא פנה לצוות התמיכה שלנו.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYouPage;