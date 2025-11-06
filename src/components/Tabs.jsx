// src/components/Tabs.jsx
import React from "react";

export default function Tabs({ tabs = [], active, onChange, className = "" }) {
  return (
    <div className={`w-full ${className}`}>
      <div
        role="tablist"
        aria-label="Selected bike sections"
        className="flex gap-2 border-b"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            onClick={() => onChange(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-xl
              ${active === t.id ? "bg-white border border-b-0" : "bg-gray-100 border-transparent"}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
          className="bg-white border rounded-b-xl p-4"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
