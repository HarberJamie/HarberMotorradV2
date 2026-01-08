// src/components/PxServiceHistoryField.jsx
import React from "react";

/**
 * PxServiceHistoryField
 *
 * Used for individual service history fields (e.g. Service History type,
 * Last Service Date, Miles at Last Service, Next Major Service Due).
 *
 * Props:
 * - label: string
 * - type: "select" | "date" | "number" | "text"
 * - value: string | number
 * - onValueChange: (value: string) => void
 * - options?: { value: string, label: string }[]   // for type === "select"
 * - cost?: { costRequired?: boolean, estimatedCost?: string | number }
 * - onCostChange?: (patch: {
 *     costRequired?: boolean;
 *     estimatedCost?: string | number;
 *   }) => void
 *
 * Behaviour:
 * - Always renders the main value field (select / input).
 * - If `onCostChange` is provided, shows:
 *    - "Cost Required" checkbox
 *    - "Estimated Cost (£)" when checked
 * - When "Cost Required" is ticked, Estimated Cost becomes effectively mandatory:
 *   empty value = visually flagged.
 *
 * Data shape is designed to be read later from:
 *   bike.pxSpec.serviceHistoryCosts[fieldKey]
 * so that Summary & Valuation (and Harber insights) can consume these costs.
 */
export default function PxServiceHistoryField({
  label,
  type = "text",
  value,
  onValueChange,
  options = [],
  cost,
  onCostChange,
}) {
  // Safely derive cost fields (handles `cost` being undefined)
  const { costRequired = false, estimatedCost = "" } = cost || {};

  const baseInputClasses =
    "w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100";

  const handleMainChange = (e) => {
    onValueChange(e.target.value);
  };

  const handleCostRequiredChange = (e) => {
    if (!onCostChange) return;
    const checked = e.target.checked;

    onCostChange({
      costRequired: checked,
      // If unchecked, clear the estimated cost for safety
      estimatedCost: checked ? estimatedCost : "",
    });
  };

  const handleEstimatedCostChange = (e) => {
    if (!onCostChange) return;
    onCostChange({
      estimatedCost: e.target.value,
    });
  };

  const showCostControls = typeof onCostChange === "function";
  const showCostError =
    showCostControls &&
    costRequired &&
    (estimatedCost === "" || estimatedCost === null);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-medium text-slate-400">
          {label}
        </label>

        {showCostControls && (
          <label className="inline-flex items-center gap-1 text-[11px] text-slate-300">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
              checked={costRequired}
              onChange={handleCostRequiredChange}
            />
            <span>Cost Required</span>
          </label>
        )}
      </div>

      {/* Main value field */}
      {type === "select" ? (
        <select
          className={baseInputClasses}
          value={value || ""}
          onChange={handleMainChange}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={baseInputClasses}
          value={value || ""}
          onChange={handleMainChange}
        />
      )}

      {/* Estimated Cost controls */}
      {showCostControls && costRequired && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-300">
              Estimated Cost (£)
            </span>
            <input
              type="number"
              min="0"
              step="1"
              className={[
                "w-24 rounded-md bg-slate-900 border px-2 py-1 text-[11px] text-slate-100",
                showCostError
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-700 focus:border-sky-500",
              ].join(" ")}
              value={estimatedCost}
              onChange={handleEstimatedCostChange}
            />
          </div>
          {showCostError && (
            <p className="text-[10px] text-red-400">
              Please enter an estimated cost.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
