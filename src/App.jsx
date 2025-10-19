// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";

// Real pages
import ToDo from "./pages/ToDo.jsx";
import NewDeal from "./pages/NewDeal.jsx";

// --- Placeholder pages (keep until you build real ones) ---
function Home() {
  return (
    <div style={styles.page}>
      <h2>Home</h2>
      <p>Welcome to Halliwell Jones Motorrad.</p>
    </div>
  );
}

function Deals() {
  return (
    <div style={styles.page}>
      <h2>Deals</h2>
      <p>View or manage current motorcycle deals.</p>
    </div>
  );
}

function PartExchange() {
  return (
    <div style={styles.page}>
      <h2>Part Exchange</h2>
      <p>Evaluate and record part exchange details here.</p>
    </div>
  );
}

function Bikes() {
  return (
    <div style={styles.page}>
      <h2>Bikes</h2>
      <p>Browse and manage available bikes in stock.</p>
    </div>
  );
}

// --- Main App ---
export default function App() {
  return (
    <div style={styles.app}>
      {/* Fixed header */}
      <Header />

      {/* Add top padding to prevent overlap with fixed header */}
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/part-exchange" element={<PartExchange />} />
          <Route path="/bikes" element={<Bikes />} />

          {/* Real pages wired up */}
          <Route path="/todo" element={<ToDo />} />
          <Route path="/add-new-deal" element={<NewDeal />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// --- Inline styling ---
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
    padding: "160px 16px 48px", // top padding leaves space for the fixed header
  },
  page: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  },
};
