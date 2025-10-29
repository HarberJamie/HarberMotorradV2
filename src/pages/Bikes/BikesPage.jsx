import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// If you DON'T have '@' alias, use the RELATIVE path below:
import Modal from "../../components/Modal.jsx";
// If you DO have '@' working, you could use: import Modal from "@/components/Modal.jsx";
import SearchBar from "./SearchBar.jsx";
import ResultsList from "./ResultsList.jsx";
import SelectedBike from "./SelectedBike.jsx";

const BIKES_STORAGE_KEY = "harbermotorrad:bikes";

/* --------------------------------- Storage -------------------------------- */
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

/* ---------------------------------- Page ---------------------------------- */
export default function BikesPage() {
  const [params, setParams] = useSearchParams();
  const bikeId = params.get("bikeId") || null;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

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

  // When a bikeId appears in the URL (via list click), open the overlay
  useEffect(() => {
    if (bikeId) setShowViewModal(true);
  }, [bikeId]);

  const closeViewModal = () => {
    setShowViewModal(false);
    // If you want to clear the URL param on close, uncomment:
    // updateParams({ bikeId: "" });
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

      {/* List left */}
      <div className="col-span-12 md:col-span-5 lg:col-span-4">
        <ResultsList
          selectedId={bikeId}
          onSelect={(id) => updateParams({ bikeId: id })}
        />
      </div>

      {/* (Optional) Right column placeholder on wide screens */}
      <div className="hidden md:block md:col-span-7 lg:col-span-8">
        <EmptyState />
      </div>

      {/* View Bike Modal */}
      <Modal
        open={!!bikeId && showViewModal}
        onClose={closeViewModal}
        title="Bike Details"
        widthClass="w-[min(980px,95vw)]"
      >
        {bikeId ? <SelectedBike bikeId={bikeId} /> : <p>No bike selected</p>}
      </Modal>

      {/* Add Bike Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Bike"
        widthClass="w-[min(680px,95vw)]"
      >
        <AddBikeForm
          onCancel={() => setShowAddModal(false)}
          onSaved={(id) => {
            setShowAddModal(false);
            updateParams({ bikeId: id }); // auto-open the newly added bike
          }}
        />
      </Modal>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-sm text-gray-600 bg-white rounded-2xl shadow p-6">
      Select a bike to view details in a pop-up.
    </div>
  );
}

/* ----------------------------- Add Bike Form ------------------------------ */
function AddBikeForm({ onCancel, onSaved }) {
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
    const savedId = saveBike(payload);
    onSaved?.(savedId);
  };

  return (
    <form onSubmit={handleSubmit}>
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
          onClick={onCancel}
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
