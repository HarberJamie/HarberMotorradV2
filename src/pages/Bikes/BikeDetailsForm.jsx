// src/pages/Bikes/BikeDetailsForm.jsx
import React, { useMemo, useRef, useState } from "react";
import { useBikes } from "@/lib/bikesStore.js";
import { getMakes, getModels, getYears } from "@/lib/catalog.js";

// ---- localStorage fallback (if store.addBike not present) ----
const STORAGE_KEY = "harbermotorrad:bikes";
function getBikesLS() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveBikeToLocal(bike) {
  const bikes = getBikesLS();
  bikes.push(bike);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes));
}

const genId = () =>
  (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toUpperCase();

export default function BikeDetailsForm({ initial = {}, onCancel, onSaved }) {
  const store = useBikes() || {};
  const addBike = typeof store.addBike === "function" ? store.addBike : null;

  // --- Controlled dropdowns to eliminate free-typing ---
  const [make, setMake] = useState(initial.make || "");
  const [model, setModel] = useState(initial.model || "");
  const [year, setYear] = useState(String(initial.year || ""));
  const [condition, setCondition] = useState(initial.condition || "");
  const [serviceHistory, setServiceHistory] = useState(initial.serviceHistory || "");

  const makes = useMemo(() => getMakes(), []);
  const models = useMemo(() => getModels(make), [make]);
  const years = useMemo(() => getYears(make, model), [make, model]);

  // When make changes, reset model/year
  function onChangeMake(next) {
    setMake(next);
    setModel("");
    setYear("");
  }

  // --- Keep the rest as uncontrolled refs for minimal churn ---
  const regRef = useRef(null);
  const vinRef = useRef(null);
  const mileageRef = useRef(null);
  const colourRef = useRef(null);
  const notesRef = useRef(null);

  function getValues() {
    const v = {
      registration: regRef.current?.value ?? "",
      vin: vinRef.current?.value ?? "",
      make,                 // from state (dropdown)
      model,                // from state (dropdown)
      year,                 // from state (dropdown)
      mileage: mileageRef.current?.value ?? "",
      colour: colourRef.current?.value ?? "",
      condition,            // from state (dropdown)
      serviceHistory,       // from state (dropdown)
      notes: notesRef.current?.value ?? "",
    };
    return v;
  }

  function validate(v) {
    const errors = {};
    const required = ["registration", "vin", "make", "model", "year", "mileage"];
    required.forEach((k) => {
      if (!String(v[k] || "").trim()) errors[k] = "Required";
    });
    if (v.year && !/^\d{4}$/.test(String(v.year))) errors.year = "Enter 4-digit year";
    if (v.mileage !== "" && isNaN(Number(v.mileage))) errors.mileage = "Enter a number";
    if (v.vin && String(v.vin).trim().length < 7) errors.vin = "At least last 7 characters";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const raw = getValues();

    const cleaned = {
      ...raw,
      registration: String(raw.registration || "").trim().toUpperCase(),
      vin: String(raw.vin || "").trim().toUpperCase(),
      year: String(raw.year || "").trim(),
      mileage: Number(raw.mileage || 0),
      make: String(raw.make || "").trim(),
      model: String(raw.model || "").trim(),
      colour: String(raw.colour || "").trim(),
      condition: String(raw.condition || "").trim(),
      serviceHistory: String(raw.serviceHistory || "").trim(),
    };

    const errors = validate(cleaned);
    if (Object.keys(errors).length) {
      // Focus the first invalid field (basic UX)
      const firstKey = Object.keys(errors)[0];
      const map = {
        registration: regRef,
        vin: vinRef,
        mileage: mileageRef,
        colour: colourRef,
        notes: notesRef,
      };
      map[firstKey]?.current?.focus?.();
      alert(
        "Please fix the following:\n\n" +
          Object.entries(errors)
            .map(([k, msg]) => `• ${k}: ${msg}`)
            .join("\n")
      );
      return;
    }

    const bike = {
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...cleaned,
    };

    try {
      if (addBike) await addBike(bike);
      else {
        saveBikeToLocal(bike);
        // let any listeners refresh
        window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
      }
      onSaved?.(bike);
    } catch (err) {
      console.error("Failed to save bike:", err);
      alert("Sorry, could not save the bike. Check console for details.");
    }
  }

  // Small field helpers
  function Field({ id, label, placeholder, type = "text", inputRef, defaultValue }) {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          {label}
        </label>
        <input
          id={id}
          name={id}
          type={type}
          ref={inputRef}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 bg-white/5 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    );
  }

  function Select({ id, label, value, onChange, options, placeholder = "Select…" }) {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          {label}
        </label>
        <select
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white/5 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Add a New Bike</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Details</h2>

          <Field
            id="registration"
            label="Registration"
            placeholder="e.g. PJ25 ABC"
            inputRef={regRef}
            defaultValue={initial.registration || ""}
          />
          <Field
            id="vin"
            label="VIN / Last 7"
            placeholder="e.g. WB10A1200R1234567 or last 7"
            inputRef={vinRef}
            defaultValue={initial.vin || ""}
          />

          {/* Dropdowns to enforce data accuracy */}
          <Select
            id="make"
            label="Make"
            value={make}
            onChange={onChangeMake}
            options={makes}
            placeholder="Select a manufacturer"
          />
          <Select
            id="model"
            label="Model"
            value={model}
            onChange={setModel}
            options={models}
            placeholder={make ? "Select a model" : "Select a make first"}
          />
          <Select
            id="year"
            label="Year"
            value={year}
            onChange={setYear}
            options={years}
            placeholder={model ? "Select a year" : "Select a model first"}
          />

          <Field
            id="mileage"
            label="Mileage"
            placeholder="12000"
            inputRef={mileageRef}
            defaultValue={initial.mileage ?? ""}
          />

          <Field
            id="colour"
            label="Colour"
            placeholder="Triple Black"
            inputRef={colourRef}
            defaultValue={initial.colour || ""}
          />

          <Select
            id="condition"
            label="Condition"
            value={condition}
            onChange={setCondition}
            options={["New", "Used", "Ex-Demo"]}
            placeholder="Select condition"
          />

          <Select
            id="serviceHistory"
            label="Service History"
            value={serviceHistory}
            onChange={setServiceHistory}
            options={["FBMWSH", "FSH", "Partial", "None", "Unknown"]}
            placeholder="Select service history"
          />

          <div className="mb-4">
            <label htmlFor="notes" className="mb-1 block text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              ref={notesRef}
              defaultValue={initial.notes || ""}
              placeholder="Any additional details for appraisal/advertising."
              className="w-full rounded-xl border border-gray-300 bg-white/5 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-gray-300 bg-white/5 px-5 py-3 text-sm font-medium shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-2xl px-5 py-3 text-sm font-medium shadow-sm"
            style={{ background: "#7aa2ff", color: "white" }}
          >
            Save Bike
          </button>
        </div>
      </form>
    </div>
  );
}
