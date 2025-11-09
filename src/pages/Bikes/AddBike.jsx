// src/pages/Bikes/AddBike.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getMakes,
  getModels,
  getYears,
  getSpecFields,
  getFeatureFields,
} from "@/lib/catalog";

const STORAGE_KEY = "harbermotorrad:bikes";
const EVENTS_KEY = "harbermotorrad:bike_events";

/* ----------------------- storage helpers (local only) ---------------------- */
function getBikes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveBike(bike) {
  const all = getBikes();
  all.unshift(bike);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("bikes:updated", { detail: { id: bike.id } }));
  return bike.id;
}
function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
  } catch {
    return [];
  }
}

/* ------------------- analytics: avg prep for make+model ------------------- */
/** Average of PREP_TASK_DONE.payload.cost for the same make+model */
function estimateAvgPrep(make, model) {
  if (!make || !model) return 0;

  const bikes = getBikes();
  const idsForSameModel = new Set(
    bikes.filter((b) => b.make === make && b.model === model).map((b) => b.id)
  );
  if (!idsForSameModel.size) return 0;

  const events = getEvents().filter(
    (e) => idsForSameModel.has(e.bike_id) && e.event_type === "PREP_TASK_DONE"
  );
  if (!events.length) return 0;

  const perBike = {};
  for (const e of events) {
    const c = Number(e.payload?.cost) || 0;
    perBike[e.bike_id] = (perBike[e.bike_id] || 0) + c;
  }

  const totals = Object.values(perBike);
  if (!totals.length) return 0;

  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  return Math.round(avg);
}

/* ----------------------------- trello helpers ----------------------------- */
function parseTrelloCardId(urlOrId) {
  if (!urlOrId) return "";
  // Accept raw ID or URL like https://trello.com/c/<id>/<slug>
  const m = String(urlOrId).match(/trello\.com\/c\/([a-zA-Z0-9]+)/);
  if (m) return m[1];
  // If it looks like an 8+ char alnum, treat as ID
  if (/^[a-zA-Z0-9]{8,}$/.test(urlOrId)) return urlOrId;
  return "";
}

/* ------------------------------ field styles ------------------------------ */
function inputClass(base, error) {
  return `${base} ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`;
}

