import React from "react";

export default function PrepPanel({ form, update, Field }) {
  return (
    <div className="panel">
      <div className="grid">
        <Field
          label="Preparation Description"
          name="prepDescription"
          as="textarea"
          value={form.prepDescription}
          onChange={update("prepDescription")}
          placeholder="e.g., PDI, Service, MOT, Tyres, Valet, Smart repair, etc."
        />
        <Field
          label="Estimated Prep Costs (£)"
          name="prepCosts"
          type="number"
          value={form.prepCosts}
          onChange={update("prepCosts")}
        />
      </div>
    </div>
  );
}
