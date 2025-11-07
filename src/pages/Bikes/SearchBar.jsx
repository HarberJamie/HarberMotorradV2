// src/pages/Bikes/SearchBar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Props:
 *  - onChange: (nextParams: Record<string, string|null>) => void
 *  - className?: string
 */
export default function SearchBar({ onChange = () => {}, className = "" }) {
  const [params] = useSearchParams();

  // ---------------- Primary (always visible) ----------------
  const [registration, setRegistration] = useState(params.get("registration") || "");
  const [vin, setVin] = useState(params.get("vin") || "");

  // ---------------- Advanced (collapsible) ------------------
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [make, setMake] = useState(params.get("make") || "");
  const [model, setModel] = useState(params.get("model") || "");
  const [mileageMin, setMileageMin] = useState(params.get("mileageMin") || "");
  const [mileageMax, setMileageMax] = useState(params.get("mileageMax") || "");

  // New filters
  // Default status to "Available" if none present in URL
  const initialStatus = params.get("status") || "Available";
  const [status, setStatus] = useState(initialStatus);
  const [modelYear, setModelYear] = useState(params.get("modelYear") || "");
  const [priceMin, setPriceMin] = useState(params.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(params.get("priceMax") || "");
  const [vatQualifying, setVatQualifying] = useState(params.get("vatQualifying") || "");

  // Service History — intentionally hidden for now (kept for future use)
  // const [serviceHistory, setServiceHistory] = useState(params.get("serviceHistory") || "");

  // Debounce helper so we don't spam updates while typing
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

  // On mount: if there is no status in URL, explicitly emit Status="Available"
  useEffect(() => {
    const urlStatus = params.get("status");
    if (!urlStatus) {
      onChange({ status: "Available" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push primary search to consumer (debounced)
  useEffect(() => {
    onChange({
      registration: debouncedRegistration || null,
      vin: debouncedVin || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRegistration, debouncedVin]);

  // Any active filter? (don’t count the default “Available” as active)
  const hasAnyFilter = useMemo(
    () =>
      !!(
        make ||
        model ||
        mileageMin ||
        mileageMax ||
        modelYear ||
        priceMin ||
        priceMax ||
        vatQualifying ||
        (status && status !== "Available")
        // || serviceHistory
      ),
    [make, model, mileageMin, mileageMax, modelYear, priceMin, priceMax, vatQualifying, status]
  );

  // Apply advanced filters (primary fields are handled by the debounced effect)
  const applyFilters = () => {
    onChange({
      make: make || null,
      model: model || null,
      mileageMin: mileageMin || null,
      mileageMax: mileageMax || null,
      status: status || "Available", // force default if somehow empty
      modelYear: modelYear || null,
      priceMin: priceMin || null,
      priceMax: priceMax || null,
      vatQualifying:
        vatQualifying === "yes" ? "true" : vatQualifying === "no" ? "false" : null,
      // serviceHistory: serviceHistory || null,
    });
  };

  // Clear everything but keep Status at default "Available"
  const clearAll = () => {
    setRegistration("");
    setVin("");
    setMake("");
    setModel("");
    setMileageMin("");
    setMileageMax("");
    setStatus("Available");
    setModelYear("");
    setPriceMin("");
    setPriceMax("");
    setVatQualifying("");
    // setServiceHistory("");

    onChange({
      registration: null,
      vin: null,
      make: null,
      model: null,
      mileageMin: null,
      mileageMax: null,
      status: "Available", // ← default persists
      modelYear: null,
      priceMin: null,
      priceMax: null,
      vatQualifying: null,
      // serviceHistory: null,
      bikeId: null, // clear selection
    });
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
            placeholder="Last 7 or full VIN"
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
                placeholder="e.g. R1300 GS"
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
                onChange={(e) => setMileageMin(e.target.value.replace(/[^\d]/g, ""))}
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
                onChange={(e) => setMileageMax(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="col-span-12 sm:col-span-3">
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {/* Default is "Available"; user must select to change */}
                <option value="Available">Available</option>
                <option value="Any">Any</option>
                <option value="Sold">Sold</option>
                <option value="Valuation">Valuation</option>
              </select>
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Model Year</Label>
              <input
                type="number"
                min="1980"
                step="1"
                placeholder="e.g. 2024"
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Min Price (£)</Label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 7999"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>Max Price (£)</Label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 18999"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <Label>VAT Qualifying</Label>
              <select
                value={vatQualifying}
                onChange={(e) => setVatQualifying(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Service History — keep for later re-enable
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
            */}
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
