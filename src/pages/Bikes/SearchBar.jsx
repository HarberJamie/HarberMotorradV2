// src/pages/Bikes/SearchBar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Props:
 *  - onChange: (nextParams: Record<string, string|null>) => void
 *  - className?: string  // optional extra classes (e.g., margins) applied alongside inline styles
 */
export default function SearchBar({ onChange = () => {}, className = "" }) {
  const [params] = useSearchParams();

  // Primary search fields (only these two show in the top bar)
  const [registration, setRegistration] = useState(params.get("registration") || "");
  const [vin, setVin] = useState(params.get("vin") || "");

  // Filters (in a collapsible panel)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [make, setMake] = useState(params.get("make") || "");
  const [model, setModel] = useState(params.get("model") || "");
  const [mileageMin, setMileageMin] = useState(params.get("mileageMin") || "");
  const [mileageMax, setMileageMax] = useState(params.get("mileageMax") || "");
  const [serviceHistory, setServiceHistory] = useState(params.get("serviceHistory") || "");

  // Debounce helper so we don't spam URL updates while typing
  const useDebounced = (value, delay = 300) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
  };

  const debouncedRegistration = useDebounced(registration);
  const debouncedVin = useDebounced(vin);

  // Push primary search to URL params as you type (debounced)
  useEffect(() => {
    if (typeof onChange === "function") {
      onChange({
        registration: debouncedRegistration || null,
        vin: debouncedVin || null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRegistration, debouncedVin]);

  // Helpers
  const hasAnyFilter = useMemo(
    () => !!(make || model || mileageMin || mileageMax || serviceHistory),
    [make, model, mileageMin, mileageMax, serviceHistory]
  );

  const applyFilters = () => {
    if (typeof onChange === "function") {
      onChange({
        make: make || null,
        model: model || null,
        mileageMin: mileageMin || null,
        mileageMax: mileageMax || null,
        serviceHistory: serviceHistory || null,
      });
    }
  };

  const clearAll = () => {
    setRegistration("");
    setVin("");
    setMake("");
    setModel("");
    setMileageMin("");
    setMileageMax("");
    setServiceHistory("");
    if (typeof onChange === "function") {
      onChange({
        registration: null,
        vin: null,
        make: null,
        model: null,
        mileageMin: null,
        mileageMax: null,
        serviceHistory: null,
        bikeId: null, // also clear selection to avoid stale detail view
      });
    }
  };

  // Match ResultsList's wrapper exactly (inline styles)
  const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  };

  return (
    <div className={className} style={cardStyle}>
      {/* Primary search row */}
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-12 md:col-span-4">
          <Label>Registration</Label>
          <input
            type="text"
            inputMode="text"
            placeholder="e.g. YK70 ABC"
            value={registration}
            onChange={(e) => setRegistration(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Search by registration"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <Label>VIN</Label>
          <input
            type="text"
            inputMode="text"
            placeholder="Last 6 or full VIN"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Search by VIN"
          />
        </div>

        <div className="col-span-12 md:col-span-4 flex gap-2 justify-start md:justify-end">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="rounded-xl border border-gray-300 px-3 py-2 hover:bg-gray-50"
            aria-expanded={filtersOpen}
            aria-controls="bike-filters-panel"
          >
            {filtersOpen ? "Hide Filters" : `Show Filters${hasAnyFilter ? " • Active" : ""}`}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border border-gray-300 px-3 py-2 hover:bg-gray-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div
          id="bike-filters-panel"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          className="mt-4 pt-4"
        >
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 sm:col-span-3">
              <Label>Make</Label>
              <input
                type="text"
                placeholder="e.g. BMW"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="col-span-12 sm:col-span-3">
              <Label>Model</Label>
              <input
                type="text"
                placeholder="e.g. R1250GS"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Mileage Min</Label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={mileageMin}
                onChange={(e) => setMileageMin(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Mileage Max</Label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="—"
                value={mileageMax}
                onChange={(e) => setMileageMax(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="col-span-12 sm:col-span-3">
              <Label>Service History</Label>
              <select
                value={serviceHistory}
                onChange={(e) => setServiceHistory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="">Any</option>
                <option value="full">Full</option>
                <option value="partial">Partial</option>
                <option value="none">None</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div className="col-span-12 sm:col-span-9 flex items-end justify-end gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-xl bg-black text-white px-4 py-2 shadow hover:opacity-90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}
