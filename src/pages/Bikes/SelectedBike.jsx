// src/pages/Bikes/SelectedBike.jsx
import React, { useMemo, useState } from "react";
import TabsHeader from "@/pages/TabsHeader.jsx";
import { normalizeKey } from "@/lib/normalizeKey.js";
import { STATUS_TYPES, EVENT_TYPES, toLabel as labelFrom } from "@/lib/enums.js";
import { getFeatureFields } from "@/lib/catalog";

/** ---------------------- Field Lists (Display Order) ---------------------- **/
const DETAILS_FIELDS = [
  "Registration",
  "Make",
  "Model",
  "Trim",
  "Vin",

  // New split fields
  "Status",
  "Latest Event",

  "Model Type",
  "Reg Date",
  "Previous Owners",
  "Site",
  "Stock Number",
  "In stock",
  "Days in Stock",
  "Total Miles",
  "Price",
  "Preparation Costs",
  "VAT Qualifying",
  "AUB Expiry",
  "MOT Expiry",
  "HPI Date",
  "Fuel Level (Miles Remaining)",
  "Progress Code",
  "Specification",
  "Notes",
];

const HISTORY_FIELDS = [
  "Registration",
  "Make",
  "Model",
  "Trim",
  "Vin",

  // New split fields
  "Status",
  "Latest Event",

  "Model Type",
  "Reg Date",
  "Total Miles",
  "Preparation Costs",

  // Transitional flat fields (timeline will replace later)
  "Event Type",
  "Event Date",

  "Specification",
  "Notes",
  "Valuation Date",
  "Valuation Price",
  "Sale Date",
  "Sale Price",
  "Events",
  "Average Sale",
  "Average Prep Costs",
];

/** ---------------------------- Key Normalization --------------------------- **/
const KEY_OVERRIDES = {
  preperationCosts: "preparationCosts", // fix historical typo
  fuelLevelMilesRemaining: "fuelMilesRemaining",
  statusEvent: "status", // legacy fallback if any old records used "Status (Event)"
};

// Safely pick a displayable label for Status/Latest Event
function statusLabel(obj) {
  // prefer enums mapping if an id is present
  const fromId = labelFrom(STATUS_TYPES, obj?.status_id);
  if (fromId) return fromId;

  // fallback to raw "status" string if stored (e.g., "inbound", "live")
  if (obj?.status) {
    const s = String(obj.status);
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
  }
  return "–";
}
function latestEventLabel(obj) {
  const fromId = labelFrom(EVENT_TYPES, obj?.latest_event_id);
  if (fromId) return fromId;

  // common fallbacks if you store latest event object or string
  if (obj?.latest_event_label) return obj.latest_event_label;
  if (obj?.latest_event?.type) return String(obj.latest_event.type).replace(/_/g, " ");
  return "–";
}

function getRaw(obj, label) {
  if (label === "Status") return statusLabel(obj);
  if (label === "Latest Event") return latestEventLabel(obj);

  const k = normalizeKey(label);
  const dataKey = KEY_OVERRIDES[k] || k;
  return obj?.[dataKey];
}

function formatValue(label, v) {
  if (v === null || v === undefined || v === "") return "–";
  if (typeof v === "boolean") return v ? "Yes" : "No";

  const asNum = Number(v);
  const isNum = !Number.isNaN(asNum);

  if (label === "Total Miles" && isNum) return asNum.toLocaleString();
  if (label === "Price" && isNum) return `£${asNum.toLocaleString()}`;
  if (label === "Valuation Price" && isNum) return `£${asNum.toLocaleString()}`;
  if (label === "Sale Price" && isNum) return `£${asNum.toLocaleString()}`;
  if (label === "Preparation Costs" && isNum) return `£${asNum.toLocaleString()}`;
  if (label === "Days in Stock" && isNum) return asNum.toLocaleString();

  return String(v);
}

