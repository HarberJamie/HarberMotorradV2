// src/pages/Bikes/ResultsList.jsx
import React, { useMemo } from "react";
import { useBikes } from "@/lib/bikesStore.js";
import { normalizeKey } from "@/lib/normalizeKey.js";
import { STATUS_TYPES, EVENT_TYPES, toLabel as labelFrom } from "@/lib/enums.js";
import { getFeatureFields } from "@/lib/catalog";

const COLS = [
  { label: "Registration" },
  { label: "Make" },
  { label: "Model" },
  { label: "Trim" },
  { label: "Vin" },
  { label: "Status" },
  { label: "Latest Event" },
  {
    label: "Total Miles",
    fmt: (v) => (isFinite(Number(v)) ? Number(v).toLocaleString() : "–"),
  },
  {
    label: "Price",
    fmt: (v) =>
      v === null || v === undefined || v === "" || isNaN(Number(v))
        ? "–"
        : `£${Number(v).toLocaleString()}`,
  },
  {
    label: "VAT Qualifying",
    fmt: (v) => (typeof v === "boolean" ? (v ? "Yes" : "No") : v ?? "–"),
  },
];

// Fix legacy key naming issues
const KEY_OVERRIDES = {
  preperationCosts: "preparationCosts",
};

// ---------- helpers ----------
const norm = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v);
const lc = (v) => String(v ?? "").toLowerCase();

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const truthyStringToBool = (v) => {
  if (v === true || v === false) return v;
  if (typeof v !== "string") return null;
  const s = v.toLowerCase();
  if (s === "true" || s === "yes") return true;
  if (s === "false" || s === "no") return false;
  return null;
};

// Get a raw field value by column label
function getByLabel(row, label) {
  const k = normalizeKey(label);
  const key = KEY_OVERRIDES[k] || k;
  return row?.[key];
}

