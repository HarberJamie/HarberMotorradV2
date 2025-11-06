// src/components/Select.jsx
import React from "react";

export default function Select({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  required = false,
  helpText,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-sm font-medium text-gray-200">
          {label} {required && <span className="text-red-400">*</span>}
        </span>
      )}
      <select
        id={id}
        name={id}
        value={value ?? ""}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && (
        <span className="mt-1 block text-xs text-gray-400">{helpText}</span>
      )}
    </label>
  );
}
