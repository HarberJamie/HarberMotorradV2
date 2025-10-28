import React, { useMemo, useState } from "react";
import schema from "../schemas/newDealSchema.json";
import { addBike, getBikes } from "@/lib/bikesStore"; // <-- write to Bikes store too

const STORAGE_KEY = "harbermotorrad:deals";

// ------- deals storage helpers -------
function getDeals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveDeal(deal) {
  const deals = getDeals();
  deals.push(deal);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

// ------- small utils -------
const toNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const upper = (s) => (typeof s === "string" ? s.toUpperCase() : s);
const trimmed = (s) => (typeof s === "string" ? s.trim() : s);

// ------- field component -------
function Field({ field, value, onChange, values }) {
  if (field.showIf) {
    const [k, v] = Object.entries(field.showIf)[0];
    if (values[k] !== v) return null;
  }
  const common = {
    id: field.id,
    name: field.id,
    value: value ?? "",
    onChange: (e) => onChange(field.id, e.target.value),
    required: !!field.required,
    placeholder: field.placeholder || "",
    className:
      "w-full rounded-xl border border-gray-300 bg-white/5 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400",
  };
  if (field.type === "select") {
    return (
      <div className="mb-4">
        <label htmlFor={field.id} className="mb-1 block text-sm font-medium">
          {field.label}
        </label>
        <select {...common}>
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="mb-4">
        <label htmlFor={field.id} className="mb-1 block text-sm font-medium">
          {field.label}
        </label>
        <textarea {...common} rows={field.rows || 3} />
      </div>
    );
  }
  return (
    <div className="mb-4">
      <label htmlFor={field.id} className="mb-1 block text-sm font-medium">
        {field.label}
      </label>
      <input
        type={field.type === "currency" ? "number" : field.type || "text"}
        {...common}
        min={field.min}
        max={field.max}
        step={field.step}
      />
    </div>
  );
}

// ------- map Add New Deal -> Bike shape -------
function mapDealToBike(values, dealId) {
  const registration = upper(trimmed(values.registration || ""));
  const vin = upper(trimmed(values.vin || ""));

  return {
    // identities
    registration,
    vin,

    // core spec
    make: values.make || "",
    model: values.model || "",
    derivative: values.derivative || "", // e.g. R1300GS Adventure
    year: values.year || "",
    mileage: toNumber(values.mileage, 0),
    colour: values.colour || "",

    // condition / history
    condition: values.condition || "Unknown",
    serviceHistory: values.serviceHistory || "Unknown",
    owners: toNumber(values.owners, 0),

    // pricing
    source: values.source || "Add New Deal",
    costPrice: toNumber(values.costPrice, 0),
    askingPrice: toNumber(values.askingPrice, 0),

    // media
    images: Array.isArray(values.images) ? values.images : [],

    // meta
    notes: values.notes || "",
    status: values.status || "In Stock",

    // link back to the deal
    sourceDealId: dealId,
  };
}

export default function NewDeal() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const allFields = useMemo(
    () => schema.sections.flatMap((s) => s.fields),
    []
  );

  function visibleFields(v) {
    return allFields.filter((f) => {
      if (!f.showIf) return true;
      const [k, val] = Object.entries(f.showIf)[0];
      return v[k] === val;
    });
  }

  function handleChange(id, val) {
    setValues((prev) => ({ ...prev, [id]: val }));
  }

  function validate() {
    const vFields = visibleFields(values);
    const next = {};
    vFields.forEach((f) => {
      if (f.required && !values[f.id]) next[f.id] = `${f.label} is required`;
    });

    // soft validation/normalization for registration & vin
    if (values.registration && trimmed(values.registration).length < 3) {
      next.registration = "Registration looks too short";
    }
    if (values.vin && trimmed(values.vin).length < 6) {
      next.vin = "VIN looks too short";
    }

    // warn if registration already exists in bikes
    const reg = upper(trimmed(values.registration || ""));
    if (reg) {
      const exists = (getBikes() || []).some(
        (b) => upper(b.registration || "") === reg
      );
      if (exists) {
        next.registration =
          next.registration ||
          "A bike with this registration already exists in your Bikes list";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const deal = {
      id: crypto?.randomUUID?.() ?? `d_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...values,
    };

    // 1) Save the Deal
    saveDeal(deal);

    // 2) Map and save to Bikes store (so it appears on the Bikes page)
    const bike = mapDealToBike(values, deal.id);
    const savedBike = addBike(bike);

    // 3) Reset form + user feedback
    setValues({});
    alert(`Deal created: ${deal.id}\nBike saved to inventory: ${savedBike.registration || savedBike.vin}`);
    // Optional: navigate to Bikes with the new selection
    // navigate("/bikes?select=" + savedBike.id);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Add New Deal</h1>
      <form onSubmit={handleSubmit}>
        {schema.sections.map((section) => (
          <div
            key={section.title}
            className="mb-8 rounded-2xl border border-gray-200 p-4 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-semibold">{section.title}</h2>
            {section.fields.map((field) => (
              <div key={field.id}>
                <Field
                  field={field}
                  value={values[field.id]}
                  values={values}
                  onChange={handleChange}
                />
                {errors[field.id] && (
                  <p className="mb-2 text-xs text-red-600">
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
        <button
          type="submit"
          className="rounded-2xl px-5 py-3 text-sm font-medium shadow-sm"
          style={{ background: "#7aa2ff", color: "white" }}
        >
          Create Deal
        </button>
      </form>
    </div>
  );
}
