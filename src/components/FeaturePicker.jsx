import React, { useEffect, useMemo, useState } from "react";
import { getFeatureFields } from "@/lib/catalog";

/**
 * Props:
 *  - make: string
 *  - model: string
 *  - value: string[]            // selected feature IDs
 *  - onChange: (next: string[]) // called when selection changes
 *  - disabled?: boolean
 */
export default function FeaturePicker({ make, model, value = [], onChange = () => {}, disabled = false }) {
  const groups = useMemo(() => getFeatureFields(make, model), [make, model]);
  const selected = useMemo(() => new Set(value), [value]);

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  const selectAll = () => {
    const allIds = groups.flatMap((g) => g.options.map((o) => o.id));
    onChange(allIds);
  };

  const clearAll = () => onChange([]);

  const groupSelectAll = (group) => {
    const groupIds = group.options.map((o) => o.id);
    const next = new Set(selected);
    groupIds.forEach((id) => next.add(id));
    onChange([...next]);
  };

  const groupClear = (group) => {
    const groupIds = new Set(group.options.map((o) => o.id));
    const next = [...selected].filter((id) => !groupIds.has(id));
    onChange(next);
  };

  if (!make || !model) {
    return (
      <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500">
        Select a make and model to choose features.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-4 bg-white/70">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold">Features (dynamic for {make} {model})</div>
        <div className="flex gap-2">
          <button type="button" onClick={selectAll} disabled={disabled} className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50">
            Select all
          </button>
          <button type="button" onClick={clearAll} disabled={disabled} className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50">
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => {
          const allInGroup = group.options.every((o) => selected.has(o.id));
          const anyInGroup = group.options.some((o) => selected.has(o.id));
          return (
            <div key={group.group} className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">
                  {group.group}
                  <span className="ml-2 text-xs text-gray-500">
                    {anyInGroup ? (allInGroup ? "All selected" : "Partially selected") : ""}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => groupSelectAll(group)}
                    disabled={disabled}
                    className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => groupClear(group)}
                    disabled={disabled}
                    className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50"
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.options.map((opt) => (
                  <label key={opt.id} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      disabled={disabled}
                      checked={selected.has(opt.id)}
                      onChange={() => toggle(opt.id)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
