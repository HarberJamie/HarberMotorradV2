import React from "react";

export default function SpecPanel({ form, update, Field }) {
  return (
    <div className="panel" role="tabpanel" id="panel-spec" aria-labelledby="tab-spec">
      <div className="grid">
        <Field label="Top Box">
          <select value={form.topBox} onChange={update("topBox")}>
            <option value="">Select…</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </Field>
        <Field label="Panniers">
          <select value={form.panniers} onChange={update("panniers")}>
            <option value="">Select…</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </Field>
        <Field label="Engine Bars">
          <select value={form.engineBars} onChange={update("engineBars")}>
            <option value="">Select…</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </Field>
      </div>
    </div>
  );
}
