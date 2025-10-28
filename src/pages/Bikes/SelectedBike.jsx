import React, { useEffect, useState } from "react";
import { PREVIEW_BIKES } from "./ResultsList.jsx";

const STORAGE_KEY = "harbermotorrad:bikes";

export default function SelectedBike({ bikeId }) {
  const [bike, setBike] = useState(null);

  useEffect(() => {
    if (!bikeId) {
      setBike(null);
      return;
    }

    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const source = Array.isArray(data) && data.length ? data : PREVIEW_BIKES;
      const found = source.find((b) => b.id === bikeId) || null;
      setBike(found);
    } catch {
      const found = PREVIEW_BIKES.find((b) => b.id === bikeId) || null;
      setBike(found);
    }
  }, [bikeId]);

  if (!bike) {
    return (
      <div className="text-sm text-gray-600 bg-white rounded-2xl shadow p-6">
        No bike selected or not found.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 18,
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>{bike.make || "-"} {bike.model || "-"}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Registration" value={bike.registration || "-"} mono />
        <Field label="VIN" value={bike.vin ? `${bike.vin}` : "-"} mono />
        <Field label="Mileage" value={Number.isFinite(Number(bike.mileage)) ? Number(bike.mileage).toLocaleString() : "-"} />
        <Field label="Service History" value={prettyService(bike.serviceHistory)} />
        <Field label="Created" value={bike.createdAt ? new Date(bike.createdAt).toLocaleString() : "-"} />
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div style={{ fontWeight: 600, fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit" }}>
        {value}
      </div>
    </div>
  );
}

function prettyService(value) {
  const v = (value || "").toLowerCase();
  if (!v) return "-";
  if (v === "full") return "Full";
  if (v === "partial") return "Partial";
  if (v === "none") return "None";
  if (v === "unknown") return "Unknown";
  return value;
}
