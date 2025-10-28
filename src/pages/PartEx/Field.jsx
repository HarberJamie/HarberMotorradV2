// src/pages/PartEx/Field.jsx
import React from "react";

export default function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  as = "input",
  options = [], // for selects: [{value:'Full', label:'Full'}, ...]
  placeholder = "",
}) {
  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={name}>{label}</label>}
      {as === "select" ? (
        <select id={name} name={name} value={value ?? ""} onChange={onChange}>
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
