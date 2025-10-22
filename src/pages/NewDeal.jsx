import React, { useMemo, useState } from "react";
import schema from "../schemas/newDealSchema.json";

const STORAGE_KEY = "harbermotorrad:deals";

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
        <label htmlFor={field.id} className="mb-1 block text-sm font-medium">{field.label}</label>
        <select {...common}>
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="mb-4">
        <label htmlFor={field.id} className="mb-1 block text-sm font-medium">{field.label}</label>
        <textarea {...common} rows={field.rows || 3} />
      </div>
    );
  }
  return (
    <div className="mb-4">
      <label htmlFor={field.id} className="mb-1 block text-sm font-medium">{field.label}</label>
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

export default function NewDeal() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const allFields = useMemo(() => schema.sections.flatMap((s) => s.fields), []);

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
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const deal = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...values };
    saveDeal(deal);
    setValues({});
    alert(`Deal created: ${deal.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Add New Deal</h1>
      <form onSubmit={handleSubmit}>
        {schema.sections.map((section) => (
          <div key={section.title} className="mb-8 rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{section.title}</h2>
            {section.fields.map((field) => (
              <div key={field.id}>
                <Field field={field} value={values[field.id]} values={values} onChange={handleChange} />
                {errors[field.id] && <p className="mb-2 text-xs text-red-600">{errors[field.id]}</p>}
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
