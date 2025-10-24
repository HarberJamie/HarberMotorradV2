import React from "react";

export default function PrepPanel({ form, update, Field }) {
  return (
    <div className="panel" role="tabpanel" id="panel-prep" aria-labelledby="tab-prep">
      <div className="grid">
        <Field label="Description">
          <textarea rows={4} value={form.prepDescription} onChange={update("prepDescription")} />
        </Field>
        <Field label="Costs">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={form.prepCosts}
            onChange={update("prepCosts")}
          />
        </Field>
      </div>
    </div>
  );
}
