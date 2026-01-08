// src/pages/Bikes/PartExchange/tabs/PxBikeDetailsTab.jsx
import React from "react";
import { APPRAISERS } from "../usePxPartExchange.js";

export default function PxBikeDetailsTab({
  bike,
  makeOptions = [],
  modelOptions = [],
  trimOptions = [],
  linkedDeal = {},
  onSave,
  updateAppraisal,
  updateFinance,
  updateLinkedDeal,
  getNowLocalDateTime,
  attachHpiDocument,
  markHpiClear,
  hasHpiClear,
  financeAnswered,
}) {
  if (!bike) return null;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Left: basic PX details, finance, linked deal */}
        <section className="rounded-2xl bg-slate-900/80 p-5 shadow">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Basic PX Details
          </h2>

          <div className="space-y-4">
            {/* Make / Model / Trim – mirroring AddBike */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Make */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Make
                </label>
                <select
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  value={bike.make || ""}
                  onChange={(e) => {
                    const nextMake = e.target.value || "";
                    onSave({
                      make: nextMake,
                      model: "",
                      trim: "",
                    });
                  }}
                >
                  <option value="">Select make…</option>
                  {makeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Model
                </label>
                <select
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  value={bike.model || ""}
                  onChange={(e) => {
                    const nextModel = e.target.value || "";
                    onSave({
                      model: nextModel,
                      trim: "",
                    });
                  }}
                  disabled={!bike.make}
                >
                  <option value="">
                    {bike.make ? "Select model…" : "Choose make first…"}
                  </option>
                  {modelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trim / Variant */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Trim / Variant
                </label>
                {trimOptions.length > 0 ? (
                  <select
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    value={bike.trim || ""}
                    onChange={(e) =>
                      onSave({
                        trim: e.target.value || "",
                      })
                    }
                    disabled={!bike.make || !bike.model}
                  >
                    <option value="">
                      {bike.make && bike.model
                        ? "Select trim…"
                        : "Choose make & model first…"}
                    </option>
                    {trimOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    value={bike.trim || ""}
                    onChange={(e) =>
                      onSave({
                        trim: e.target.value,
                      })
                    }
                    placeholder="TE, Sport, Triple Black..."
                  />
                )}
              </div>
            </div>

            {/* Customer price + appraiser info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Customer&apos;s valuation (£)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  value={bike.appraisal?.customerValuation || ""}
                  onChange={(e) =>
                    updateAppraisal({
                      customerValuation: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Appraised by
                </label>
                <select
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  value={bike.appraisal?.appraisedBy || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const next = {
                      ...(bike.appraisal || {}),
                      appraisedBy: value,
                    };

                    // Auto-stamp appraisedAt if it isn't already set
                    if (!next.appraisedAt && value) {
                      next.appraisedAt = getNowLocalDateTime();
                    }

                    onSave({ appraisal: next });
                  }}
                >
                  <option value="">Select appraiser…</option>
                  {APPRAISERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Appraised at
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  value={bike.appraisal?.appraisedAt || ""}
                  onChange={(e) =>
                    updateAppraisal({ appraisedAt: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Finance question about the PX bike */}
            <div className="border-t border-slate-800 pt-4 mt-2">
              <p className="text-xs font-semibold text-slate-300 mb-2">
                Outstanding Finance on PX (QoR required)
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-slate-200">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    className="accent-blue-500"
                    checked={bike.finance?.hasFinance === true}
                    onChange={() => updateFinance({ hasFinance: true })}
                  />
                  <span>Yes</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    className="accent-blue-500"
                    checked={bike.finance?.hasFinance === false}
                    onChange={() => updateFinance({ hasFinance: false })}
                  />
                  <span>No</span>
                </label>
              </div>

              {bike.finance?.hasFinance === true && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Settlement amount (£)
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                      value={bike.finance?.settlementAmount || ""}
                      onChange={(e) =>
                        updateFinance({
                          settlementAmount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Finance provider
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                      value={bike.finance?.provider || ""}
                      onChange={(e) =>
                        updateFinance({ provider: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Linked Deal (new bike context) */}
            <div className="border-t border-slate-800 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Linked Deal (New Bike)
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Link this PX to the bike the customer is buying so we can
                build a full deal and profit chain.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Registration of new / stock bike */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Sale bike registration
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    placeholder="e.g. DE22 XYZ"
                    value={linkedDeal.targetRegistration || ""}
                    onChange={(e) =>
                      updateLinkedDeal({
                        targetRegistration: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                {/* Finance required on new bike */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Finance required on new bike?
                  </label>
                  <div className="flex items-center gap-4 text-sm text-slate-200">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        className="accent-blue-500"
                        checked={linkedDeal.financeRequired === true}
                        onChange={() =>
                          updateLinkedDeal({ financeRequired: true })
                        }
                      />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        className="accent-blue-500"
                        checked={linkedDeal.financeRequired === false}
                        onChange={() =>
                          updateLinkedDeal({ financeRequired: false })
                        }
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Additional deposit on new bike */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Additional deposit on new bike (£)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    placeholder="0"
                    value={
                      linkedDeal.additionalDeposit !== undefined &&
                      linkedDeal.additionalDeposit !== null
                        ? linkedDeal.additionalDeposit
                        : ""
                    }
                    onChange={(e) =>
                      updateLinkedDeal({
                        additionalDeposit: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {linkedDeal.createdDealId && (
                <p className="mt-2 text-[11px] text-emerald-400">
                  Linked Deal already created (ID:{" "}
                  <span className="font-mono">
                    {linkedDeal.createdDealId}
                  </span>
                  ). Submitting again won&apos;t create a duplicate.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Right: Checks & Compliance (HPI + QoR summary) */}
        <section className="rounded-2xl bg-slate-900/80 p-5 shadow">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Checks &amp; Compliance
          </h2>

          {/* HPI */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-300">
                HPI / Provenance (must be done before valuation)
              </p>
              <span className="text-xs rounded-full px-2 py-1 bg-slate-800 text-slate-200">
                {bike.hpiReport?.status || "NotStarted"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
                onClick={markHpiClear}
              >
                Mark HPI as Clear
              </button>

              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700"
                onClick={attachHpiDocument}
              >
                Attach HPI report (placeholder)
              </button>

              <p className="text-[11px] text-slate-400">
                Attached HPI reports:{" "}
                <span className="font-semibold text-slate-200">
                  {Array.isArray(bike.hpiReport?.documents)
                    ? bike.hpiReport.documents.length
                    : 0}
                </span>
              </p>

              <p className="text-[11px] text-slate-500">
                v1: HPI status and attachments are stored against this
                bike for audit. Later this will integrate with a live HPI
                API and real file uploads.
              </p>
            </div>
          </div>

          {/* QoR status mini-summary */}
          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs font-semibold text-slate-300 mb-2">
              QoR submission checklist
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1">
              <li>
                • HPI done:{" "}
                <span
                  className={
                    hasHpiClear ? "text-green-400" : "text-red-400"
                  }
                >
                  {hasHpiClear ? "Yes" : "No"}
                </span>
              </li>
              <li>
                • Finance question answered (PX):{" "}
                <span
                  className={
                    financeAnswered ? "text-green-400" : "text-red-400"
                  }
                >
                  {financeAnswered ? "Yes" : "No"}
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
