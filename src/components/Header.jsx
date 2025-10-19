// src/components/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/img/Halliwell-jones-logo.png"; // adjust path if needed

export default function Header() {
  const links = [
    { path: "/", label: "Home" },
    { path: "/inventory", label: "Inventory" },
    { path: "/part-exchange", label: "Part Exchange" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#0f1221",
        color: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
        zIndex: 1000,
      }}
    >
      {/* --- Top line: logo + title --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "12px 0",
          borderBottom: "1px solid #1c2143",
        }}
      >
        <img
          src={logo}
          alt="Halliwell Jones Logo"
          style={{ height: "40px" }}
        />
        <h1 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
          Halliwell Jones Motorrad
        </h1>
      </div>

      {/* --- Navigation tabs --- */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "28px",
          padding: "10px 0",
          background: "#1b2143",
          borderTop: "1px solid #141936",
          borderBottom: "1px solid #0e1230",
        }}
      >
        {links.map(({ path, label }) => (
          <NavTab key={label} to={path} label={label} />
        ))}
      </nav>
    </header>
  );
}

// --- Reusable NavTab component ---
function NavTab({ to, label }) {
  const baseStyle = {
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    position: "relative",
    transition: "color 0.25s ease, transform 0.25s ease",
  };

  const activeStyle = {
    color: "#007bff", // BMW blue
    borderBottom: "2px solid #007bff",
    paddingBottom: "2px",
  };

  return (
    <NavLink
      to={to}
      end
      style={({ isActive }) => ({
        ...baseStyle,
        color: isActive ? "#007bff" : "#e8eaf5",
        ...(isActive ? activeStyle : {}),
      })}
      onMouseEnter={(e) => {
        e.target.style.color = "#007bff";
        e.target.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        if (!e.target.classList.contains("active")) {
          e.target.style.color = "#e8eaf5";
        }
        e.target.style.transform = "translateY(0)";
      }}
    >
      {label}
    </NavLink>
  );
}
