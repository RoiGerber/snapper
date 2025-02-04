"use client"; // This marks the file as a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use `next/navigation` in the App Router
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";

const ThankYouPage = () => {
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search); // Extract query params only on the client
    const orderId = query.get("Order"); // Extract `Order` parameter from the URL
    const transactionId = query.get("Id"); // Extract transaction ID from `Id` parameter
    
    setOrderId(orderId);

    const updateEventStatus = async () => {
      if (orderId) {
        try {
          // Update the event status in Firestore
          const eventRef = doc(db, "events", orderId);
          await updateDoc(eventRef, { 
            status: "paid",
            transaction_id: transactionId // Add transaction ID to document
          });

          console.log(`Event with Order ID ${orderId} marked as paid. Transaction ID: ${transactionId}`);
        } catch (error) {
          console.error("Error updating event status:", error);
        }
      }
    };

    if (orderId) {
      updateEventStatus();
    }
  }, []); // Empty dependency array to run only once on mount

  return (
    <div style={styles.thankyouPage}>
      <div style={styles.container}>
        <h1 style={styles.header}>תודה על התשלום!</h1>
        <p style={styles.statusMessage}>
          {orderId ? (
            <>
              התשלום שלך הושלם בהצלחה. <br />
              מספר הזמנה: <strong>{orderId}</strong>
            </>
          ) : (
            "אנחנו מעבדים את התשלום שלך. אנא המתן..."
          )}
        </p>
        <div style={styles.info}>
          <p>אם יש לך שאלות, אנא פנה לצוות התמיכה שלנו.</p>
        </div>
      </div>
    </div>
  );
};

// Inline styles for the component
const styles = {
  thankyouPage: {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
  },
  header: {
    fontSize: '2.5rem',
    color: '#28a745',
  },
  statusMessage: {
    fontSize: '1.2rem',
    margin: '20px 0',
  },
  info: {
    fontSize: '1rem',
    color: '#6c757d',
    marginTop: '20px',
  },
};

export default ThankYouPage;
