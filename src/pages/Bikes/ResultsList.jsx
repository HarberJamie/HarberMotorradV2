import React from "react";
import { useBikes } from "@/lib/bikesStore.js";
import { normalizeKey } from "@/lib/normalizeKey.js";

const COLS = [
  { label: "Registration" },
  { label: "Make" },
  { label: "Model" },
  { label: "Trim" },
  { label: "Vin" },
  { label: "Status (Event)" },
  { label: "Total Miles", fmt: (v) => (isFinite(Number(v)) ? Number(v).toLocaleString() : "–") },
  {
    label: "Price",
    fmt: (v) =>
      v === null || v === undefined || v === "" || isNaN(Number(v))
        ? "–"
        : `£${Number(v).toLocaleString()}`,
  },
  { label: "VAT Qualifying", fmt: (v) => (typeof v === "boolean" ? (v ? "Yes" : "No") : v ?? "–") },
];

// Override map if any normalized labels differ from stored keys
const KEY_OVERRIDES = {
  preperationCosts: "preparationCosts",
};

function getByLabel(row, label) {
  const k = normalizeKey(label);
  const key = KEY_OVERRIDES[k] || k;
  return row?.[key];
}

function fmt(raw, col) {
  const v = raw ?? (raw === 0 ? 0 : null);
  if (v === null || v === "") return "–";
  if (col?.fmt) return col.fmt(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

export default function ResultsList({ selectedId, onSelect }) {
  const { bikes } = useBikes();

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 18,
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        width: "100%",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Bikes</h2>

      {(!Array.isArray(bikes) || bikes.length === 0) ? (
        <p>No bikes found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#1b2143" }}>
                {COLS.map((c) => (
                  <th key={c.label} style={{ padding: 8 }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bikes.map((b) => {
                const isActive = b.id === selectedId;
                return (
                  <tr
                    key={b.id}
                    onClick={() => onSelect?.(b.id)}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {COLS.map((c) => (
                      <td
                        key={c.label}
                        style={{
                          padding: 8,
                          fontFamily: "ui-sans-serif, system-ui, sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt(getByLabel(b, c.label), c)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
