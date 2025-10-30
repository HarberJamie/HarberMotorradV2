// src/pages/Bikes/BikesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import ResultsList from "./ResultsList.jsx";
import SelectedBike from "./SelectedBike.jsx";

const BIKES_STORAGE_KEY = "harbermotorrad:bikes";

/* --------------------------------- Storage -------------------------------- */
function getBikes() {
  try { return JSON.parse(localStorage.getItem(BIKES_STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveBike(bike) {
  const bikes = getBikes();
  bikes.push(bike);
  localStorage.setItem(BIKES_STORAGE_KEY, JSON.stringify(bikes));
  const id = bike.id;
  window.dispatchEvent(new CustomEvent("bikes:updated", { detail: { id } }));
  return id;
}

/* ------------------------------ Inline Modal ------------------------------ */
function InlinePortalModal({ open, onClose, title, width = 980, children }) {
  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev || "");
  }, [open]);

  if (!open) return null;

  const backdropStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    WebkitBackdropFilter: "blur(1px)",
    backdropFilter: "blur(1px)",
    zIndex: 2147483646,
  };
  const wrapStyle = {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    overflowY: "auto",
    zIndex: 2147483647,
  };
  const panelStyle = {
    marginTop: 40,
    maxWidth: "95vw",
    width,
    background: "white",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    outline: "none",
  };
  const headerStyle = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: 20,
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  };
  const bodyStyle = { padding: 20 };

  const stop = (e) => e.stopPropagation();

  return createPortal(
    <>
      <div style={backdropStyle} onClick={onClose} />
      <div style={wrapStyle} role="dialog" aria-modal="true" onClick={onClose}>
        <div style={panelStyle} onClick={stop}>
          {(title || onClose) && (
            <div style={headerStyle}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                {title || "Details"}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{ border: 0, background: "transparent", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          )}
          <div style={bodyStyle}>{children}</div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ---------------------------------- Page ---------------------------------- */
export default function BikesPage() {
  const [params, setParams] = useSearchParams();
  const bikeId = params.get("bikeId") || null;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  const updateParams = (next) => {
    const current = Object.fromEntries(params.entries());
    const merged = { ...current };
    for (const [k, v] of Object.entries(next || {})) {
      if (v == null || v === "") delete merged[k];
      else merged[k] = v;
    }
    setParams(merged, { replace: true });
  };

  useEffect(() => {
    if (bikeId) {
      setShowAddModal(false);
      setShowViewModal(true);
    } else {
      setShowViewModal(false);
    }
  }, [bikeId]);

  const closeViewModal = () => {
    setShowViewModal(false);
    updateParams({ bikeId: "" });
  };

  const selectedBikeId = useMemo(() => bikeId, [bikeId]);

  return (
    <div className="p-4 grid grid-cols-12 gap-4">
      <div className="col-span-12 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bikes</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDebugOpen(true)}
            className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300"
          >
            TEST MODAL
          </button>
          <button
            onClick={() => { setShowViewModal(false); setShowAddModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Bike
          </button>
        </div>
      </div>

      <div className="col-span-12">
        <SearchBar onChange={updateParams} />
      </div>

      <div className="col-span-12 md:col-span-5 lg:col-span-4">
        <ResultsList
          selectedId={selectedBikeId}
          onSelect={(id) => {
            setShowViewModal(true);
            updateParams({ bikeId: id });
          }}
        />
      </div>

      <div className="hidden md:block md:col-span-7 lg:col-span-8">
        <EmptyState />
      </div>

      <InlinePortalModal
        open={!!selectedBikeId && showViewModal}
        onClose={closeViewModal}
        title="Bike Details"
        width={980}
      >
        {selectedBikeId ? (
          <SelectedBike key={selectedBikeId} bikeId={selectedBikeId} />
        ) : (
          <p>No bike selected</p>
        )}
      </InlinePortalModal>

      <InlinePortalModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Bike"
        width={680}
      >
        <AddBikeForm
          onCancel={() => setShowAddModal(false)}
          onSaved={(id) => {
            setShowAddModal(false);
            updateParams({ bikeId: id });
          }}
        />
      </InlinePortalModal>

      <InlinePortalModal
        open={debugOpen}
        onClose={() => setDebugOpen(false)}
        title="Overlay Test"
        width={520}
      >
        <p>If you can see this, the overlay is working (pure inline styles).</p>
      </InlinePortalModal>
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
    make: "", model: "", year: "", mileage: "",
    condition: "Used", price: "", colour: "", registration: "", vin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `${Date.now()}`;
    const now = new Date().toISOString();
    const payload = {
      id, ...form,
      year: String(form.year || "").trim(),
      mileage: Number(form.mileage || 0),
      price: Number(form.price || 0),
      createdAt: now,
      updatedAt: now,
      source: "manual",
    };
    const savedId = saveBike(payload);
    onSaved?.(savedId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Make" name="make" value={form.make} onChange={handleChange} required />
        <Field label="Model" name="model" value={form.model} onChange={handleChange} required />
        <Field label="Year" name="year" value={form.year} onChange={handleChange} required />
        <Field label="Mileage" name="mileage" type="number" min="0" step="1" value={form.mileage} onChange={handleChange} />
        <Select label="Condition" name="condition" value={form.condition} onChange={handleChange} options={["New", "Used", "Ex-Demo"]} />
        <Field label="Price (£)" name="price" type="number" min="0" step="1" value={form.price} onChange={handleChange} />
        <Field label="Colour" name="colour" value={form.colour} onChange={handleChange} />
        <Field label="Registration" name="registration" value={form.registration} onChange={handleChange} />
        <Field label="VIN" name="vin" value={form.vin} onChange={handleChange} />
      </div>

      <div className="pt-2 flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
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
        name={name} value={value} onChange={onChange} type={type} {...rest}
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
        name={name} value={value} onChange={onChange}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}
