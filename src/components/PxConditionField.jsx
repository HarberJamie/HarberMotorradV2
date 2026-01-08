// src/components/PxConditionField.jsx
import React from "react";

/**
 * PxConditionField
 *
 * Used for each condition line item (e.g. Front tyre, Rear tyre, Bodywork, etc.)
 *
 * Props:
 * - label: string                        // Display label
 * - condition: string | {                // Either a legacy string or structured object
 *     notes?: string;
 *     costRequired?: boolean;
 *     estimatedCost?: string | number;
 *   }
 * - onChange: (patch: {
 *     notes?: string;
 *     costRequired?: boolean;
 *     estimatedCost?: string | number;
 *   }) => void
 * - placeholder?: string
 *
 * Behaviour:
 * - Supports legacy string (treated as `notes`).
 * - When "Cost Required" is ticked, Estimated Cost becomes effectively mandatory:
 *   - Input is visually flagged if left blank.
 *   - The data is always written back into the structured condition object, so
 *     other tabs (Summary, Valuation, Insights) can consume it.
 */
export default function PxConditionField({
  label,
  condition,
  onChange,
  placeholder = "",
}) {
  let notes = "";
  let costRequired = false;
  let estimatedCost = "";

  if (typeof condition === "string") {
    // Legacy shape: just a string
    notes = condition;
  } else if (condition && typeof condition === "object") {
    notes = condition.notes || "";
    costRequired = !!condition.costRequired;
    estimatedCost = condition.estimatedCost ?? "";
  }

  const handleNotesChange = (e) => {
    onChange({ notes: e.target.value });
  };

  const handleCostRequiredChange = (e) => {
    const checked = e.target.checked;
    onChange({
      costRequired: checked,
      // If unchecked, clear the estimated cost for safety
      estimatedCost: checked ? estimatedCost : "",
    });
  };

  const handleEstimatedCostChange = (e) => {
    onChange({
      estimatedCost: e.target.value,
    });
  };

  const showCostError =
    costRequired && (estimatedCost === "" || estimatedCost === null);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-medium text-slate-200">
          {label}
        </label>
        <label className="inline-flex items-center gap-1 text-[11px] text-slate-300">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
            checked={costRequired}
            onChange={handleCostRequiredChange}
          />
          <span>Cost Required</span>
        </label>
      </div>

      {/* Notes / description */}
      <input
        type="text"
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-slate-100"
        value={notes}
        onChange={handleNotesChange}
        placeholder={placeholder}
      />

      {/* Estimated Cost */}
      {costRequired && (
        <div className="flex flex-col gap-1">
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
