"use client"; // This marks the file as a Client Component

import React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const AboutPage = () => {
  const router = useRouter();
  
  return (
    <DirectionProvider dir="rtl">
      <div style={styles.aboutPage}>
        <div style={styles.container}>
          <h1 style={styles.header}>קצת עלינו</h1>
          <p style={styles.description}>
            ברוכים הבאים לצלמים! החזון שלנו הוא לחבר בין צלמים בתחילת דרכם לבעלי אירועים קטנים.
          </p>
          <p style={styles.description}>
            אנחנו עוזרים לבעלי אירועים לתעד את האירוע שלהם בלי להוציא אלפי שקלים על שם ומותג.
            <br />
            צוות הצלמים שלנו מורכב מצעירים חדורי מוטיבציה, בתחילת דרכם בעולם הצילום, בעלי מצלמת עדשה (DSLR) מקצועית - אותה הם יביאו כדי לתעד את האירוע שלך בצורה הטובה ביותר.
            <br />
            יש לך אירוע קטן שתרצה לתעד בלי לסנג'ר את החבר עם המצלמה? אנחנו הכתובת בשבילך.
            פרסם אירוע אצלנו באתר ותתחבר לצלם בתחילת דרכו לתיעוד האירוע.
            <br />
            <br />
            שימו לב, השירות לא כולל עריכה או סינון של התמונות, התמונות מועלות לאתר מיד לאחר האירוע וניתן להוריד אותם מהאתר שלנו.
          </p>
          <div style={styles.info}>
            <p>אם יש לכם שאלות מוזמנים לפנות אלינו בעמוד צור קשר.</p>
          </div>
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
  aboutPage: {
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
  info: {
    fontSize: "1rem",
    color: "#6c757d",
    marginTop: "20px",
  },
  button: {
    marginTop: "20px",
  },
};

export default AboutPage;
