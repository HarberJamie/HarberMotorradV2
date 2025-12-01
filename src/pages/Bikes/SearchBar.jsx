// src/pages/Bikes/SearchBar.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getMakes, getModels } from "@/lib/catalog.js";

export default function SearchBar({ onChange = () => {}, className = "" }) {
  const [params] = useSearchParams();

  // ---- State ----
  const [registration, setRegistration] = useState(
    params.get("registration") || ""
  );
  const [vin, setVin] = useState(params.get("vin") || "");
  const [keyword, setKeyword] = useState(params.get("keyword") || "");
  const [make, setMake] = useState(params.get("make") || "BMW");
  const [model, setModel] = useState(params.get("model") || "");
  const [trim, setTrim] = useState(params.get("trim") || "");
  const [modelYear, setModelYear] = useState(params.get("modelYear") || "");
  const [mileageMin, setMileageMin] = useState(
    params.get("mileageMin") || ""
  );
  const [mileageMax, setMileageMax] = useState(
    params.get("mileageMax") || ""
  );
  const [priceMin, setPriceMin] = useState(params.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(params.get("priceMax") || "");
  const [status, setStatus] = useState(
    params.get("status") || "Available" // Default filter
  );
  const [vatQualifying, setVatQualifying] = useState(
    params.get("vatQualifying") || ""
  );

  // ---- Trim map (same idea as AddBike) ----
  const TRIMS_BY_MODEL = {
    "BMW|R 1300 GS": ["Base", "TE", "TE Low", "GS Trophy"],
    "BMW|R 1250 GS": ["Base", "TE", "Rallye TE"],
    "BMW|R 1250 GS Adventure": ["TE", "Rallye TE"],
    "BMW|S 1000 R": ["Sport", "M Sport"],
    "BMW|S 1000 XR": ["TE", "Sport", "M Sport"],
    "BMW|F 900 XR": ["SE", "TE"],
    "BMW|F 900 R": ["SE", "Sport"],
    "BMW|R 18": ["First Edition", "Classic", "B", "Transcontinental"],
  };

  // ---- Dropdown options ----
  const makeOptions = useMemo(
    () => getMakes().map((m) => ({ value: m, label: m })),
    []
  );

  const modelOptions = useMemo(
    () =>
      make
        ? getModels(make).map((m) => ({ value: m, label: m }))
        : [],
    [make]
  );

  const trimOptions = useMemo(() => {
    if (!make || !model) return [];
    const key = `${make}|${model}`;
    const list = TRIMS_BY_MODEL[key] || [];
    return list.map((t) => ({ value: t, label: t }));
  }, [make, model]);

  // ---- Helpers ----
  const buildFilterPayload = (overrides = {}) => ({
    registration,
    vin,
    keyword,
    status,
    make,
    model,
    trim,
    modelYear,
    mileageMin,
    mileageMax,
    priceMin,
    priceMax,
    vatQualifying,
    ...overrides,
  });

  // ---- Actions ----
  const applyFilters = () => {
    onChange(buildFilterPayload());
  };

  const clearFilters = () => {
    // Reset local state
    setRegistration("");
    setVin("");
    setKeyword("");
    setStatus("Available");
    setMake("BMW");
    setModel("");
    setTrim("");
    setModelYear("");
    setMileageMin("");
    setMileageMax("");
    setPriceMin("");
    setPriceMax("");
    setVatQualifying("");

    // Immediately push cleared/default filters to parent
    onChange(
      buildFilterPayload({
        registration: "",
        vin: "",
        keyword: "",
        status: "Available",
        make: "BMW",
        model: "",
        trim: "",
        modelYear: "",
        mileageMin: "",
        mileageMax: "",
        priceMin: "",
        priceMax: "",
        vatQualifying: "",
      })
    );
  };

  // 🔹 Apply default filters once on mount so "Available" is honoured immediately
  useEffect(() => {
    onChange(buildFilterPayload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Shared styles ----
  const fieldClass =
    "w-full rounded-md bg-[#1e2235] border border-[#2a2f45] text-gray-100 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none";
  const labelClass = "block text-sm text-gray-300 mb-1";

  // ---- Layout ----
  return (
    <div className={`bg-[#15182b] p-6 rounded-xl shadow-md ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* ---------- Row 1 ---------- */}
        <div>
          <label className={labelClass}>Registration</label>
          <input
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder="e.g. YK70 ABC"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>VIN</label>
          <input
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="Last 7 or full VIN"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Keyword</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Features, specs, colour..."
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Make</label>
          <select
            value={make}
            onChange={(e) => {
              const nextMake = e.target.value;
              setMake(nextMake);
              setModel("");
              setTrim("");
            }}
            className={fieldClass}
          >
            {makeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ---------- Row 2 ---------- */}
        <div>
          <label className={labelClass}>Model</label>
          <select
            value={model}
            onChange={(e) => {
              const nextModel = e.target.value;
              setModel(nextModel);
              setTrim("");
            }}
            disabled={!make}
            className={fieldClass}
          >
            <option value="">Any</option>
            {modelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Trim</label>
          <select
            value={trim}
            onChange={(e) => setTrim(e.target.value)}
            disabled={!make || !model || trimOptions.length === 0}
            className={fieldClass}
          >
            <option value="">Any</option>
            {trimOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Model Year</label>
          <input
            value={modelYear}
            onChange={(e) => setModelYear(e.target.value)}
            placeholder="e.g. 2024"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={fieldClass}
          >
            <option value="Available">Available</option>
            <option value="Valuation">Valuation</option>
            <option value="Offer">Offer</option>
            <option value="Sold">Sold</option>
            <option value="Service">Service</option>
            <option value="Demonstrator">Demonstrator</option>
            <option value="Loan Bike">Loan Bike</option>
            <option value="">Any</option>
          </select>
        </div>

        {/* ---------- Row 3 ---------- */}
        <div>
          <label className={labelClass}>VAT Qualifying</label>
          <select
            value={vatQualifying}
            onChange={(e) => setVatQualifying(e.target.value)}
            className={fieldClass}
          >
            <option value="">Any</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Mileage Min</label>
          <input
            value={mileageMin}
            onChange={(e) => setMileageMin(e.target.value)}
            placeholder="0"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Mileage Max</label>
          <input
            value={mileageMax}
            onChange={(e) => setMileageMax(e.target.value)}
            placeholder="e.g. 15000"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Min Price (£)</label>
          <input
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="e.g. 7999"
            className={fieldClass}
          />
        </div>

        {/* ---------- Row 4 ---------- */}
        <div>
          <label className={labelClass}>Max Price (£)</label>
          <input
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="e.g. 18999"
            className={fieldClass}
          />
        </div>
      </div>

      {/* ---------- Buttons ---------- */}
      <div className="flex justify-end items-center gap-3 mt-6">
        <button
          type="button"
          onClick={clearFilters}
          className="bg-[#2b2f45] text-gray-300 px-5 py-2 rounded-md hover:bg-[#343853] transition"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
