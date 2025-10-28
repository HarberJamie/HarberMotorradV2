import React, { useState } from "react";

const STORAGE_KEY = "harbermotorrad:bikes";

function getBikes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBike(bike) {
  const bikes = getBikes();
  bikes.push(bike);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes));
  // Fire a refresh event for ResultsList
  window.dispatchEvent(new CustomEvent("bikes:updated", { detail: { id: bike.id } }));
  return bike.id;
}

export default function AddBike({ onClose, onSaved }) {
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "Used",
    price: "",
    colour: "",
    reg: "",
    vin: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
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
  }

  // close when clicking outside the dialog
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex justify-between items-center border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Add New Bike</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-lg px-2 py-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Make" name="make" value={form.make} onChange={handleChange} required />
            <Field label="Model" name="model" value={form.model} onChange={handleChange} required />
            <Field label="Year" name="year" value={form.year} onChange={handleChange} required />
            <Field label="Mileage" name="mileage" type="number" value={form.mileage} onChange={handleChange} />
            <Select label="Condition" name="condition" value={form.condition} onChange={handleChange} options={["New", "Used", "Ex-Demo"]} />
            <Field label="Price (£)" name="price" type="number" value={form.price} onChange={handleChange} />
            <Field label="Colour" name="colour" value={form.colour} onChange={handleChange} />
            <Field label="Registration" name="reg" value={form.reg} onChange={handleChange} />
            <Field label="VIN" name="vin" value={form.vin} onChange={handleChange} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
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

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function Select({ label, name, value, onChange, options = [] }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
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
