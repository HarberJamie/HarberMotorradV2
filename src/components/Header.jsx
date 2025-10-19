// src/components/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/img/halliwell-jones-logo.png"; // correct path

export default function Header() {
  const links = [
    { path: "/", label: "Home" },
    { path: "/deals", label: "Deals" },
    { path: "/part-exchange", label: "Part Exchange" },
    { path: "/bikes", label: "Bikes" },
    { path: "/todo", label: "To Do" },
    { path: "/add-new-deal", label: "Add New Deal", primary: true }, // ⟵ CTA
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
        <img src={logo} alt="Halliwell Jones Logo" style={{ height: "40px" }} />
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
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
        {links.map(({ path, label, primary }) => (
          <NavTab key={label} to={path} label={label} primary={primary} />
        ))}
      </nav>
    </header>
  );
}

function NavTab({ to, label, primary = false }) {
  // Palette (kept close to your existing theme)
  const ACCENT = "#7aa2ff";
  const ACCENT_HOVER = "#5b7cff";
  const TEXT_DEFAULT = "#e8eaf5";

  const baseStyle = {
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    position: "relative",
    transition: "all 0.2s ease",
    padding: primary ? "8px 14px" : "6px 0",
    color: primary ? "#0b1027" : TEXT_DEFAULT,
    outline: "none",
  };

  const primaryStyle = {
    background: ACCENT,
    borderRadius: "999px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)",
    transform: "translateY(0)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const primaryActiveStyle = {
    background: ACCENT_HOVER,
    boxShadow: "0 6px 16px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)",
  };

  const textTabActiveStyle = {
    color: ACCENT,
    borderBottom: `2px solid ${ACCENT}`,
    paddingBottom: "4px",
  };

  return (
    <NavLink
      to={to}
      end
      style={({ isActive }) => {
        // Start with base
        let s = { ...baseStyle };

        if (primary) {
          // Primary CTA styles
          s = { ...s, ...primaryStyle };
          if (isActive) s = { ...s, ...primaryActiveStyle };
        } else {
          // Regular text tab styles
          s.color = isActive ? ACCENT : TEXT_DEFAULT;
          if (isActive) s = { ...s, ...textTabActiveStyle };
        }

        return s;
      }}
      onMouseEnter={(e) => {
        if (primary) {
          e.currentTarget.style.background = ACCENT_HOVER;
          e.currentTarget.style.transform = "translateY(-1px)";
        } else {
          e.currentTarget.style.color = ACCENT;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        if (primary) {
          e.currentTarget.style.background = ACCENT;
        } else {
          // avoid overriding active state color for the current page
          if (!e.currentTarget.matches('[aria-current="page"]')) {
            e.currentTarget.style.color = TEXT_DEFAULT;
          }
        }
      }}
      onFocus={(e) => {
        // keyboard focus ring (a11y)
        e.currentTarget.style.boxShadow = primary
          ? "0 0 0 3px rgba(122,162,255,0.35), 0 4px 12px rgba(0,0,0,0.25)"
          : "0 0 0 3px rgba(122,162,255,0.35)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = primary
          ? "0 4px 12px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)"
          : "none";
      }}
      aria-label={primary ? `${label} (primary action)` : label}
    >
      {label}
    </NavLink>
  );
}
