"use client"; // This marks the file as a Client Component

import React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const PricingPage = () => {
  const router = useRouter();

  return (
    <DirectionProvider dir="rtl">
      <div style={styles.pricingPage}>
        <div style={styles.container}>
          <h1 style={styles.header}>מחירים</h1>
          <p style={styles.description}>
            המחיר הינו 450 ש"ח לאירוע.
            <br />
            המחיר כולל עלויות תפעול, אחזקת האתר ושמירת התמונות.
            <br />
            בנוסף, אנו מפעילים מנגנון מיוחד למציאת הצלמים המתאימים ביותר לאירוע שלך.
            <br />
            מתוך סכום זה, 350 ש"ח מועברים ישירות לצלם עבור צילום האירוע עצמו.
          </p>
          <Button
            variant="contained"
            color="primary"
            style={styles.button}
            onClick={() => router.push("/contact")}
          >
            צור קשר
          </Button>
        </div>
      </div>
    </DirectionProvider>
  );
};

// Inline styles for the component
const styles = {
  pricingPage: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "600px",
    textAlign: "center",
  },
  header: {
    fontSize: "2.5rem",
    color: "#28a745",
  },
  description: {
    fontSize: "1.2rem",
    color: "#6c757d",
    margin: "20px 0",
  },
  button: {
    marginTop: "20px",
  },
};

export default PricingPage;
