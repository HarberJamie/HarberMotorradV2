import React from "react";

export default function HistoryPanel({ form, update, Field }) {
  return (
    <div className="panel">
      <div className="grid">
        <Field
          label="Service History"
          name="fsh"
          as="select"
          value={form.fsh}
          onChange={update("fsh")}
          options={[
            { value: "None", label: "None" },
            { value: "Partial", label: "Partial" },
            { value: "Full", label: "Full" },
          ]}
        />
        <Field label="Last Service (date)" name="lastService" type="date" value={form.lastService} onChange={update("lastService")} />
        <Field label="Miles at Last Service" name="milesAtLastService" type="number" value={form.milesAtLastService} onChange={update("milesAtLastService")} />
        <Field
          label="Service Book Available"
          name="serviceBookAvailable"
          as="select"
          value={form.serviceBookAvailable}
          onChange={update("serviceBookAvailable")}
          options={["Yes", "No"]}
        />
        <Field label="MOT Expiry" name="motExpiry" type="date" value={form.motExpiry} onChange={update("motExpiry")} />
      </div>
    </div>
  );
}
