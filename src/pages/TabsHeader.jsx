import React from "react";

export default function TabsHeader({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist" aria-label="Part-Exchange Sections">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          aria-controls={`panel-${t.id}`}
          id={`tab-${t.id}`}
          tabIndex={active === t.id ? 0 : -1}
          className={`tab ${active === t.id ? "tab--active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}

      <style>{`
        .tabs { display: flex; gap: .5rem; border-bottom: 1px solid #e5e7eb; margin-bottom: .75rem; flex-wrap: wrap; }
        .tab { appearance: none; background: transparent; border: 0; padding: .6rem .9rem; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; }
        .tab--active { border-bottom-color: #1f7aec; color: #1f7aec; }
      `}</style>
    </div>
  );
}
