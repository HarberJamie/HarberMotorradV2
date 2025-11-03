import React from "react";

export function TabsHeader({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 border-b">
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`px-3 py-2 rounded-t-lg text-sm font-medium
             ${active === t.id ? "bg-white border border-b-white border-gray-300" : "text-gray-600 hover:text-black"}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ active, when, children }) {
  if (active !== when) return null;
  return (
    <div role="tabpanel" aria-labelledby={`tab-${when}`} className="py-4">
      {children}
    </div>
  );
}
