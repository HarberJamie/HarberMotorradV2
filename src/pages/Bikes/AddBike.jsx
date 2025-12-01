// src/pages/Bikes/AddBike.jsx
import React, { useMemo, useState } from "react";
import { useBikes } from "@/lib/bikesStore.js";
import {
  getMakes,
  getModels,
  getSpecFields,
  getFeatureFields,
} from "@/lib/catalog.js";

/* -------------------------------------------------------------------------- */
/* Fallback definitions (defaults)                                            */
/* -------------------------------------------------------------------------- */

const DEFAULT_SPEC_FIELDS = [
  { key: "engineCapacity", label: "Engine Capacity (cc)", type: "number" },
  { key: "powerBhp", label: "Power (bhp)", type: "number" },
  { key: "seatHeight", label: "Seat Height (mm)", type: "number" },
  { key: "kerbWeight", label: "Kerb Weight (kg)", type: "number" },
];

const DEFAULT_FEATURE_FIELDS = [
  { key: "heatedGrips", label: "Heated Grips" },
  { key: "cruiseControl", label: "Cruise Control" },
  { key: "quickshifter", label: "Quickshifter" },
  { key: "dynamicEse", label: "Dynamic ESA" },
  { key: "keylessRide", label: "Keyless Ride" },
  { key: "luggage", label: "Luggage / Panniers" },
];

/**
 * Known trims by Make|Model to keep data consistent.
 * You can keep expanding this as you go.
 */
const TRIMS_BY_MODEL = {
  "BMW|R 1300 GS": ["Base", "TE", "TE Low", "GS Trophy"],
  "BMW|R 1250 GS": ["Base", "TE", "Rallye TE"],
  "BMW|R 1250 GS Adventure": ["TE", "Rallye TE"],
  "BMW|S 1000 R": ["Sport", "M Sport"],
  "BMW|S 1000 XR": ["TE", "Sport", "M Sport"],
  "BMW|F 900 XR": ["SE", "TE"],
  "BMW|F 900 R": ["SE", "Sport"],
  "BMW|R 18": ["First Edition", "Classic", "B", "Transcontinental"],
};

/* -------------------------------------------------------------------------- */

