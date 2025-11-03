// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Deals from "./pages/Deals.jsx";
// --- Import your real pages ---
import NewDeal from "./pages/NewDeal.jsx"; // ✅ Add this import
import PartEx from "./pages/PartEx/PartExchange.jsx"; // exact case
import BikesPage from "./pages/Bikes/BikesPage.jsx";
import AddBike from "./pages/Bikes/AddBike.jsx";

// --- Placeholder pages (can be replaced with real components later) ---
function Home() {
  return (
    <div style={styles.page}>
      <h2>Home</h2>
      <p>Welcome to Halliwell Jones Motorrad.</p>
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

function ToDo() {
  return (
    <div style={styles.page}>
      <h2>To Do</h2>
      <p>Track tasks, admin work, and upcoming customer actions.</p>
    </div>
  );
}

// --- Main App ---
export default function App() {
  return (
    <div style={styles.app}>
      {/* Fixed header */}
      <Header />

      {/* Main content with top padding to clear the fixed header */}
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bikes" element={<BikesPage />} />
          <Route path="/add-bike" element={<AddBike />} />
          <Route path="/part-exchange" element={<PartExchange />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/to-do" element={<ToDo />} />
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
    padding: "160px 16px 48px", // ✅ keeps space for the fixed header
  },
  page: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  },
};
