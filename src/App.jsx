// src/App.jsx
import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";

// --- Simple placeholder pages so this runs without extra files ---
function Home() {
  return <div style={styles.page}><h2>Home</h2><p>Welcome to Halliwell Jones Motorrad.</p></div>;
}
function Inventory() {
  return <div style={styles.page}><h2>Inventory</h2><p>List your bikes here.</p></div>;
}
function PartExchange() {
  return <div style={styles.page}><h2>Part Exchange</h2><p>Evaluate and record PX details.</p></div>;
}
function Contact() {
  return <div style={styles.page}><h2>Contact</h2><p>Get in touch with the team.</p></div>;
}

// --- Main App ---
export default function App() {
  return (
    <div style={styles.app}>
      {/* Fixed header: logo + title + tabs */}
      <Header />

      {/* Add top margin to prevent content hiding behind fixed header */}
      <main style={styles.main}>
        <Routes>
          <Route path="/deals" element={<div style={styles.page}><h2>Deals</h2></div>} />
          <Route path="/bikes" element={<div style={styles.page}><h2>Bikes</h2></div>} />
          <Route path="/todo" element={<div style={styles.page}><h2>To Do</h2></div>} />
          <Route path="/add-new-deal" element={<div style={styles.page}><h2>Add New Deal</h2></div>} />
        </Routes>
      </main>
    </div>
  );
}

// --- Minimal inline styles ---
const styles = {
  app: {
    minHeight: "100vh",
    background:
      "radial-gradient(60% 80% at 50% 20%, #1b2143 0%, #0f1221 60%)",
    color: "#e8eaf5",
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", "Apple Color Emoji", "Segoe UI Emoji"',
  },
  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "160px 16px 48px", // top padding = header height (fixed space)
  },
  page: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  },
};
