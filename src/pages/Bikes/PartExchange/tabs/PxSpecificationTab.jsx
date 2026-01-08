// src/pages/Bikes/PartExchange/tabs/PxSpecificationTab.jsx
import React from "react";
import { ACCESSORY_MOD_OPTIONS } from "../usePxPartExchange.js";

export default function PxSpecificationTab({
  bike,
  featureFields = [],
  toggleFeature,
  toggleAccessoryMod,
}) {
  if (!bike) {
    return (
      <p className="text-sm text-slate-400">
        No bike selected for Specification.
      </p>
    );
  }

  const safeToggleFeature =
    toggleFeature || ((key) => console.warn("toggleFeature missing", key));

  const safeToggleAccessoryMod =
    toggleAccessoryMod ||
    ((key) => console.warn("toggleAccessoryMod missing", key));

  const features = bike.features || {};
  const extras = bike.pxSpec?.extras || {};

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Specification</h2>
      <p className="text-xs text-slate-400">
        Model-led Features &amp; Equipment plus accessories and modifications
        that impact valuation and marketing.
      </p>

      {/* Dynamic Features & Equipment – mirrors AddBike */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Features &amp; Equipment
        </h3>
        <p className="text-[11px] text-slate-500 mb-1">
          Driven by catalog where available; falls back to a core list if not
          defined for this bike.
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {featureFields.map((field) => (
            <label
              key={field.key}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100"
            >
              <input
                type="checkbox"
                checked={!!features[field.key]}
                onChange={() => safeToggleFeature(field.key)}
                className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-xs">{field.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Accessories & Mods checklist */}
      <section className="space-y-3 mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Accessories &amp; Non-Standard Items
        </h3>
        <p className="text-[11px] text-slate-500 mb-1">
          Tick anything fitted to this bike that isn&apos;t part of the standard
          factory spec.
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {ACCESSORY_MOD_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100"
            >
              <input
                type="checkbox"
                checked={!!extras[opt.key]}
                onChange={() => safeToggleAccessoryMod(opt.key)}
                className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-xs">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
