import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const STORAGE_KEY = "harbermotorrad:bikes";

// Exported so SelectedBike can reuse when localStorage is empty
export const PREVIEW_BIKES = [
  {
    id: "b-001",
    registration: "YK70 ABC",
    vin: "WB10A123456789000",
    make: "BMW",
    model: "R1250GS",
    mileage: 12450,
    serviceHistory: "full",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "b-002",
    registration: "DA21 XYZ",
    vin: "WB10B987654321000",
    make: "BMW",
    model: "S1000R",
    mileage: 7350,
    serviceHistory: "partial",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: "b-003",
    registration: "PJ19 LMN",
    vin: "JH2SD012345678900",
    make: "Honda",
    model: "CRF1100L Africa Twin",
    mileage: 18200,
    serviceHistory: "none",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

export default function ResultsList({ selectedId, onSelect }) {
  const [params] = useSearchParams();
  const [bikes, setBikes] = useState([]);

  // Helper to read + sort from storage, with preview fallback
  const read = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      if (Array.isArray(data) && data.length > 0) {
        return data
          .slice()
          .sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
      }
      return PREVIEW_BIKES;
    } catch {
      return PREVIEW_BIKES;
    }
  };

  // Load once, then listen for bikes:updated + cross-tab storage changes
  useEffect(() => {
    setBikes(read());

    const handleUpdated = () => setBikes(read());
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) setBikes(read());
    };

    window.addEventListener("bikes:updated", handleUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("bikes:updated", handleUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Read filters from URL params (synced by SearchBar)
  const filters = {
    registration: (params.get("registration") || "").trim().toUpperCase(),
    vin: (params.get("vin") || "").trim().toUpperCase(),
    make: (params.get("make") || "").trim().toLowerCase(),
    model: (params.get("model") || "").trim().toLowerCase(),
    mileageMin: params.get("mileageMin")
      ? Number(params.get("mileageMin"))
      : null,
    mileageMax: params.get("mileageMax")
      ? Number(params.get("mileageMax"))
      : null,
    serviceHistory: (params.get("serviceHistory") || "").trim().toLowerCase(), // "", "full", "partial", "none", "unknown"
  };

  const filtered = useMemo(() => {
    return bikes.filter((b) => {
      const reg = (b.registration || "").toUpperCase();
      const vin = (b.vin || "").toUpperCase();
      const make = (b.make || "").toLowerCase();
      const model = (b.model || "").toLowerCase();
      const mileage = Number(b.mileage ?? NaN);
      const svc = (b.serviceHistory || "").toLowerCase();

      if (filters.registration && !reg.includes(filters.registration))
        return false;
      if (filters.vin && !vin.includes(filters.vin)) return false;
      if (filters.make && !make.includes(filters.make)) return false;
      if (filters.model && !model.includes(filters.model)) return false;
      if (
        filters.mileageMin != null &&
        !Number.isNaN(mileage) &&
        mileage < filters.mileageMin
      )
        return false;
      if (
        filters.mileageMax != null &&
        !Number.isNaN(mileage) &&
        mileage > filters.mileageMax
      )
        return false;
      if (filters.serviceHistory && svc !== filters.serviceHistory) return false;

      return true;
    });
  }, [bikes, filters]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 18,
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        height: "100%",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Bikes</h2>

      {filtered.length === 0 ? (
        <p>No bikes found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ textAlign: "left", background: "#1b2143" }}>
                <th style={{ padding: 8 }}>Reg</th>
                <th style={{ padding: 8 }}>VIN</th>
                <th style={{ padding: 8 }}>Make</th>
                <th style={{ padding: 8 }}>Model</th>
                <th style={{ padding: 8, textAlign: "right" }}>Mileage</th>
                <th style={{ padding: 8 }}>Service History</th>
                <th style={{ padding: 8 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const isActive = selectedId === b.id;
                return (
                  <tr
                    key={b.id}
                    onClick={() => onSelect && onSelect(b.id)}
                    style={{
                      cursor: "pointer",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                    }}
                    aria-selected={isActive}
                  >
                    <td
                      style={{
                        padding: 8,
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    >
                      {b.registration || "-"}
                    </td>
                    <td style={{ padding: 8 }}>
                      {b.vin ? `${b.vin.slice(0, 8)}…` : "-"}
                    </td>
                    <td style={{ padding: 8 }}>{b.make || "-"}</td>
                    <td style={{ padding: 8 }}>{b.model || "-"}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {Number.isFinite(Number(b.mileage))
                        ? Number(b.mileage).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: 8 }}>
                      {prettyService(b.serviceHistory)}
                    </td>
                    <td style={{ padding: 8 }}>
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleString()
                        : "-"}
                    </td>
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

function prettyService(value) {
  const v = (value || "").toLowerCase();
  if (!v) return "-";
  if (v === "full") return "Full";
  if (v === "partial") return "Partial";
  if (v === "none") return "None";
  if (v === "unknown") return "Unknown";
  return value;
}
