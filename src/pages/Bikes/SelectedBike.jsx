// src/pages/Bikes/SelectedBike.jsx
import React, { useEffect, useMemo, useState } from "react";

const BIKES_STORAGE_KEY = "harbermotorrad:bikes";

function getBikes() {
  try {
    return JSON.parse(localStorage.getItem(BIKES_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export default function SelectedBike({ id, onClose }) {
  const [bikes, setBikes] = useState(getBikes());

  useEffect(() => {
    const onUpdate = (e) => setBikes(e.detail);
    window.addEventListener("bikes:updated", onUpdate);
    return () => window.removeEventListener("bikes:updated", onUpdate);
  }, []);

  const bike = useMemo(() => bikes.find((b) => b.id === id), [bikes, id]);

  // Readable colors on a WHITE modal panel
  const textColor = "#111827"; // slate-900
  const subText = "#374151";   // slate-700
  const borderLight = "rgba(0,0,0,0.08)";
  const headerBg = "#1b2143";
  const headerFg = "#ffffff";

  const boxStyle = {
    background: "transparent",
    border: `1px solid ${borderLight}`,
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    color: textColor,
  };
  const thTdPad = { padding: 8, color: textColor };
  const headerRowStyle = { textAlign: "left", background: headerBg, color: headerFg };
  const rowBorder = { borderTop: `1px solid ${borderLight}` };

  if (!id) {
    return (
      <div style={boxStyle}>
        <h2 style={{ marginBottom: 12, color: textColor }}>Bike details</h2>
        <p style={{ color: subText }}>No bike selected.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: `1px solid ${borderLight}`,
              color: textColor,
              background: "transparent",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div style={boxStyle}>
        <h2 style={{ marginBottom: 12, color: textColor }}>Bike details</h2>
        <p style={{ color: subText }}>We couldn’t find that bike.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: `1px solid ${borderLight}`,
              color: textColor,
              background: "transparent",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const {
    make,
    model,
    year,
    registration,
    vin,
    mileage,
    colour,
    notes,
    createdAt,
  } = bike;

  const title = [make, model].filter(Boolean).join(" ") || "Untitled";
  const created = createdAt ? new Date(createdAt).toLocaleString() : "-";
  const reg = registration ? String(registration).toUpperCase() : "-";
  const vinTail = vin ? `…${String(vin).slice(-6).toUpperCase()}` : "-";
  const mileageStr =
    mileage !== undefined && mileage !== null && String(mileage) !== ""
      ? `${Number(mileage).toLocaleString()} mi`
      : "-";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Overview card */}
      <div style={boxStyle}>
        <h2 style={{ margin: 0, marginBottom: 12, color: textColor }}>Bike details</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={{ ...thTdPad, color: headerFg }}>Created</th>
                <th style={{ ...thTdPad, color: headerFg }}>Make / Model</th>
                <th style={{ ...thTdPad, color: headerFg }}>Registration</th>
                <th style={{ ...thTdPad, color: headerFg }}>VIN</th>
                <th style={{ ...thTdPad, color: headerFg }}>Mileage</th>
              </tr>
            </thead>
            <tbody>
              <tr style={rowBorder}>
                <td style={thTdPad}>{created}</td>
                <td style={thTdPad}>{title}</td>
                <td style={thTdPad}>{reg}</td>
                <td style={thTdPad}>{vinTail}</td>
                <td style={thTdPad}>{mileageStr}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Details card */}
      <div style={boxStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 16, color: textColor }}>Details</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={{ ...thTdPad, color: headerFg }}>Field</th>
                <th style={{ ...thTdPad, color: headerFg }}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr style={rowBorder}>
                <td style={{ ...thTdPad, color: subText }}>Year</td>
                <td style={thTdPad}>{year || "—"}</td>
              </tr>
              <tr style={rowBorder}>
                <td style={{ ...thTdPad, color: subText }}>Colour</td>
                <td style={thTdPad}>{colour || "—"}</td>
              </tr>
              <tr style={rowBorder}>
                <td style={{ ...thTdPad, color: subText }}>Full VIN</td>
                <td style={thTdPad}>{vin || "—"}</td>
              </tr>
              <tr style={rowBorder}>
                <td style={{ ...thTdPad, color: subText }}>Registration</td>
                <td style={thTdPad}>{reg}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes card */}
      <div style={boxStyle}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16, color: textColor }}>Notes</h3>
        <div
          style={{
            border: `1px solid ${borderLight}`,
            borderRadius: 12,
            padding: 12,
            minHeight: 60,
            whiteSpace: "pre-wrap",
            fontSize: 14,
            color: textColor,
          }}
        >
          {notes || "—"}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: `1px solid ${borderLight}`,
              color: textColor,
              background: "transparent",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
