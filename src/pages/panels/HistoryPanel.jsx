import React from "react";

export default function HistoryPanel({ form, update, Field }) {
  return (
    <div className="panel" role="tabpanel" id="panel-history" aria-labelledby="tab-history">
      <div className="grid">
        <Field label="FSH">
          <select value={form.fsh} onChange={update("fsh")}>
            <option value="">Select…</option>
            <option>Yes</option>
            <option>No</option>
            <option>Partial</option>
          </select>
        </Field>
        <Field label="Last Service">
          <input type="date" value={form.lastService} onChange={update("lastService")} />
        </Field>
        <Field label="Miles at last Service">
          <input
            type="number"
            inputMode="numeric"
            value={form.milesAtLastService}
            onChange={update("milesAtLastService")}
          />
        </Field>
        <Field label="Service Book Available">
          <select value={form.serviceBookAvailable} onChange={update("serviceBookAvailable")}>
            <option value="">Select…</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </Field>
        <Field label="MOT Expiry">
          <input type="date" value={form.motExpiry} onChange={update("motExpiry")} />
        </Field>
      </div>
    </div>
  );
}
