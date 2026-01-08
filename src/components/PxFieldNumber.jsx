// src/components/PxFieldNumber.jsx
import React from "react";

export default function PxFieldNumber({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-400 mb-1">
        {label}
      </label>
      <input
        type="number"
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
