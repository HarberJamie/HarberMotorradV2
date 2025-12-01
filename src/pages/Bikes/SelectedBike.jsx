// src/pages/Bikes/SelectedBike.jsx
import React, { useMemo, useState, useEffect } from "react";
import TabsHeader from "@/pages/TabsHeader.jsx";
import { useBikes } from "@/lib/bikesStore.js";
import { normalizeKey } from "@/lib/normalizeKey.js";
import { STATUS_TYPES, EVENT_TYPES, toLabel as labelFrom } from "@/lib/enums.js";
import { getFeatureFields, getSpecFields } from "@/lib/catalog";

/** ---------------------- Field Lists (Display Order) ---------------------- **/
// NOTE: "Reg Date" renamed to "Date of Registration"
//       New field added: "Advertising Grabber"
const DETAILS_FIELDS = [
  "Registration",
  "Make",
  "Model",
  "Trim",
  "Vin",

  "Status",
  "Latest Event",

  "Model Type",
  "Date of Registration",
  "Previous Owners",
  "Site",
  "Stock Number",
  "In stock",
  "Days in Stock",
  "Total Miles",
  "Price",

  "Buy In Price",
  "Source",

  "Preparation Costs",
  "VAT Qualifying",
  "AUB Expiry",
  "MOT Expiry",
  "HPI Date",
  "Fuel Level (Miles Remaining)",
  "Progress Code",
  "Specification",
  "Advertising Grabber",
  "Notes",
];

/** ---------------------------- Key Normalization --------------------------- **/
// Keys on the LEFT must match normalizeKey(label) output.
const KEY_OVERRIDES = {
  // "Date of Registration" label -> underlying regDate field
  "date-of-registration": "regDate",

  // "Preparation Costs" label -> preparationCosts field
  "preparation-costs": "preparationCosts",

  // "Fuel Level (Miles Remaining)" label -> fuelMilesRemaining field
  "fuel-level-miles-remaining": "fuelMilesRemaining",

  // "In stock" label -> inStock boolean
  "in-stock": "inStock",

  // From backend JSON:
  "model-year": "modelYear",
  "total-miles": "mileage",
  "vat-qualifying": "vatQualifying",
  "mot-expiry": "motExpiry",
};

// Example source list – keep aligned with PX form
const SOURCE_OPTIONS = [
  { value: "", label: "— Select source —" },
  { value: "retail_part_exchange", label: "Retail Part Exchange" },
  { value: "trade_purchase", label: "Trade Purchase" },
  { value: "auction", label: "Auction" },
  { value: "demo", label: "Demo / Ex-Demo" },
  { value: "internal_transfer", label: "Internal Transfer" },
  { value: "other", label: "Other" },
];

/** -------------------------- Status / Events Utils ------------------------ **/

function statusLabel(obj) {
  if (!obj) return "–";

  if (obj.status_id) {
    const fromEnum = labelFrom(STATUS_TYPES, obj.status_id);
    if (fromEnum) return fromEnum;
    return String(obj.status_id);
  }

  if (obj.status) {
    return String(obj.status);
  }

  return "–";
}

