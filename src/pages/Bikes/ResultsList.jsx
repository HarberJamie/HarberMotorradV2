// src/pages/Bikes/ResultsList.jsx
import React, { useMemo } from "react";

export default function ResultsList({ bikes = [], selectedId, onSelect }) {
  const rows = useMemo(() => {
    // Newest first like Deals.jsx
    return [...bikes].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [bikes]);

  const boxStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  };

  const thTdPad = { padding: 8 };
  const headerRowStyle = { textAlign: "left", background: "#1b2143" };
  const rowBorder = { borderTop: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div style={boxStyle}>
      <h2 style={{ marginBottom: 12 }}>Bikes</h2>

      {rows.length === 0 ? (
        <p>No bikes yet. Add one via “+ Add Bike”.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={thTdPad}>ID</th>
                <th style={thTdPad}>Created</th>
                <th style={thTdPad}>Make / Model</th>
                <th style={thTdPad}>Registration</th>
                <th style={thTdPad}>VIN</th>
                <th style={thTdPad}>Mileage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const isActive = selectedId === b.id;
                const vinTail = b.vin ? `…${String(b.vin).slice(-6).toUpperCase()}` : "-";
                const reg = b.registration ? String(b.registration).toUpperCase() : "-";
                const title = [b.make, b.model].filter(Boolean).join(" ") || "Untitled";
                const created = b.createdAt ? new Date(b.createdAt).toLocaleString() : "-";
                const mileage =
                  b.mileage !== undefined && b.mileage !== null && b.mileage !== ""
                    ? `${Number(b.mileage).toLocaleString()} mi`
                    : "-";

                return (
                  <tr
                    key={b.id}
                    style={{
                      ...rowBorder,
                      background: isActive ? "rgba(255,255,255,0.06)" : undefined,
                      cursor: "pointer",
                      // kill any default outlines from user agents
                      outline: "none",
                      boxShadow: "none",
                    }}
                    onClick={() => onSelect?.(b.id)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <td style={{ ...thTdPad, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                      {b.id ? `${String(b.id).slice(0, 8)}…` : "-"}
                    </td>
                    <td style={thTdPad}>{created}</td>
                    <td style={thTdPad}>{title}</td>
                    <td style={thTdPad}>{reg}</td>
                    <td style={thTdPad}>{vinTail}</td>
                    <td style={thTdPad}>{mileage}</td>
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
