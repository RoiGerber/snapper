"use client"; // This marks the file as a Client Component

import React, { useState } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Button } from "@/components/ui/button";
import { db } from '@/lib/firebaseConfig';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        timestamp: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error saving message: ", error);
    }

    setLoading(false);
  };

  return (
    <DirectionProvider dir="rtl">
      <div style={styles.contactPage}>
        <div style={styles.container}>
          <h1 style={styles.header}>צור קשר</h1>
          {success && <p style={styles.success}>ההודעה נשלחה בהצלחה!</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="שם מלא"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="אימייל"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              dir="rtl"
              type="tel"
              name="phone"
              placeholder="מספר טלפון"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <textarea
              name="message"
              placeholder="ההודעה שלך"
              value={formData.message}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? "שולח..." : "שלח הודעה"}
            </Button>
          </form>
        </div>
      </div>
    </DirectionProvider>
  );
};

const styles = {
  contactPage: {
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
  success: {
    color: "green",
    fontSize: "1.2rem",
    marginBottom: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  textarea: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
    minHeight: "100px",
  },
};

export default ContactPage;