function prettyLabel(key) {
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

function eventLabel(ev) {
  if (ev?.type_id) {
    const fromEnum = labelFrom(EVENT_TYPES, ev.type_id);
    if (fromEnum) return fromEnum;
  }
  if (ev?.type) return prettyLabel(ev.type);
  if (ev?.label) return ev.label;
  return "Event";
}

/** ------------------------ Days in Stock from History --------------------- **/

function normaliseEventDate(ev) {
  const raw = ev?.date || ev?.occurredAt || ev?.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Derive days in stock from the bike's event history.
// - Start: first Listing / Available / stock_in event
// - End:   Sold / Sale event date, or "today" if still in stock
function computeDaysInStockFromHistory(events, inStockFlag, status) {
  if (!Array.isArray(events) || events.length === 0) return null;

  // Oldest → newest
  const sorted = [...events].sort((a, b) => {
    const ad = normaliseEventDate(a)?.getTime() ?? 0;
    const bd = normaliseEventDate(b)?.getTime() ?? 0;
    return ad - bd;
  });

  let availableDate = null;
  let soldDate = null;

  for (const ev of sorted) {
    const d = normaliseEventDate(ev);
    if (!d) continue;

    const type = String(ev.type || ev.label || "")
      .toLowerCase()
      .trim();

    // When did it first become "in stock"?
    if (
      !availableDate &&
      (type === "listing" || type === "available" || type === "stock_in")
    ) {
      availableDate = d;
    }

    // When was it sold / taken out of stock?
    if (type === "sale" || type === "sold") {
      soldDate = d;
    }
  }

  if (!availableDate) return null;

  const statusStr = String(status || "").toLowerCase();
  const isCurrentlyInStock = inStockFlag !== false && statusStr !== "sold";

  const endDate =
    !isCurrentlyInStock && soldDate ? soldDate : new Date();

  const startUTC = Date.UTC(
    availableDate.getFullYear(),
    availableDate.getMonth(),
    availableDate.getDate()
  );
  const endUTC = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  const diffMs = endUTC - startUTC;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days < 0 ? 0 : days;
}

/** ------------------------- Generic field accessors ----------------------- **/

function getRaw(obj, label) {
  if (!obj) return null;

  if (label === "Status") return statusLabel(obj);

  if (label === "Latest Event") {
    // Use the precomputed label we attach in SelectedBike
    return obj.latestEventLabel ?? "–";
  }

  if (label === "Days in Stock") {
    return obj.daysInStock ?? null;
  }

  // acquisition-specific fields
  if (label === "Buy In Price") return obj?.acquisition?.buyInPrice;
  if (label === "Source") return obj?.acquisition?.source;

  const k = normalizeKey(label); // e.g. "Date of Registration" -> "date-of-registration"
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
  if (label === "Buy In Price" && isNum) return `£${asNum.toLocaleString()}`;
  if (label === "Preparation Costs" && isNum) return `£${asNum.toLocaleString()}`;
  if (label === "Days in Stock" && isNum) return asNum.toLocaleString();

  return String(v);
}

/** ----------------------------- Grid Presenter ---------------------------- **/
function FieldGrid({ fields, data, onOpenSpecEditor }) {
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
            <div style={value}>
              {labelText === "Specification" &&
              typeof onOpenSpecEditor === "function" ? (
                <button
                  type="button"
                  onClick={onOpenSpecEditor}
                  className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-900 hover:bg-white"
                >
                  Open spec editor
                </button>
              ) : (
                formatValue(labelText, getRaw(data, labelText))
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** ------------------------ Editable Grid Presenter ------------------------ **/
function EditableFieldGrid({ fields, data, onChange, onOpenSpecEditor }) {
  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  };

  const card = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
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
    fontSize: 13,
    color: "rgba(255,255,255,0.98)",
    wordBreak: "break-word",
    whiteSpace: "normal",
    lineHeight: 1.4,
  };

  const inputBase = {
    width: "100%",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.24)",
    background: "rgba(5,7,24,0.85)",
    padding: "6px 8px",
    fontSize: 13,
    color: "rgba(255,255,255,0.98)",
    outline: "none",
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

  // Read-only in the editor
  const readOnlyFields = new Set(["Latest Event", "Model Type", "Days in Stock"]);

  // Boolean dropdowns
  const booleanFields = new Set(["VAT Qualifying", "In stock"]);

  // Date fields with calendar picker
  const dateFields = new Set([
    "Date of Registration",
    "AUB Expiry",
    "MOT Expiry",
    "HPI Date",
  ]);

  // Derive the currently selected status id for the dropdown
  const currentStatusId = useMemo(() => {
    if (!data) return "";
    if (data.status_id && STATUS_TYPES.some((s) => s.id === data.status_id)) {
      return data.status_id;
    }
    if (data.status && STATUS_TYPES.some((s) => s.id === data.status)) {
      return data.status;
    }
    if (data.status) {
      const labelStr = String(data.status).toLowerCase();
      const match = STATUS_TYPES.find(
        (s) => s.label.toLowerCase() === labelStr
      );
      if (match) return match.id;
    }
    return "";
  }, [data]);

  return (
    <>
      {responsive}
      <div className="selected-bike__grid" style={grid}>
        {fields.map((labelText) => {
          const raw = getRaw(data, labelText);
          const isReadOnly = readOnlyFields.has(labelText);
          const isBooleanField = booleanFields.has(labelText);
          const isDateField = dateFields.has(labelText);

          const boolRaw =
            typeof raw === "boolean"
              ? raw
              : raw === "Yes"
              ? true
              : raw === "No"
              ? false
              : null;

          return (
            <div key={labelText} style={card}>
              <div style={label}>{labelText}</div>
              <div style={value}>
                {isReadOnly ? (
                  <span style={{ opacity: 0.8 }}>
                    {formatValue(labelText, raw)}
                  </span>
                ) : labelText === "Specification" &&
                  typeof onOpenSpecEditor === "function" ? (
                  <button
                    type="button"
                    onClick={onOpenSpecEditor}
                    className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-900 hover:bg-white"
                  >
                    Open spec editor
                  </button>
                ) : labelText === "Notes" ? (
                  <textarea
                    style={{ ...inputBase, resize: "vertical", minHeight: 60 }}
                    value={raw ?? ""}
                    onChange={(e) => onChange(labelText, e.target.value)}
                  />
                ) : labelText === "Status" ? (
                  <select
                    style={inputBase}
                    value={currentStatusId}
                    onChange={(e) => onChange(labelText, e.target.value || null)}
                  >
                    <option value="">— Select status —</option>
                    {STATUS_TYPES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : labelText === "Source" ? (
                  <select
                    style={inputBase}
                    value={raw ?? ""}
                    onChange={(e) => onChange(labelText, e.target.value)}
                  >
                    {SOURCE_OPTIONS.map((opt) => (
                      <option key={opt.value || "empty"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : isBooleanField ? (
                  <select
                    style={inputBase}
                    value={boolRaw === null ? "" : boolRaw ? "yes" : "no"}
                    onChange={(e) => {
                      const v =
                        e.target.value === ""
                          ? null
                          : e.target.value === "yes";
                      onChange(labelText, v);
                    }}
                  >
                    <option value="">–</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                ) : isDateField ? (
                  <input
                    type="date"
                    style={inputBase}
                    value={raw ?? ""}
                    onChange={(e) => onChange(labelText, e.target.value)}
                  />
                ) : (
                  <input
                    style={inputBase}
                    value={raw ?? ""}
                    onChange={(e) => onChange(labelText, e.target.value)}
                  />
                )}
              </div>
            </div>
          );
        })}
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
    return (
      <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
        {emptyText}
      </div>
    );
  }
  return (
    <div style={wrap}>
      {items.map((it) => (
        <span
          key={it.key || it.id || it.label}
          style={chip}
          title={it.title || it.id || it.label}
        >
          {it.label}
          {it.sublabel ? (
            <span style={{ opacity: 0.75, marginLeft: 6 }}>
              · {it.sublabel}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

/** ---------------------------- Spec Editor Modal -------------------------- **/
function SpecEditorModal({
  open,
  onClose,
  featureOptions,
  specFieldDefs,
  initialFeatures,
  initialSpecs,
  onSave,
}) {
  const [features, setFeatures] = useState(() => initialFeatures || []);
  const [specs, setSpecs] = useState(() => initialSpecs || {});

  // Keep in sync if bike/draft changes while modal is open
  useEffect(() => {
    setFeatures(initialFeatures || []);
  }, [initialFeatures]);
  useEffect(() => {
    setSpecs(initialSpecs || {});
  }, [initialSpecs]);

  if (!open) return null;

  const toggleFeature = (id) => {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleSpec = (id) => {
    setSpecs((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = "Yes"; // value used for chips
      }
      return next;
    });
  };

  const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  };

  const panel = {
    width: "min(900px, 96vw)",
    maxHeight: "90vh",
    background: "#050716",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const header = {
    padding: "12px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const body = {
    padding: 16,
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  };

  const sectionTitle = {
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  };

  const listWrap = {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(10,14,40,0.95)",
    padding: 10,
    maxHeight: "60vh",
    overflowY: "auto",
  };

  const itemRow = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 2px",
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
  };

  const footer = {
    padding: "10px 16px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  };

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={header}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "white",
            }}
          >
            Edit Specification & Features
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <div style={body}>
          {/* Features column */}
          <div>
            <div style={sectionTitle}>Features</div>
            <div style={listWrap}>
              {featureOptions.length === 0 ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  No feature definitions found for this model.
                </div>
              ) : (
                featureOptions.map((f) => (
                  <label key={f.id} style={itemRow}>
                    <input
                      type="checkbox"
                      checked={features.includes(f.id)}
                      onChange={() => toggleFeature(f.id)}
                      style={{ accentColor: "#22c55e" }}
                    />
                    <span>{f.label}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Specs column */}
          <div>
            <div style={sectionTitle}>Specifications</div>
            <div style={listWrap}>
              {specFieldDefs.length === 0 ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  No spec definitions found for this model.
                </div>
              ) : (
                specFieldDefs.map((s) => (
                  <label key={s.id} style={itemRow}>
                    <input
                      type="checkbox"
                      checked={Boolean(specs[s.id])}
                      onChange={() => toggleSpec(s.id)}
                      style={{ accentColor: "#22c55e" }}
                    />
                    <span>{s.label}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={footer}>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs rounded-md bg-slate-200 text-slate-900 hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ features, specs })}
            className="px-3 py-1 text-xs rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Save spec & features
          </button>
        </div>
      </div>
    </div>
  );
}

/** -------------------------- History Table (NEW) -------------------------- **/
function formatEventDate(ev) {
  const raw = ev?.date || ev?.occurredAt || ev?.createdAt;
  if (!raw) return "–";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatEventMileage(ev) {
  const m =
    ev?.mileage ??
    ev?.odometer ??
    ev?.totalMilesAtEvent ??
    ev?.total_miles_at_event;
  if (m === null || m === undefined || m === "") return "–";
  const asNum = Number(m);
  if (Number.isNaN(asNum)) return String(m);
  return `${asNum.toLocaleString()} mi`;
}

function formatEventAmount(ev) {
  const raw =
    ev?.amount ??
    ev?.price ??
    ev?.valuation ??
    ev?.valuationPrice ??
    ev?.salePrice ??
    ev?.preparationCosts ??
    ev?.prepCost ??
    ev?.cost;
  if (raw === null || raw === undefined || raw === "") return "–";
  const asNum = Number(raw);
  if (Number.isNaN(asNum)) return String(raw);
  return `£${asNum.toLocaleString()}`;
}

function HistoryTable({ events }) {
  if (!events || events.length === 0) {
    return (
      <div
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        No history recorded for this bike yet.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ color: "rgba(255,255,255,0.7)", textAlign: "left" }}>
            <th
              style={{
                padding: "8px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Event
            </th>
            <th
              style={{
                padding: "8px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Date
            </th>
            <th
              style={{
                padding: "8px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Mileage
            </th>
            <th
              style={{
                padding: "8px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev, idx) => (
            <tr
              key={ev.id || idx}
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <td
                style={{
                  padding: "6px 10px",
                  color: "rgba(255,255,255,0.98)",
                }}
              >
                {eventLabel(ev)}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {formatEventDate(ev)}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {formatEventMileage(ev)}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {formatEventAmount(ev)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** --------------------------------- Main ---------------------------------- **/
export default function SelectedBike({ bike, events: eventsProp = [] }) {
  const { updateBike } = useBikes();
  const [active, setActive] = useState("details");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(bike);
  const [specEditorOpen, setSpecEditorOpen] = useState(false);

  useEffect(() => {
    setDraft(bike);
    setEditing(false);
    setSpecEditorOpen(false);
  }, [bike]);

  if (!bike) return <div>No bike selected</div>;

  const registration = useMemo(() => bike.registration || "–", [bike]);

  // Events: prefer explicit eventsProp if it has data, otherwise fall back to bike.events
  const historyEvents = useMemo(() => {
    const explicit =
      Array.isArray(eventsProp) && eventsProp.length > 0 ? eventsProp : null;
    const base = explicit
      ? explicit
      : Array.isArray(bike.events)
      ? bike.events
      : [];
    return [...base].sort((a, b) => {
      const ad = new Date(
        a.date || a.occurredAt || a.createdAt || 0
      ).getTime();
      const bd = new Date(
        b.date || b.occurredAt || b.createdAt || 0
      ).getTime();
      return bd - ad; // newest first
    });
  }, [eventsProp, bike.events]);

  // Derived "Latest Event" label from the SAME historyEvents used by History tab
  const latestEventLabelStr = useMemo(() => {
    if (!historyEvents.length) return "–";
    const latest = historyEvents[0]; // newest first due to sort above
    return eventLabel(latest);
  }, [historyEvents]);

  // Derived "Days in Stock" from events
  const derivedDaysInStock = useMemo(
    () =>
      computeDaysInStockFromHistory(
        historyEvents,
        bike.inStock,
        bike.status
      ),
    [historyEvents, bike.inStock, bike.status]
  );

  // Bike object used for read-only display (Details tab)
  const displayBike = useMemo(
    () => ({
      ...bike,
      events: historyEvents,
      daysInStock: derivedDaysInStock ?? bike.daysInStock,
      latestEventLabel: latestEventLabelStr,
    }),
    [bike, historyEvents, derivedDaysInStock, latestEventLabelStr]
  );

  // Draft object used for editing (Details tab)
  const draftWithDerived = useMemo(
    () =>
      draft
        ? {
            ...draft,
            events: historyEvents,
            daysInStock: derivedDaysInStock ?? draft.daysInStock,
            latestEventLabel: latestEventLabelStr,
          }
        : draft,
    [draft, historyEvents, derivedDaysInStock, latestEventLabelStr]
  );

  // Feature + spec definitions from catalog
  const featureOptions = useMemo(
    () => getFeatureFields(bike.make, bike.model),
    [bike.make, bike.model]
  );
  const specFieldDefs = useMemo(
    () => getSpecFields(bike.make, bike.model) || [],
    [bike.make, bike.model]
  );

  const featureMap = useMemo(() => {
    const m = new Map();
    featureOptions.forEach((o) => m.set(o.id, o.label));
    return m;
  }, [featureOptions]);

  const specSource = editing ? draftWithDerived?.specs : displayBike?.specs;
  const featureSource = editing
    ? draftWithDerived?.features
    : displayBike?.features;

  const featureChips = useMemo(() => {
    const ids = Array.isArray(featureSource) ? featureSource : [];
    return ids.map((id) => ({ id, label: featureMap.get(id) || id }));
  }, [featureSource, featureMap]);

  const specChips = useMemo(() => {
    const s = specSource && typeof specSource === "object" ? specSource : {};
    return Object.entries(s).map(([k, v]) => ({
      key: k,
      label: prettyLabel(k),
      sublabel: String(v),
      title: `${k}: ${v}`,
    }));
  }, [specSource]);

  const tabs = [
    { id: "details", label: "Details" },
    { id: "history", label: "History" },
  ];

  const header = { marginBottom: 8 };
  const titleStyle = {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    color: "#0b1228",
  };

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

  const handleFieldChange = (labelText, value) => {
    // acquisition-specific fields
    if (labelText === "Buy In Price" || labelText === "Source") {
      setDraft((prev) => {
        const prevAcq = prev?.acquisition || {};
        return {
          ...prev,
          acquisition: {
            ...prevAcq,
            buyInPrice:
              labelText === "Buy In Price" ? value : prevAcq.buyInPrice,
            source: labelText === "Source" ? value : prevAcq.source,
          },
        };
      });
      return;
    }

    // Status as enum id + label
    if (labelText === "Status") {
      setDraft((prev) => {
        const id = value || null;
        const match = id ? STATUS_TYPES.find((s) => s.id === id) : null;
        const label = match ? match.label : prev?.status || null;
        return {
          ...prev,
          status_id: id,
          status: label,
        };
      });
      return;
    }

    const k = normalizeKey(labelText);
    const key = KEY_OVERRIDES[k] || k;

    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!bike || !draftWithDerived) return;
    updateBike(bike.id, draftWithDerived);
    setEditing(false);
  };

  const handleOpenSpecEditor = () => {
    setSpecEditorOpen(true);
  };

  const handleSpecEditorSave = ({ features, specs }) => {
    if (editing) {
      setDraft((prev) => ({
        ...prev,
        features,
        specs,
      }));
      setSpecEditorOpen(false);
    } else {
      const next = {
        ...bike,
        features,
        specs,
      };
      updateBike(bike.id, next);
      setSpecEditorOpen(false);
    }
  };

  return (
    <>
      <div
        className="selected-bike"
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div className="selected-bike-header" style={header}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h2 style={titleStyle}>{registration}</h2>
            <div style={{ display: "flex", gap: 8 }}>
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(bike);
                      setEditing(false);
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-slate-200 text-slate-900 hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Edit details
                </button>
              )}
            </div>
          </div>
        </div>

        <TabsHeader tabs={tabs} active={active} onChange={setActive} />

        <div style={darkPanel}>
          {/* DETAILS TAB */}
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

            {editing ? (
              <EditableFieldGrid
                fields={DETAILS_FIELDS}
                data={draftWithDerived}
                onChange={handleFieldChange}
                onOpenSpecEditor={handleOpenSpecEditor}
              />
            ) : (
              <FieldGrid
                fields={DETAILS_FIELDS}
                data={displayBike}
                onOpenSpecEditor={handleOpenSpecEditor}
              />
            )}
          </div>

          {/* HISTORY TAB */}
          <div id="panel-history" hidden={active !== "history"}>
            <div style={{ marginBottom: 12 }}>
              <div style={sectionTitle}>Event History</div>
            </div>
            <HistoryTable events={historyEvents} />
          </div>
        </div>
      </div>

      {/* Spec & Features Editor Modal */}
      <SpecEditorModal
        open={specEditorOpen}
        onClose={() => setSpecEditorOpen(false)}
        featureOptions={featureOptions}
        specFieldDefs={specFieldDefs}
        initialFeatures={
          Array.isArray(draftWithDerived?.features)
            ? draftWithDerived.features
            : displayBike.features || []
        }
        initialSpecs={
          draftWithDerived?.specs && typeof draftWithDerived.specs === "object"
            ? draftWithDerived.specs
            : displayBike.specs || {}
        }
        onSave={handleSpecEditorSave}
      />
    </>
  );
}
