"use client"; // This marks the file as a Client Component

import React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const HowItWorksPage = () => {
  const router = useRouter();
  
  return (
    <DirectionProvider dir="rtl">
      <div style={styles.howItWorksPage}>
        <div style={styles.container}>
          <h1 style={styles.header}>כיצד זה עובד</h1>
          <div style={styles.step}>
            <h2 style={styles.stepHeader}>1. הרשמה ופרסום אירוע</h2>
            <p style={styles.stepDescription}>
              בעלי אירועים נרשמים בקלות, מפרסמים את האירוע שלהם ומוסיפים אמצעי תשלום מאובטח.
            </p>
          </div>
          <div style={styles.step}>
            <h2 style={styles.stepHeader}>2. התאמת צלם</h2>
            <p style={styles.stepDescription}>
              הצלמים שלנו מקבלים התראה על אירועים חדשים באזורם ובוחרים האם לקבל את האירוע.
           התשלום מעובד ברקע והפרטים המלאים של האירוע נשלחים לשני הצדדים.
            </p>
          </div>
          <div style={styles.step}>
            <h2 style={styles.stepHeader}>4. תיעוד האירוע</h2>
            <p style={styles.stepDescription}>
              ביום האירוע, גם בעל האירוע וגם הצלם מקבלים התראה לאשר שהכל מתנהל כשורה.
            </p>
          </div>
          <div style={styles.step}>
            <h2 style={styles.stepHeader}>5. העלאת תמונות וסיום האירוע</h2>
            <p style={styles.stepDescription}>
          מיד לאחר האירוע, הצלם מקבל התראה להעלות את התמונות תוך 24 שעות. לאחר ההעלאה, התשלום מועבר לצלם. והתמונות זמינות להורדה לבעל האירוע למשך חודש.
            </p>
          </div>
          <Button
            variant="contained"
            color="primary"
            style={styles.button}
            onClick={() => router.push("/contact")}
          >
            צור קשר למידע נוסף
          </Button>
        </div>
      </div>
    </DirectionProvider>
  );
};

// Inline styles for the component
const styles = {
  howItWorksPage: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  container: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "800px",
    textAlign: "right",
  },
  header: {
    fontSize: "2.5rem",
    color: "#28a745",
    marginBottom: "20px",
  },
  step: {
    marginBottom: "20px",
  },
  stepHeader: {
    fontSize: "1.8rem",
    color: "#343a40",
    marginBottom: "10px",
  },
  stepDescription: {
    fontSize: "1.2rem",
    color: "#6c757d",
    lineHeight: "1.6",
  },
  button: {
    marginTop: "30px",
  },
};

export default HowItWorksPage;
