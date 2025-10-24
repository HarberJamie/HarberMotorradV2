import React from "react";

export default function ConditionPanel({ form, update, Field }) {
  return (
    <div className="panel" role="tabpanel" id="panel-condition" aria-labelledby="tab-condition">
      <div className="grid">
        <Field label="Fr Tyre">
          <input value={form.frTyre} onChange={update("frTyre")} />
        </Field>
        <Field label="Rr Tyre">
          <input value={form.rrTyre} onChange={update("rrTyre")} />
        </Field>
        <Field label="Damage">
          <textarea rows={3} value={form.damage} onChange={update("damage")} />
        </Field>
      </div>
    </div>
  );
}