export default function AddBike({ onClose }) {
  const { addBike } = useBikes();

  const [form, setForm] = useState({
    registration: "",
    vin: "",
    make: "BMW",
    model: "",
    trim: "",
    year: "",
    status: "available",
    latestEvent: "listing",
    totalMiles: "",
    price: "",
    vatQualifying: "no",
    colour: "",
    notes: "",
  });

  const [specs, setSpecs] = useState({});
  const [features, setFeatures] = useState({});

  /* -------------------------- dropdown options --------------------------- */

  const makeOptions = useMemo(
    () => getMakes().map((m) => ({ value: m, label: m })),
    []
  );

  const modelOptions = useMemo(
    () =>
      form.make
        ? getModels(form.make).map((m) => ({ value: m, label: m }))
        : [],
    [form.make]
  );

  const trimOptions = useMemo(() => {
    if (!form.make || !form.model) return [];
    const key = `${form.make}|${form.model}`;
    const list = TRIMS_BY_MODEL[key] || [];
    return list.map((t) => ({ value: t, label: t }));
  }, [form.make, form.model]);

  /* --------------------------- dynamic fields ---------------------------- */

  const specFields = useMemo(() => {
    try {
      let raw = [];
      if (form.make && form.model) {
        raw = getSpecFields(form.make, form.model, form.year) || [];
      }

      const source = raw.length ? raw : DEFAULT_SPEC_FIELDS;

      // Normalise to always have .key
      return source.map((f) => ({
        key: f.key ?? f.id ?? f.name, // fallbacks in case catalog uses id
        label: f.label,
        type: f.type,
        options: f.options,
      }));
    } catch {
      return DEFAULT_SPEC_FIELDS.map((f) => ({ ...f }));
    }
  }, [form.make, form.model, form.year]);

  const featureFields = useMemo(() => {
    try {
      let raw = [];
      if (form.make && form.model) {
        raw = getFeatureFields(form.make, form.model, form.year) || [];
      }

      const source = raw.length ? raw : DEFAULT_FEATURE_FIELDS;

      // Normalise to always have .key
      return source.map((f) => ({
        key: f.key ?? f.id ?? f.name,
        label: f.label,
      }));
    } catch {
      return DEFAULT_FEATURE_FIELDS.map((f) => ({ ...f }));
    }
  }, [form.make, form.model, form.year]);

  /* ------------------------------- handlers ------------------------------ */

  function handleChange(e) {
    const { name, value } = e.target;

    // Special handling for make/model to keep things in sync
    if (name === "make") {
      setForm((prev) => ({
        ...prev,
        make: value,
        model: "",
        trim: "",
      }));
      setSpecs({});
      setFeatures({});
      return;
    }

    if (name === "model") {
      setForm((prev) => ({
        ...prev,
        model: value,
        trim: "",
      }));
      setSpecs({});
      setFeatures({});
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSpecChange(key, value) {
    setSpecs((prev) => ({ ...prev, [key]: value }));
  }

  function handleFeatureToggle(key) {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const bike = {
      id: Date.now().toString(),
      registration: form.registration.trim().toUpperCase(),
      vin: form.vin.trim().toUpperCase(),
      make: form.make.trim(),
      model: form.model.trim(),
      trim: form.trim.trim(),
      year: form.year.trim(),
      status: form.status,
      latestEvent: form.latestEvent,
      totalMiles: form.totalMiles ? Number(form.totalMiles) : null,
      price: form.price ? Number(form.price) : null,
      vatQualifying: form.vatQualifying === "yes",
      colour: form.colour.trim(),
      notes: form.notes.trim(),
      specs,
      features,
    };

    addBike(bike);
    if (onClose) onClose();
  }

  /* ---------------------------------------------------------------------- */

  return (
    <div className="w-full max-w-3xl">
      {/* Header row to match Details / Deals vibe */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-50">
            Add New Bike
          </h2>
          <p className="text-xs text-slate-400">
            Core bike details, specifications and features — matching the
            Details tab.
          </p>
        </div>
      </div>

      {/* Main card – mirrors Details tab look & feel */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl"
      >
        {/* Section: headline details */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="Registration"
            name="registration"
            value={form.registration}
            onChange={handleChange}
            placeholder="e.g. MV25 ABC"
            autoFocus
          />

          {/* Make dropdown */}
          <SelectField
            label="Make"
            name="make"
            value={form.make}
            onChange={handleChange}
            options={makeOptions}
            allowEmpty={false}
          />

          {/* Model dropdown (dependent on make) */}
          <SelectField
            label="Model"
            name="model"
            value={form.model}
            onChange={handleChange}
            options={modelOptions}
            placeholder="Select model"
          />
        </section>

        {/* Section: trim, year, VIN, colour */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {trimOptions.length > 0 ? (
            <SelectField
              label="Trim"
              name="trim"
              value={form.trim}
              onChange={handleChange}
              options={trimOptions}
              placeholder="Select trim"
            />
          ) : (
            <Field
              label="Trim"
              name="trim"
              value={form.trim}
              onChange={handleChange}
              placeholder="TE, Sport, Triple Black..."
            />
          )}

          <Field
            label="Year"
            name="year"
            value={form.year}
            onChange={handleChange}
            inputMode="numeric"
            placeholder="2025"
          />
          <Field
            label="VIN"
            name="vin"
            value={form.vin}
            onChange={handleChange}
            placeholder="Last 7 or full VIN"
          />
          <Field
            label="Colour"
            name="colour"
            value={form.colour}
            onChange={handleChange}
            placeholder="e.g. Light White / Racing Blue"
          />
        </section>

        {/* Section: status & events */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              { value: "available", label: "Available" },
              { value: "sold", label: "Sold" },
              { value: "valuation", label: "Valuation" },
              { value: "pipeline", label: "Pipeline" },
              { value: "demonstrator", label: "Demonstrator" },
              { value: "loan-bike", label: "Loan Bike" },
            ]}
          />
          <SelectField
            label="Latest Event"
            name="latestEvent"
            value={form.latestEvent}
            onChange={handleChange}
            options={[
              { value: "listing", label: "Listing" },
              { value: "price_change", label: "Price Change" },
              { value: "offer", label: "Offer" },
              { value: "sale", label: "Sale" },
              { value: "valuation", label: "Valuation" },
              { value: "service", label: "Service" },
            ]}
          />
        </section>

        {/* Section: mileage & financials */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="Total Miles"
            name="totalMiles"
            value={form.totalMiles}
            onChange={handleChange}
            inputMode="numeric"
            placeholder="e.g. 4,250"
          />
          <Field
            label="Price (£)"
            name="price"
            value={form.price}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 14499"
          />
          <SelectField
            label="VAT Qualifying"
            name="vatQualifying"
            value={form.vatQualifying}
            onChange={handleChange}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
          />
        </section>

        {/* Section: specifications */}
        <section className="space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Specifications
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {specFields.map((field) => (
              <SpecField
                key={field.key}
                field={field}
                value={specs[field.key] ?? ""}
                onChange={(value) => handleSpecChange(field.key, value)}
              />
            ))}
          </div>
        </section>

        {/* Section: features */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Features & Equipment
          </h3>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {featureFields.map((field) => (
              <label
                key={field.key}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100"
              >
                <input
                  type="checkbox"
                  checked={!!features[field.key]}
                  onChange={() => handleFeatureToggle(field.key)}
                  className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-xs">{field.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Section: internal notes */}
        <section>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Internal Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="Damage, accessories, promised work, PX info, etc."
          />
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Save Bike
          </button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Field helper components                              */
/* -------------------------------------------------------------------------- */

function Field({ label, name, value, onChange, ...rest }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        {...rest}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select...",
  allowEmpty = true,
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
      >
        {allowEmpty && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SpecField({ field, value, onChange }) {
  const { label, type, options, key } = field;

  if (options && Array.isArray(options) && options.length > 0) {
    const normalizedOptions = options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
    return (
      <SelectField
        label={label}
        name={key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={normalizedOptions}
      />
    );
  }

  if (type === "number") {
    return (
      <Field
        label={label}
        name={key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
      />
    );
  }

  return (
    <Field
      label={label}
      name={key}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
