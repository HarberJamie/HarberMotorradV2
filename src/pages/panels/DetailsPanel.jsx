import React from "react";

export default function DetailsPanel({ form, update, Field }) {
  return (
    <div className="panel" role="tabpanel" id="panel-details" aria-labelledby="tab-details">
      <div className="grid">
        <Field label="Registration">
          <input value={form.registration} onChange={update("registration")} />
        </Field>
        <Field label="Make">
          <input value={form.make} onChange={update("make")} />
        </Field>
        <Field label="Model">
          <input value={form.model} onChange={update("model")} />
        </Field>
        <Field label="Variant">
          <input value={form.variant} onChange={update("variant")} />
        </Field>
        <Field label="Vin">
          <input value={form.vin} onChange={update("vin")} />
        </Field>
        <Field label="Colour">
          <input value={form.colour} onChange={update("colour")} />
        </Field>
        <Field label="Mileage">
          <input type="number" inputMode="numeric" value={form.mileage} onChange={update("mileage")} />
        </Field>
        <Field label="CC">
          <input type="number" inputMode="numeric" value={form.cc} onChange={update("cc")} />
        </Field>
        <Field label="No of Owners">
          <input type="number" inputMode="numeric" value={form.owners} onChange={update("owners")} />
        </Field>
        <Field label="Model Year">
          <input type="number" inputMode="numeric" value={form.modelYear} onChange={update("modelYear")} />
        </Field>
      </div>
    </div>
  );
}