// Format for display
function fmt(raw, col) {
  const v = raw ?? (raw === 0 ? 0 : null);
  if (v === null || v === "") return "–";
  if (col?.fmt) return col.fmt(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

// VIN masking helper (list view only)
function maskVin(vin) {
  if (!vin) return "–";
  const s = String(vin);
  return s.length > 7 ? s.slice(-7).toUpperCase() : s.toUpperCase();
}

// Compute display value for each column
function getCell(row, col) {
  switch (col.label) {
    case "Status":
      return labelFrom(STATUS_TYPES, row?.status_id) || row?.status || "–";
    case "Latest Event":
      return labelFrom(EVENT_TYPES, row?.latest_event_id) || row?.latestEvent || "–";
    case "Vin":
      return maskVin(row?.vin || row?.VIN || "");
    default:
      return getByLabel(row, col.label);
  }
}

/* ---------------------- Feature / Spec keyword match ---------------------- */

function getFeatureLabelsForBike(bike) {
  const ids = Array.isArray(bike.features) ? bike.features : [];
  if (!ids.length) return [];

  const options = getFeatureFields(bike.make, bike.model); // [{id,label}]
  const map = new Map(options.map((o) => [o.id, o.label]));
  return ids.map((id) => lc(map.get(id) || id));
}

function getSpecTokensForBike(bike) {
  const out = [];
  const specs = bike?.specs && typeof bike.specs === "object" ? bike.specs : {};

  for (const [key, value] of Object.entries(specs)) {
    if (value === null || value === undefined || value === "") continue;

    const keyPretty = String(key)
      .replace(/[_-]+/g, " ")
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .trim();

    out.push(lc(keyPretty));
    out.push(lc(String(value)));
  }

  return out;
}

function matchesKeyword(bike, keywordQ) {
  if (!keywordQ) return true; // nothing typed
  const q = lc(keywordQ);
  if (!q) return true;

  const core = [
    bike.registration,
    bike.vin,
    bike.VIN,
    bike.make,
    bike.model,
    bike.trim,
    bike.colour,
    bike.color,
    bike.status,
  ].map(lc);

  if (core.some((t) => t.includes(q))) return true;

  const featureLabels = getFeatureLabelsForBike(bike);
  if (featureLabels.some((t) => t.includes(q))) return true;

  const specTokens = getSpecTokensForBike(bike);
  if (specTokens.some((t) => t.includes(q))) return true;

  return false;
}

/**
 * Props:
 *  - selectedId?: string
 *  - onSelect?: (id: string) => void
 *  - filters?: {
 *      registration, vin, make, model,
 *      mileageMin, mileageMax,
 *      status, modelYear,
 *      priceMin, priceMax,
 *      vatQualifying,
 *      keyword
 *    }
 */
export default function ResultsList({ selectedId, onSelect, filters = {} }) {
  const { bikes = [] } = useBikes();

  const filtered = useMemo(() => {
    if (!Array.isArray(bikes) || bikes.length === 0) return [];

    const f = filters || {};

    const regQ = norm(f.registration);
    const vinQ = norm(f.vin);
    const makeQ = norm(f.make);
    const modelQ = norm(f.model);
    const keywordQ =
      typeof f.keyword === "string" && f.keyword.trim().length > 0
        ? f.keyword.trim()
        : "";

    const mileageMin = toNum(f.mileageMin);
    const mileageMax = toNum(f.mileageMax);
    const priceMin = toNum(f.priceMin);
    const priceMax = toNum(f.priceMax);

    // Default behaviour: show Available bikes unless user selects another status
    const statusQ = f.status === null || f.status === "" ? "Available" : f.status;
    const modelYearQ = toNum(f.modelYear);
    const vatQ = truthyStringToBool(f.vatQualifying); // null = any

    const statusMatches = (b) => {
      if (statusQ === "Any") return true;
      const byId = String(b.status_id ?? "").toLowerCase();
      const byLabel = (labelFrom(STATUS_TYPES, b.status_id) || b.status || "").toLowerCase();
      const want = String(statusQ).toLowerCase();
      return byId === want || byLabel === want;
    };

    return bikes.filter((b) => {
      const bReg = norm(b.registration || "");
      const bVin = norm(b.vin || b.VIN || "");
      const bMake = norm(b.make || "");
      const bModel = norm(b.model || "");

      const bMiles = toNum(b.totalMiles ?? b.mileage ?? b.odometer);
      const bPrice = toNum(b.price);
      const bYear = toNum(b.modelYear ?? b.year);

      const bVat =
        typeof b.vatQualifying === "boolean"
          ? b.vatQualifying
          : typeof b.vat === "boolean"
          ? b.vat
          : null;

      // Keyword match (includes features & specs)
      if (!matchesKeyword(b, keywordQ)) return false;

      // Registration / VIN contains
      if (regQ && !bReg?.includes(regQ)) return false;
      if (vinQ && !(bVin?.includes(vinQ) || bVin?.endsWith(vinQ))) return false;

      // Make / Model contains
      if (makeQ && !bMake?.includes(makeQ)) return false;
      if (modelQ && !bModel?.includes(modelQ)) return false;

      // Status (default = Available)
      if (!statusMatches(b)) return false;

      // Model Year exact
      if (modelYearQ !== null && modelYearQ !== undefined) {
        if (bYear !== modelYearQ) return false;
      }

      // Mileage band
      if (mileageMin !== null && bMiles !== null && bMiles < mileageMin) return false;
      if (mileageMax !== null && bMiles !== null && bMiles > mileageMax) return false;

      // Price band
      if (priceMin !== null && bPrice !== null && bPrice < priceMin) return false;
      if (priceMax !== null && bPrice !== null && bPrice > priceMax) return false;

      // VAT qualifying
      if (vatQ !== null && bVat !== null && bVat !== vatQ) return false;

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
        width: "100%",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Bikes</h2>

      {!Array.isArray(filtered) || filtered.length === 0 ? (
        <p>No bikes match the current filters.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#1b2143" }}>
                {COLS.map((c) => (
                  <th key={c.label} style={{ padding: 8 }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const isActive = (b.id || b.vin) === selectedId;
                return (
                  <tr
                    key={b.id || b.vin}
                    onClick={() => onSelect?.(b.id || b.vin)}
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
                        {fmt(getCell(b, c), c)}
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
