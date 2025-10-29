// src/components/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/img/halliwell-jones-logo.png"; // keep this path if it exists

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/bikes", label: "Bikes" },
    { to: "/part-exchange", label: "Part Exchange" },
    { to: "/deals", label: "Deals" },
    { to: "/to-do", label: "To Do" },
    { to: "/add-new-deal", label: "Add New Deal", primary: true }, // CTA
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0f1221] text-white shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
      {/* Top line: logo + title */}
      <div className="flex items-center justify-center gap-3 py-3 border-b border-[#1c2143]">
        <img src={logo} alt="Halliwell Jones Logo" className="h-10 w-auto" />
        <h1 className="text-xl font-semibold">Halliwell Jones Motorrad</h1>
      </div>

      {/* Navigation tabs */}
      <nav className="flex justify-center gap-7 py-2.5 bg-[#1b2143] border-y border-[#141936] border-b-[#0e1230]">
        {links.map(({ to, label, primary }) => (
          <NavItem key={label} to={to} label={label} primary={primary} />
        ))}
      </nav>
    </header>
  );
}

function NavItem({ to, label, primary = false }) {
  const ACCENT = "text-[#7aa2ff]";
  const ACCENT_BG = "bg-[#7aa2ff]";
  const ACCENT_BG_HOVER = "hover:bg-[#5b7cff]";
  const TEXT_DEFAULT = "text-[#e8eaf5]";

  if (primary) {
    // Pill CTA button
    return (
      <NavLink
        to={to}
        end={to === "/"}
        aria-label={`${label} (primary action)`}
        className={({ isActive }) =>
          [
            "inline-flex items-center font-semibold text-[0.95rem] px-3.5 py-2 rounded-full",
            ACCENT_BG,
            "text-[#0b1027]",
            "border border-white/10",
            "shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
            "transition-all duration-150",
            ACCENT_BG_HOVER,
            isActive ? "translate-y-[1px] shadow-[0_6px_16px_rgba(0,0,0,0.30)]" : "hover:-translate-y-px",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7aa2ff] focus:ring-offset-[#1b2143]",
          ].join(" ")
        }
      >
        {label}
      </NavLink>
    );
  }

  // Text tab with active underline (no inline styles, no paddingBottom)
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "relative inline-flex items-center font-semibold text-[0.95rem] px-0 py-1 transition-all duration-150",
          TEXT_DEFAULT,
          "hover:text-[#7aa2ff] hover:-translate-y-[2px]",
          // active underline via border (no paddingBottom)
          "border-b-2",
          isActive ? `border-[#7aa2ff] ${ACCENT}` : "border-transparent",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7aa2ff] focus:ring-offset-[#1b2143]",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}
