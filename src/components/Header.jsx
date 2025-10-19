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
    { path: "/add-new-deal", label: "Add New Deal" },
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

function NavTab({ to, label }) {
  const baseStyle = {
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    position: "relative",
    transition: "color 0.25s ease, transform 0.25s ease",
    padding: "6px 0",
  };

  const activeStyle = {
    color: "#007bff",
    borderBottom: "2px solid #007bff",
    paddingBottom: "4px",
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
        e.target.style.transform = "translateY(0)";
        if (!e.currentTarget.matches('[aria-current="page"]')) {
          e.target.style.color = "#e8eaf5";
        }
      }}
    >
      {label}
    </NavLink>
  );
}
