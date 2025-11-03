// src/pages/Bikes/BikesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import ResultsList from "./ResultsList.jsx";
import SelectedBike from "./SelectedBike.jsx";
import Modal from "@/components/Modal.jsx";

const BIKES_STORAGE_KEY = "harbermotorrad:bikes";

function getBikes() {
  try {
    return JSON.parse(localStorage.getItem(BIKES_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function setBikes(next) {
  localStorage.setItem(BIKES_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bikes:updated", { detail: next }));
}

export default function BikesPage() {
  const [params, setParams] = useSearchParams();

  // data
  const [bikes, setBikesState] = useState(getBikes());
  useEffect(() => {
    const onUpdate = (e) => setBikesState(e.detail);
    window.addEventListener("bikes:updated", onUpdate);
    return () => window.removeEventListener("bikes:updated", onUpdate);
  }, []);

  // selection
  const [selectedId, setSelectedId] = useState(null);

  // modals
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // search handlers
  const handleSearchChange = (next) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v == null || v === "") merged.delete(k);
      else merged.set(k, v);
    });
    setParams(merged);
  };

  const filtered = useMemo(() => {
    const reg = (params.get("registration") || "").trim().toLowerCase();
    const vin = (params.get("vin") || "").trim().toLowerCase();
    return bikes.filter((b) => {
      const okReg = !reg || (b.registration || "").toLowerCase().includes(reg);
      const okVin = !vin || (b.vin || "").toLowerCase().includes(vin);
      return okReg && okVin;
    });
  }, [bikes, params]);

  // list click
  const openDetails = (id) => {
    setSelectedId(id);
    setIsDetailsOpen(true);
  };

  // add bike draft
  const [draft, setDraft] = useState({
    make: "",
    model: "",
    year: "",
    registration: "",
    vin: "",
    mileage: "",
    colour: "",
    notes: "",
  });

  const updateDraft = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

  const resetDraft = () =>
    setDraft({
      make: "",
      model: "",
      year: "",
      registration: "",
      vin: "",
      mileage: "",
      colour: "",
      notes: "",
    });

  const saveNewBike = () => {
    const id = crypto.randomUUID();
    const next = [...bikes, { id, ...draft, createdAt: Date.now() }];
    setBikes(next);
    setBikesState(next);
    resetDraft();
    setIsAddOpen(false);
  };

  // shared inline “card” look to match Deals.jsx / ResultsList.jsx
  const boxStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  };
  const thTdPad = { padding: 8 };
  const headerRowStyle = { textAlign: "left", background: "#1b2143" };
  const rowBorder = { borderTop: "1px solid rgba(255,255,255,0.08)" };

  // NOTE: SelectedBike currently styles for a LIGHT panel.
  // When SelectedBike supports a dark theme, change the line below to: const detailsVariant = "dark";
  const detailsVariant = "light";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Bike Catalog</h1>
        <button
          className="rounded-2xl px-4 py-2 border shadow-sm hover:shadow transition"
          onClick={() => setIsAddOpen(true)}
        >
          + Add Bike
        </button>
      </div>

      <SearchBar onChange={handleSearchChange} />

      <div className="grid md:grid-cols-[540px,1fr] gap-4">
        <ResultsList
          selectedId={selectedId}
          onSelect={openDetails}
          bikes={filtered}
        />
        <div className="hidden md:block" style={boxStyle}>
          <h2 style={{ margin: 0, marginBottom: 12 }}>Details</h2>
          <p style={{ opacity: 0.8 }}>Select a bike to view details.</p>
        </div>
      </div>

      {/* Bike Details Modal */}
      <Modal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Bike details"
        variant={detailsVariant}
      >
        {selectedId ? (
          <SelectedBike
            id={selectedId}
            onClose={() => setIsDetailsOpen(false)}
          />
        ) : (
          <p>No bike selected</p>
        )}
      </Modal>

      {/* Add Bike Modal — styled like Deals/Results/Selected */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add a bike"
        initialFocusSelector="#make"
        variant="light"
      >
        <div style={boxStyle}>
          <h2 style={{ margin: 0, marginBottom: 12 }}>Add Bike</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveNewBike();
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={headerRowStyle}>
                    <th style={thTdPad}>Field</th>
                    <th style={thTdPad}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={rowBorder}>
                    <td style={thTdPad}>Make</td>
                    <td style={thTdPad}>
                      <Input
                        id="make"
                        value={draft.make}
                        onChange={(e) => updateDraft("make", e.target.value)}
                        required
                      />
                    </td>
                  </tr>
                  <tr style={rowBorder}>
                    <td style={thTdPad}>Model</td>
                    <td style={thTdPad}>
                      <Input
                        id="model"
                        value={draft.model}
                        onChange={(e) => updateDraft("model", e.target.value)}
                        required
                      />
                    </td>
                  </tr>
                  <tr style={rowBorder}>
                    <td style={thTdPad}>Year</td>
                    <td style={thTdPad}>
                      <Input
                        id="year"
                        placeholder="2021"
                        value={draft.year}
                        onChange={(e) => updateDraft("year", e.target.value)}
                        inputMode="numeric"
                      />
                    </td>
                  </tr>
                  <tr style={rowBorder}>
                    <td style={thTdPad}>Registration</td>
                    <td style={thTdPad}>
                      <Input
                        id="registration"
                        value={draft.registration}
                        onChange={(e) => updateDraft("registration", e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr style={rowBorder}>
                    <td style={thTdPad}>VIN</td>
                    <td style={thTdPad}>
                      <Input
                        id="vin"
                        value={draft.vin}
                        onChange={(e) => updateDraft("vin", e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr style={rowBorder}>
                    <td style={thTdPad}>Mileage</td>
                    <td style={thTdPad}>
                      <Input
                        id="mileage"
                        value={draft.mileage}
                        onChange={(e) => updateDraft("mileage", e.target.value)}
                        inputMode="numeric"
                      />
                    </td>
                  </tr>
                  <tr style={rowBorder}>
                    <td style={thTdPad}>Colour</td>
                    <td style={thTdPad}>
                      <Input
                        id="colour"
                        value={draft.colour}
                        onChange={(e) => updateDraft("colour", e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr style={rowBorder}>
                    <td style={thTdPad}>Notes</td>
                    <td style={thTdPad}>
                      <textarea
                        id="notes"
                        rows={4}
                        value={draft.notes}
                        onChange={(e) => updateDraft("notes", e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.2)",
                          padding: 8,
                          background: "transparent",
                          color: "inherit",
                          resize: "vertical",
                          minHeight: 80,
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                }}
              >
                Save Bike
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.2)",
        padding: 8,
        background: "transparent",
        color: "inherit",
      }}
    />
  );
}
