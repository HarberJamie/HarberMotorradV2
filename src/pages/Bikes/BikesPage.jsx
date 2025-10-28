import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import ResultsList from "./ResultsList.jsx";
import SelectedBike from "./SelectedBike.jsx";

const BIKES_STORAGE_KEY = "harbermotorrad:bikes";

function getBikes() {
  try {
    return JSON.parse(localStorage.getItem(BIKES_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Return the new id and emit bikes:updated with detail
function saveBike(bike) {
  const bikes = getBikes();
  bikes.push(bike);
  localStorage.setItem(BIKES_STORAGE_KEY, JSON.stringify(bikes));

  const id = bike.id;
  window.dispatchEvent(new CustomEvent("bikes:updated", { detail: { id } }));
  return id;
}

export default function BikesPage() {
  const [params, setParams] = useSearchParams();
  const bikeId = params.get("bikeId") || null;
  const [showAddModal, setShowAddModal] = useState(false);

  // Merge helper: writes only non-empty values; deletes null/"" keys
  const updateParams = (next) => {
    const current = Object.fromEntries(params.entries());
    const merged = { ...current };

    for (const [k, v] of Object.entries(next || {})) {
      if (v == null || v === "") delete merged[k];
      else merged[k] = v;
    }

    setParams(merged);
  };

  return (
    <div className="p-4 grid grid-cols-12 gap-4">
      {/* Top bar with Add button + title */}
      <div className="col-span-12 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bikes</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Bike
        </button>
      </div>

      <div className="col-span-12">
        <SearchBar onChange={updateParams} />
      </div>

      <div className="col-span-12 md:col-span-4">
        <ResultsList
          selectedId={bikeId}
          onSelect={(id) => updateParams({ bikeId: id })}
        />
      </div>

      <div className="col-span-12 md:col-span-8">
        {bikeId ? <SelectedBike bikeId={bikeId} /> : <EmptyState />}
      </div>

      {/* Modal via Portal so it overlays the whole page */}
      {showAddModal &&
        createPortal(
          <AddBikeModal
            onClose={() => setShowAddModal(false)}
            onSaved={(id) => {
              setShowAddModal(false);
              updateParams({ bikeId: id }); // auto-select newly added bike
            }}
          />,
          document.body
        )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-sm text-gray-600 bg-white rounded-2xl shadow p-6">
      Search and select a bike to view details.
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Add Bike Modal (Portal)                          */
/* -------------------------------------------------------------------------- */

function AddBikeModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "Used",
    price: "",
    colour: "",
    registration: "",
    vin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `${Date.now()}`;
    const payload = {
      id,
      ...form,
      year: String(form.year).trim(),
      mileage: Number(form.mileage || 0),
      price: Number(form.price || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "manual",
    };
    const savedId = saveBike(payload); // returns id
    onSaved?.(savedId);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  // IMPORTANT: Use inline styles for the overlay so no Tailwind dependency
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 2147483647, // max-ish
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
  };

  const panelStyle = {
    width: "100%",
    maxWidth: "40rem", // ~640px
    borderRadius: "1rem",
    background: "#fff",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    overflow: "hidden",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    padding: "16px 20px",
  };

  const bodyStyle = { padding: "16px 20px" };

  return (
    <div style={overlayStyle} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div style={panelStyle}>
        <div style={headerStyle}>
          <h2 className="text-lg font-semibold">Add New Bike</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-1 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={bodyStyle}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Make" name="make" value={form.make} onChange={handleChange} required />
            <Field label="Model" name="model" value={form.model} onChange={handleChange} required />
            <Field label="Year" name="year" value={form.year} onChange={handleChange} required />
            <Field label="Mileage" name="mileage" type="number" min="0" step="1" value={form.mileage} onChange={handleChange} />
            <Select
              label="Condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              options={["New", "Used", "Ex-Demo"]}
            />
            <Field label="Price (£)" name="price" type="number" min="0" step="1" value={form.price} onChange={handleChange} />
            <Field label="Colour" name="colour" value={form.colour} onChange={handleChange} />
            <Field label="Registration" name="registration" value={form.registration} onChange={handleChange} />
            <Field label="VIN" name="vin" value={form.vin} onChange={handleChange} />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
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

/* -------------------------- Form Input Components -------------------------- */

function Field({ label, name, value, onChange, type = "text", ...rest }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-2 outline-none focus:ring-2 focus:ring-blue-500"
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        {...rest}
      />
    </label>
  );
}

function Select({ label, name, value, onChange, options = [] }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <select
        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-2 outline-none focus:ring-2 focus:ring-blue-500"
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
