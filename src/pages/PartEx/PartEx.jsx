// src/pages/PartEx/PartEx.jsx
import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PartExchangeTab from "@/pages/Bikes/PartExchangeTab.jsx";
import { useBikes } from "@/lib/bikesStore.js";
import { getMakes, getModels } from "@/lib/catalog.js";

// Helper to normalise registration for matching
function normalizeReg(reg) {
  return String(reg || "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

// Known trims by Make|Model – mirrored from AddBike.jsx
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

// Tab labels to mirror the PX workflow
const PX_TABS = [
  { id: "bikeDetails", label: "Bike Details" },
  { id: "specification", label: "Specification" },
  { id: "condition", label: "Condition" },
  { id: "insights", label: "Insights" },
  { id: "valuation", label: "Valuation" },
  // Summary tab lives inside PartExchangeTab
];

function PartEx() {
  const { bikes, addBike, updateBike } = useBikes();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const id = params.get("id");

  // ---------------- New PX form state (when no id is provided) ----------------
  const [newForm, setNewForm] = useState({
    registration: "",
    make: "BMW",
    model: "",
    trim: "",
    vin: "",
    mileage: "",
    modelYear: "",
    // Internal default only – not shown in UI
    source: "PX",
  });

  const [infoMessage, setInfoMessage] = useState("");

  // Catalogue-driven options for the "Add PX Bike" form
  const makeOptions = useMemo(
    () => getMakes().map((m) => m),
    []
  );

  const modelOptions = useMemo(
    () =>
      newForm.make
        ? getModels(newForm.make).map((m) => m)
        : [],
    [newForm.make]
  );

  const trimOptions = useMemo(() => {
    if (!newForm.make || !newForm.model) return [];
    const key = `${newForm.make}|${newForm.model}`;
    const list = TRIMS_BY_MODEL[key] || [];
    return list;
  }, [newForm.make, newForm.model]);

  const handleNewChange = (field) => (e) => {
    const value = e.target.value;

    // If they start changing the reg again, clear any previous info
    if (field === "registration" && infoMessage) {
      setInfoMessage("");
    }

    setNewForm((prev) => {
      let next = { ...prev, [field]: value };

      // Special logic: when registration changes, cross-reference bikes list
      if (field === "registration") {
        const clean = normalizeReg(value);
        if (clean) {
          const match = bikes.find(
            (b) => normalizeReg(b.registration) === clean
          );

          if (match) {
            if (!prev.make && match.make) next.make = match.make;
            if (!prev.model && match.model) next.model = match.model;
            if (!prev.trim && match.trim) next.trim = match.trim;
            if (!prev.vin && match.vin) next.vin = match.vin;
            if (!prev.mileage && (match.totalMiles || match.mileage)) {
              next.mileage = String(match.totalMiles ?? match.mileage ?? "");
            }
            if (!prev.modelYear && match.modelYear) {
              next.modelYear = match.modelYear;
            }

            // Do NOT override PX source from matches – PX flow always creates PX
            // next.source stays "PX"
          }
        }
      }

      return next;
    });
  };

  const handleCreatePxBike = (e) => {
    e.preventDefault();

    const cleanReg = normalizeReg(newForm.registration.toUpperCase());
    if (!cleanReg) return;

    // 🔍 Check if there is already a PX bike in progress for this reg
    const existingPx = bikes.find((b) => {
      const src = b.acquisition?.source || b.source;
      if (src !== "PX") return false;

      const inProcess =
        b.status === "Valuation" || b.status === "PX Submitted";
      if (!inProcess) return false;

      return normalizeReg(b.registration) === cleanReg;
    });

    if (existingPx) {
      // Brief info message + navigate into existing PX workflow
      setInfoMessage(
        `This registration already has a PX valuation in progress (${existingPx.status}). Redirecting you to the existing workflow.`
      );
      navigate(`/part-exchange?id=${existingPx.id}`);
      return;
    }

    const pxId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `px-${Date.now()}`;

    const newBike = {
      id: pxId,
      registration: cleanReg,
      make: newForm.make.trim(),
      model: newForm.model.trim(),
      trim: newForm.trim.trim(),
      vin: newForm.vin.trim(),
      totalMiles: newForm.mileage ? Number(newForm.mileage) : null,
      modelYear: newForm.modelYear.trim(),

      status: "Valuation",
      // Top-level source always PX for this flow
      source: "PX",

      acquisition: {
        // Acquisition source always PX for bikes created via this PX flow
        source: "PX",
        buyInPrice: null,
        acquiredAt: null,
        linkedDealId: null,
        linkedPxValuationId: null,
      },

      valuations: [],
      events: [],
    };

    addBike(newBike);
    navigate(`/part-exchange?id=${pxId}`);
  };

  // ---------------- Derive "Open" & "Submitted" Valuations --------------------

  const pxBikes = bikes.filter((b) => {
    const src = b.acquisition?.source || b.source;
    return src === "PX";
  });

  const openValuations = pxBikes
    .filter((b) => b.status === "Valuation")
    .sort((a, b) => {
      const aTime = a.acquisition?.createdAt || a.acquisition?.acquiredAt || 0;
      const bTime = b.acquisition?.createdAt || b.acquisition?.acquiredAt || 0;
      return Number(bTime) - Number(aTime);
    });

  const submittedValuations = pxBikes
    .filter((b) => b.status === "PX Submitted")
    .sort((a, b) => {
      const aTime = a.acquisition?.submittedAt || a.acquisition?.createdAt || 0;
      const bTime = b.acquisition?.submittedAt || b.acquisition?.createdAt || 0;
      return Number(bTime) - Number(aTime);
    });

  // ---------------- New PX mode (no id) ----------------
  if (!id) {
    return (
      <div className="px-4 py-4">
        {/* Header card */}
        <header className="space-y-1 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl px-4 py-4 shadow">
          <h1 className="text-2xl font-bold text-slate-50">
            Part Exchange – Add PX Bike
          </h1>
          <p className="text-sm text-slate-300">
            Capture the basic details for a new part-exchange or buy-in bike.
            If this registration already exists in stock, we&apos;ll pre-fill
            the remaining fields for you.
          </p>
        </header>

        {/* Info message if we're redirecting due to existing PX */}
        {infoMessage && (
          <div className="mt-3 rounded-xl border border-sky-700 bg-sky-900/30 px-4 py-3 text-sm text-sky-100">
            {infoMessage}
          </div>
        )}

        {/* GAP between header card and PX fields */}
        <div className="h-10" />

        {/* Form + lists */}
        <div>
          {/* Tabs + form wrapper */}
          <div>
            {/* Tab header – visual only here (Bike Details active) */}
            <div className="flex gap-2 border-b border-slate-700">
              {PX_TABS.map((tab, index) => {
                const isActive = index === 0; // Only Bike Details active in this mode
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={!isActive}
                    className={[
                      "px-3 py-2 text-base font-medium rounded-t-md transition-colors",
                      isActive
                        ? "bg-slate-800 text-white border-x border-t border-slate-700"
                        : "text-slate-500 bg-slate-900 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab body-style wrapper to match PX workflow layout */}
            <div className="rounded-b-2xl rounded-tr-2xl bg-slate-900/80 border border-slate-700 p-4 shadow">
              <form
                onSubmit={handleCreatePxBike}
                className="grid gap-8 md:grid-cols-2"
              >
                <div className="space-y-6">
                  {/* Registration (text) */}
                    <Field
                      label="Registration"
                      value={newForm.registration}
                      onChange={(e) => {
                        const upper = e.target.value.toUpperCase();
                        handleNewChange("registration")({ target: { value: upper } });
                      }}
                      required
                    />  

                  {/* Make – dropdown from catalogue */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Make
                    </label>
                    <select
                      value={newForm.make}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewForm((prev) => ({
                          ...prev,
                          make: value,
                          model: "",
                          trim: "",
                        }));
                      }}
                      className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    >
                      <option value="">Select make…</option>
                      {makeOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model – dependent on make */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Model
                    </label>
                    <select
                      value={newForm.model}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewForm((prev) => ({
                          ...prev,
                          model: value,
                          trim: "",
                        }));
                      }}
                      disabled={!newForm.make}
                      className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {newForm.make
                          ? "Select model…"
                          : "Choose make first…"}
                      </option>
                      {modelOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Trim / Variant – dropdown if known, else free text */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Trim / Variant
                    </label>
                    {trimOptions.length > 0 ? (
                      <select
                        value={newForm.trim}
                        onChange={(e) =>
                          setNewForm((prev) => ({
                            ...prev,
                            trim: e.target.value,
                          }))
                        }
                        disabled={!newForm.make || !newForm.model}
                        className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {newForm.make && newForm.model
                            ? "Select trim…"
                            : "Choose make & model first…"}
                        </option>
                        {trimOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={newForm.trim}
                        onChange={handleNewChange("trim")}
                        className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="TE, Sport, Triple Black..."
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <Field
                    label="VIN"
                    value={newForm.vin}
                    onChange={handleNewChange("vin")}
                  />
                  <Field
                    label="Mileage"
                    type="number"
                    value={newForm.mileage}
                    onChange={handleNewChange("mileage")}
                  />
                  <Field
                    label="Model Year"
                    value={newForm.modelYear}
                    onChange={handleNewChange("modelYear")}
                  />

                  {/* No Source field shown – always PX behind the scenes */}

                  <button
                    type="submit"
                    className="mt-6 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white w-full md:w-auto"
                  >
                    Save &amp; Continue to PX Workflow
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* BIG GAP below the form */}
          <div className="h-10" />

          {/* ---------------- Open Valuations section ---------------- */}
          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              Open Valuations
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              Any PX bike that has been started in the workflow but not yet
              submitted will appear here so you can quickly resume where you
              left off.
            </p>

            {openValuations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6">
                <p className="text-sm text-slate-400">
                  No open valuations at the moment. As soon as you begin a
                  part-exchange appraisal, it will be listed here until the
                  valuation is submitted.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/60">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Registration
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Bike
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Miles
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {openValuations.map((b) => (
                      <tr
                        key={b.id}
                        className="border-t border-slate-800/60 hover:bg-slate-900/60 transition"
                      >
                        <td className="px-4 py-2 text-slate-100">
                          {b.registration || "—"}
                        </td>
                        <td className="px-4 py-2 text-slate-200">
                          {[b.make, b.model, b.trim]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </td>
                        <td className="px-4 py-2 text-slate-200">
                          {Number.isFinite(Number(b.totalMiles))
                            ? `${Number(b.totalMiles).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-slate-300">
                          {b.status || "Valuation"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/part-exchange?id=${b.id}`)
                            }
                            className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white"
                          >
                            Resume
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* CLEAR GAP between Open + Submitted lists */}
          <div className="h-8" />

          {/* --------------- Submitted Valuations section ---------------- */}
          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              Submitted Valuations
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              PX appraisals that have been submitted and are waiting for manager
              approval or a final decision.
            </p>

            {submittedValuations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6">
                <p className="text-sm text-slate-400">
                  No submitted valuations yet. Once a PX workflow is submitted,
                  it will be shown here until it&apos;s approved or rejected.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/60">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Registration
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Bike
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Miles
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittedValuations.map((b) => (
                      <tr
                        key={b.id}
                        className="border-t border-slate-800/60 hover:bg-slate-900/60 transition"
                      >
                        <td className="px-4 py-2 text-slate-100">
                          {b.registration || "—"}
                        </td>
                        <td className="px-4 py-2 text-slate-200">
                          {[b.make, b.model, b.trim]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </td>
                        <td className="px-4 py-2 text-slate-200">
                          {Number.isFinite(Number(b.totalMiles))
                            ? `${Number(b.totalMiles).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-slate-300">
                          {b.status || "PX Submitted"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/part-exchange?id=${b.id}`)
                            }
                            className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ---------------- Existing-bike PX mode (id present) ----------------
  const bike = bikes.find((b) => String(b.id) === String(id));

  if (!bike) {
    return (
      <div className="px-4 py-4">
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
          <h1 className="text-xl font-bold text-red-300 mb-1">
            PX Bike Not Found
          </h1>
          <p className="text-sm text-red-400">
            No bike exists with id &quot;{id}&quot;. It may have been removed or
            not yet saved.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = (patch) => {
    if (!bike?.id) return;
    updateBike(bike.id, patch);
  };

  return (
    <div className="px-4 py-4">
      {/* Header card */}
      <header className="space-y-1 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl px-4 py-4 shadow">
        <h1 className="text-2xl font-bold text-slate-50">
          Part Exchange – {bike.registration || "Unregistered bike"}
        </h1>
        <p className="text-sm text-slate-300">
          Appraisal, QoR checks and valuation workflow for this bike. Any
          valuations you approve will be written as Events and visible in the
          bike&apos;s History tab, and the approved Buy In Price will be shown
          in the bike details.
        </p>
      </header>

      {/* Gap between header and tabbed workflow */}
      <div style={{ marginTop: "24px" }}>
        <PartExchangeTab
          bike={bike}
          onSave={handleSave}
          onOpenDeal={() => {
            console.log("Open / link deal for bike", bike.id);
          }}
        />
      </div>
    </div>
  );
}

// Simple reusable field for the New PX form
function Field({ label, type = "text", value, onChange, options, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      {type === "select" ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
        >
          {(options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
        />
      )}
    </div>
  );
}

export default PartEx;
