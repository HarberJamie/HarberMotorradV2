import React from "react";

export default function DetailsPanel({ form, update, Field }) {
  return (
    <div className="panel">
      <div className="grid">
        <Field label="Registration" name="registration" value={form.registration} onChange={update("registration")} />
        <Field label="Make"         name="make"         value={form.make}         onChange={update("make")} />
        <Field label="Model"        name="model"        value={form.model}        onChange={update("model")} />
        <Field label="Variant"      name="variant"      value={form.variant}      onChange={update("variant")} />
        <Field label="VIN"          name="vin"          value={form.vin}          onChange={update("vin")} />
        <Field label="Colour"       name="colour"       value={form.colour}       onChange={update("colour")} />
        <Field label="Mileage"      name="mileage"      type="number" value={form.mileage} onChange={update("mileage")} />
        <Field label="CC"           name="cc"           type="number" value={form.cc}      onChange={update("cc")} />
        <Field label="No. of Owners" name="owners"      type="number" value={form.owners}  onChange={update("owners")} />
        <Field label="Model Year"    name="modelYear"   type="number" value={form.modelYear} onChange={update("modelYear")} />
      </div>
    </div>
  );
}