/** ----------------------------- Grid Presenter ---------------------------- **/
function FieldGrid({ fields, data }) {
  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  };

  const card = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "10px 12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    minHeight: 56,
  };

  const label = {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  };

  const value = {
    fontSize: 14,
    color: "rgba(255,255,255,0.98)",
    wordBreak: "break-word",
    whiteSpace: "normal",
    lineHeight: 1.4,
  };

  const responsive = (
    <style>{`
      @media (max-width: 900px) {
        .selected-bike__grid {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  );

  return (
    <>
      {responsive}
      <div className="selected-bike__grid" style={grid}>
        {fields.map((labelText) => (
          <div key={labelText} style={card}>
            <div style={label}>{labelText}</div>
            <div style={value}>{formatValue(labelText, getRaw(data, labelText))}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/** ---------------------------- Chips Presenter ---------------------------- **/
function Chips({ items, emptyText = "None recorded." }) {
  const wrap = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  };
  const chip = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    padding: "6px 10px",
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
  };
  if (!items || items.length === 0) {
    return <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{emptyText}</div>;
  }
  return (
    <div style={wrap}>
      {items.map((it) => (
        <span key={it.key || it.id || it.label} style={chip} title={it.title || it.id || it.label}>
          {it.label}
          {it.sublabel ? <span style={{ opacity: 0.75, marginLeft: 6 }}>· {it.sublabel}</span> : null}
        </span>
      ))}
    </div>
  );
}

/** --------------------------------- Main ---------------------------------- **/
export default function SelectedBike({ bike }) {
  const [active, setActive] = useState("details");
  if (!bike) return <div>No bike selected</div>;

  const registration = useMemo(() => bike.registration || "–", [bike]);

  // Resolve feature labels from the dynamic catalog for THIS bike's make/model
  const featureOptions = useMemo(
    () => getFeatureFields(bike.make, bike.model), // [{id,label}]
    [bike.make, bike.model]
  );
  const featureMap = useMemo(() => {
    const m = new Map();
    featureOptions.forEach((o) => m.set(o.id, o.label));
    return m;
  }, [featureOptions]);

  const featureChips = useMemo(() => {
    const ids = Array.isArray(bike.features) ? bike.features : [];
    return ids.map((id) => ({ id, label: featureMap.get(id) || id }));
  }, [bike.features, featureMap]);

  // Turn specs object into chips like "Ride Modes · Pro"
  const specChips = useMemo(() => {
    const s = bike?.specs && typeof bike.specs === "object" ? bike.specs : {};
    return Object.entries(s).map(([k, v]) => ({
      key: k,
      label: prettyLabel(k),
      sublabel: String(v),
      title: `${k}: ${v}`,
    }));
  }, [bike?.specs]);

  const tabs = [
    { id: "details", label: "Details" },
    { id: "history", label: "History" },
  ];

  const header = { marginBottom: 8 };
  const titleStyle = { fontSize: 22, fontWeight: 700, margin: 0, color: "#0b1228" };

  const darkPanel = {
    marginTop: 12,
    background: "linear-gradient(180deg, #0e1330 0%, #0b1028 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  };

  const sectionTitle = {
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 10,
  };

  return (
    <div className="selected-bike" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="selected-bike-header" style={header}>
        <h2 style={titleStyle}>{registration}</h2>
      </div>

      <TabsHeader tabs={tabs} active={active} onChange={setActive} />

      <div style={darkPanel}>
        <div id="panel-details" hidden={active !== "details"}>
          {/* Features */}
          <div style={{ marginBottom: 16 }}>
            <div style={sectionTitle}>Features</div>
            <Chips items={featureChips} emptyText="No features recorded." />
          </div>

          {/* Specs */}
          {specChips.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={sectionTitle}>Specifications</div>
              <Chips items={specChips} />
            </div>
          )}

          <FieldGrid fields={DETAILS_FIELDS} data={bike} />
        </div>

        <div id="panel-history" hidden={active !== "history"}>
          <FieldGrid fields={HISTORY_FIELDS} data={bike} />
        </div>
      </div>
    </div>
  );
}

/** ------------------------------- helpers --------------------------------- **/
function prettyLabel(key) {
  // convert snake/camel/kebab to "Title Case"
  const s = String(key || "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
