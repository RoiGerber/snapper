"use client"; // This marks the file as a Client Component

import React from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  return (
    <DirectionProvider dir="rtl"> 
    <div style={styles.aboutPage}>
      <div style={styles.container}>
        <h1 style={styles.header}>קצת עלינו</h1>
        <p style={styles.description}>
          ברוכים הבאים לסנאפפר! החזון שלנו הוא לחבר בין צלמים בתחילת דרכם ביצירת תיק העבודות שלהם עם בעלי אירועים שרוצים לקבל תיעוד לאירוע שלהם במחיר משתלם.
        </p>
        <div style={styles.info}>
          <p>אם יש לכם שאלות מוזמנים לפנות אלינו בעמוד צור קשר.</p>
        </div>
        <Button variant="contained" color="primary" style={styles.button}>
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
  image: {
    width: '100%',
    height: 'auto',
    marginBottom: '20px',
  },
  description: {
    fontSize: '1.2rem',
    color: '#6c757d',
    margin: '20px 0',
  },
  info: {
    fontSize: '1rem',
    color: '#6c757d',
    marginTop: '20px',
  },
  button: {
    marginTop: '20px',
  },
};

export default AboutPage;
