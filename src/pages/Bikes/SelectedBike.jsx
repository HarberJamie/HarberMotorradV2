import React, { useMemo, useState } from "react";
import TabsHeader from "@/pages/TabsHeader.jsx";
import { normalizeKey } from "@/lib/normalizeKey.js";

// Display order from your spreadsheet
const DETAILS_FIELDS = [
  "Registration","Make","Model","Trim","Vin","Status (Event)","Model Type","Reg Date",
  "Previous Owners","Site","Stock Number","In stock","Days in Stock","Total Miles","Price",
  "Preperation Costs","VAT Qualifying","AUB Expiry","MOT Expiry","HPI Date",
  "Fuel Level (Miles Remaining)","Progress Code","Specification","Notes",
];

const HISTORY_FIELDS = [
  "Registration","Make","Model","Trim","Vin","Status (Event)","Model Type","Reg Date",
  "Total Miles","Preperation Costs","Event Type","Event Date","Specification","Notes",
  "Valuation Date","Valuation Price","Sale Date","Sale Price","Events","Average Sale","Average Prep Costs",
];

// Fix any normalized label that differs from your stored key
const KEY_OVERRIDES = {
  preperationCosts: "preparationCosts",
  fuelLevelMilesRemaining: "fuelMilesRemaining",
};

function getValueByLabel(obj, label) {
  const k = normalizeKey(label);
  const dataKey = KEY_OVERRIDES[k] || k;
  return obj?.[dataKey];
}

function formatValue(v) {
  if (v === null || v === undefined || v === "") return "–";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

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
            <div style={value}>{formatValue(getValueByLabel(data, labelText))}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function SelectedBike({ bike }) {
  const [active, setActive] = useState("details");
  if (!bike) return <div>No bike selected</div>;

  // Header now shows only registration
  const registration = useMemo(() => bike.registration || "–", [bike]);

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

  return (
    <div className="selected-bike" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="selected-bike-header" style={header}>
        <h2 style={titleStyle}>{registration}</h2>
      </div>

      <TabsHeader tabs={tabs} active={active} onChange={setActive} />

      <div style={darkPanel}>
        <div id="panel-details" hidden={active !== "details"}>
          <FieldGrid fields={DETAILS_FIELDS} data={bike} />
        </div>

        <div id="panel-history" hidden={active !== "history"}>
          <FieldGrid fields={HISTORY_FIELDS} data={bike} />
        </div>
      </div>
    </div>
  );
}
