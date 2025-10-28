import React from "react";

export default function ConditionPanel({ form, update, Field }) {
  return (
    <div className="panel">
      <div className="grid">
        <Field
          label="Front Tyre"
          name="frTyre"
          as="select"
          value={form.frTyre}
          onChange={update("frTyre")}
          options={["Good", "OK", "Needs Replacing"]}
        />
        <Field
          label="Rear Tyre"
          name="rrTyre"
          as="select"
          value={form.rrTyre}
          onChange={update("rrTyre")}
          options={["Good", "OK", "Needs Replacing"]}
        />
        <Field
          label="Damage / Notes"
          name="damage"
          as="textarea"
          value={form.damage}
          onChange={update("damage")}
          placeholder="Any marks, dents, corrosion, paint issues, etc."
        />
      </div>
    </div>
  );
}