/* --------------------------------- component ------------------------------- */
export default function AddBike({ onClose, onSaved }) {
  // Identity
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [trim, setTrim] = useState("");

  // Basic
  const [registration, setRegistration] = useState("");
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [colour, setColour] = useState("");
  const [condition, setCondition] = useState("Used");

  // Provenance
  const [ownersCount, setOwnersCount] = useState("");
  const [serviceHistoryType, setServiceHistoryType] = useState("Unknown");
  const [motExpiry, setMotExpiry] = useState("");

  // Commercials
  const [status, setStatus] = useState("inbound");
  const [acqSource, setAcqSource] = useState("part_ex");
  const [acqChannel, setAcqChannel] = useState("walk_in");
  const [buyIn, setBuyIn] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [vatScheme, setVatScheme] = useState("margin_scheme");
  const [targetMargin, setTargetMargin] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [adminFee, setAdminFee] = useState("");

  // Trello
  const [trelloUrl, setTrelloUrl] = useState("");

  // Dynamic per-model
  const [specValues, setSpecValues] = useState({}); // {specId: value}
  const [featureValues, setFeatureValues] = useState({}); // {featureId: boolean}

  // Validation
  const [errors, setErrors] = useState({}); // { fieldName: "message" }

  // Derived selects
  const makes = useMemo(() => getMakes(), []);
  const models = useMemo(() => getModels(make), [make]);
  const years = useMemo(() => getYears(make, model), [make, model]);
  const specFields = useMemo(() => getSpecFields(make, model), [make, model]);
  const featureFields = useMemo(() => getFeatureFields(make, model), [make, model]);

  // Suggested buy-in from price/margin/avg prep/admin fee
  const avgPrep = useMemo(() => estimateAvgPrep(make, model), [make, model]);
  const suggestedBuyIn = useMemo(() => {
    const price = Number(retailPrice) || 0;
    const margin = Number(targetMargin) || 0;
    const admin = Number(adminFee) || 0;
    const suggestion = price - margin - (avgPrep || 0) - admin;
    return suggestion > 0 ? Math.round(suggestion) : 0;
  }, [retailPrice, targetMargin, adminFee, avgPrep]);

  function resetModelDependent() {
    setModel("");
    setYear("");
    setTrim("");
    setSpecValues({});
    setFeatureValues({});
  }

  function onChangeSpec(id, value) {
    setSpecValues((s) => ({ ...s, [id]: value }));
  }
  function onToggleFeature(id, checked) {
    setFeatureValues((s) => ({ ...s, [id]: checked }));
  }

  function validate() {
    const next = {};
    if (!make) next.make = "Required";
    if (!model) next.model = "Required";
    if (!retailPrice || Number(retailPrice) <= 0) next.retailPrice = "Enter a retail price";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const id = crypto?.randomUUID?.() ?? `b_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const toNumberOrNull = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

    const featuresArr = Object.entries(featureValues)
      .filter(([, v]) => !!v)
      .map(([k]) => k);

    const trelloId = parseTrelloCardId(trelloUrl);

    const payload = {
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
      source: "manual",

      // Essentials (surface in list)
      status,
      registration: registration.trim(),
      make,
      model,
      trim: trim.trim(),
      year: year ? Number(year) : null,
      mileage_current: toNumberOrNull(mileage),
      colour: colour.trim(),
      price_retail: toNumberOrNull(retailPrice),
      price_last_changed_at: nowIso,

      // Dynamic attributes
      catalog_make_id: make || null,
      catalog_model_id: model || null,
      features: featuresArr, // array of feature IDs
      specs: specValues || {},

      // Provenance
      vin: vin.trim(),
      owners_count: ownersCount === "" ? null : Number(ownersCount),
      hpi_status: "clear",
      hpi_checked_at: null,
      recalls_outstanding: false,
      recalls_notes: "",
      mot_expiry: motExpiry || null,
      service_history_type: serviceHistoryType,
      service_records: [],
      warranty_remaining_months: null,
      warranty_provider: "",

      // Commercials
      acquisition_source: acqSource,
      acquisition_channel: acqChannel,
      acquisition_price_buy_in: toNumberOrNull(buyIn),
      transport_cost: toNumberOrNull(transportCost) ?? 0,
      prep_estimate: avgPrep || 0, // seed with learned average for this model
      target_margin: toNumberOrNull(targetMargin) ?? 0,
      vat_scheme: vatScheme,
      admin_fee: toNumberOrNull(adminFee) ?? 0,
      price_history: [{ date: nowIso, price: Number(retailPrice) || 0, reason: "initial" }],
      live_since: null,
      sold_at: null,
      price_sold: null,
      finance_type: "cash",
      finance_apr: null,
      finance_term_months: null,
      finance_deposit: null,
      finance_gfv: null,
      px_included: false,
      px_reference_id: null,
      px_allowance: null,
      gardx_or_coating: "none",
      add_on_sales: [],

      // Marketing
      listing_channels: [],
      marketing_utm: {},
      photoshoot_date: null,
      description_version: 1,

      // Ops
      location: "showroom",
      workshop_job_number: "",
      linked_trello_card_id: trelloId || "",
      linked_trello_card_url: trelloUrl || "",
      linked_drive_dms_id: "",
      created_by_user_id: "",
      owner_sales_exec_id: "",
      notes_internal: "",

      // KPIs (computed later)
      kpis: {
        time_on_market_days: null,
        days_to_sell: null,
        lead_count: 0,
        enquiries_count: 0,
        test_rides_count: 0,
        views_count: 0,
        discount_given: 0,
        prep_total: 0,
        gross_profit: null,
        net_margin: null,
      },

      schemaVersion: 1,
      audit_log: [],
      condition,
    };

    const savedId = saveBike(payload);
    onSaved?.(savedId);
  }

  // close when clicking outside the dialog
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose?.();
  }

  // auto-clear errors when user fixes fields
  useEffect(() => {
    if (make && errors.make) setErrors((e) => ({ ...e, make: undefined }));
  }, [make, errors.make]);
  useEffect(() => {
    if (model && errors.model) setErrors((e) => ({ ...e, model: undefined }));
  }, [model, errors.model]);
  useEffect(() => {
    if (retailPrice && Number(retailPrice) > 0 && errors.retailPrice) {
      setErrors((e) => ({ ...e, retailPrice: undefined }));
    }
  }, [retailPrice, errors.retailPrice]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex justify-between items-center border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Add New Bike</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-lg px-2 py-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* Identity */}
          <Section title="Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Make"
                name="make"
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  // Reset everything that depends on Make/Model
                  setModel("");
                  setYear("");
                  setTrim("");
                  setSpecValues({});
                  setFeatureValues({});
                }}
                options={["", ...makes]}
                required
                error={errors.make}
              />
              <Select
                label="Model"
                name="model"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setYear("");
                  setSpecValues({});
                  setFeatureValues({});
                }}
                options={["", ...models]}
                disabled={!make}
                required
                error={errors.model}
              />
              <Select
                label="Year"
                name="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                options={["", ...years]}
                disabled={!model}
              />
              <Field
                label="Trim"
                name="trim"
                value={trim}
                onChange={(e) => setTrim(e.target.value)}
              />
            </div>
          </Section>

          {/* Basics */}
          <Section title="Basics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Registration"
                name="registration"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
              />
              <Field
                label="VIN"
                name="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
              />
              <Field
                label="Mileage"
                type="number"
                name="mileage"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
              <Field
                label="Colour"
                name="colour"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
              />
              <Select
                label="Condition"
                name="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                options={["New", "Used", "Ex-Demo"]}
              />
              <Field
                label="Retail Price (£)"
                type="number"
                name="price"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                required
                error={errors.retailPrice}
              />
            </div>
          </Section>

          {/* Provenance */}
          <Section title="Provenance">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label="Owners (count)"
                type="number"
                name="owners"
                value={ownersCount}
                onChange={(e) => setOwnersCount(e.target.value)}
              />
              <Select
                label="Service History"
                name="service_history"
                value={serviceHistoryType}
                onChange={(e) => setServiceHistoryType(e.target.value)}
                options={["FBMWSH", "FSH", "Partial", "None", "Unknown"]}
              />
              <Field
                label="MOT Expiry"
                name="mot"
                type="date"
                value={motExpiry}
                onChange={(e) => setMotExpiry(e.target.value)}
              />
            </div>
          </Section>

          {/* Commercials */}
          <Section title="Commercials">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  "inbound",
                  "in_prep",
                  "live",
                  "reserved",
                  "sold",
                  "returned",
                  "wholesaled",
                  "scrapped",
                ]}
              />
              <Select
                label="Acquisition Source"
                name="acq_source"
                value={acqSource}
                onChange={(e) => setAcqSource(e.target.value)}
                options={["part_ex", "auction", "trade_in", "buy_direct", "internal"]}
              />
              <Select
                label="Acquisition Channel"
                name="acq_channel"
                value={acqChannel}
                onChange={(e) => setAcqChannel(e.target.value)}
                options={["walk_in", "online", "phone", "email"]}
              />

              <Field
                label="Buy-in Price (£)"
                type="number"
                name="buyin"
                value={buyIn}
                onChange={(e) => setBuyIn(e.target.value)}
              />
              <Field
                label="Transport Cost (£)"
                type="number"
                name="transport"
                value={transportCost}
                onChange={(e) => setTransportCost(e.target.value)}
              />
              <Select
                label="VAT Scheme"
                name="vat"
                value={vatScheme}
                onChange={(e) => setVatScheme(e.target.value)}
                options={["standard", "margin_scheme"]}
              />

              <Field
                label="Target Margin (£)"
                type="number"
                name="target_margin"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
              />
              <Field
                label="Admin Fee (£)"
                type="number"
                name="admin_fee"
                value={adminFee}
                onChange={(e) => setAdminFee(e.target.value)}
              />

              {/* Suggestion widget */}
              <div className="md:col-span-3 rounded-xl border p-3 bg-gray-50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-sm">
                    <div className="font-semibold">Suggested Buy-in</div>
                    <div className="text-gray-600">
                      £{suggestedBuyIn.toLocaleString()}{" "}
                      <span className="text-xs">
                        (Retail £{Number(retailPrice || 0).toLocaleString()} − Margin £
                        {Number(targetMargin || 0).toLocaleString()} − Avg Prep £
                        {(avgPrep || 0).toLocaleString()} − Admin £
                        {Number(adminFee || 0).toLocaleString()})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBuyIn(String(suggestedBuyIn))}
                    className="ml-auto rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                    disabled={!suggestedBuyIn}
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* Trello */}
          <Section title="Trello (optional)">
            <div className="grid grid-cols-1 gap-4">
              <Field
                label="Trello Card URL or ID"
                name="trello"
                value={trelloUrl}
                onChange={(e) => setTrelloUrl(e.target.value)}
                placeholder="https://trello.com/c/XXXXXXXX/your-card-title or paste ID"
              />
              {!!parseTrelloCardId(trelloUrl) && (
                <div className="text-xs text-green-700">
                  Parsed Trello Card ID:{" "}
                  <span className="font-mono">{parseTrelloCardId(trelloUrl)}</span>
                </div>
              )}
            </div>
          </Section>

          {/* Dynamic Specs */}
          {specFields.length > 0 && (
            <Section title="Specifications (model-specific)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specFields.map((field) => {
                  const value = specValues[field.id] ?? "";
                  if (field.type === "enum") {
                    return (
                      <Select
                        key={field.id}
                        label={field.label}
                        name={field.id}
                        value={value}
                        onChange={(e) => onChangeSpec(field.id, e.target.value)}
                        options={["", ...(field.options || [])]}
                      />
                    );
                  }
                  return (
                    <Field
                      key={field.id}
                      label={field.label}
                      name={field.id}
                      type={field.type === "number" ? "number" : "text"}
                      value={value}
                      onChange={(e) => onChangeSpec(field.id, e.target.value)}
                    />
                  );
                })}
              </div>
            </Section>
          )}

          {/* Dynamic Features */}
          {featureFields.length > 0 && (
            <Section title="Features (model-specific)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {featureFields.map((f) => (
                  <label key={f.id} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={!!featureValues[f.id]}
                      onChange={(e) => onToggleFeature(f.id, e.target.checked)}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </Section>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Save Bike
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------- UI helpers ------------------------------- */
function Section({ title, children }) {
  return (
    <section>
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  error,
  placeholder,
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={inputClass("mt-1 w-full rounded-xl border p-2 focus:ring-2", !!error)}
      />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </label>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={inputClass("mt-1 w-full rounded-xl border p-2 disabled:bg-gray-100 focus:ring-2", !!error)}
      >
        {options.map((opt) => (
          <option key={String(opt)} value={opt}>
            {String(opt) || "—"}
          </option>
        ))}
      </select>
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </label>
  );
}
