import React from "react";

export default function SpecPanel({ form, update, Field }) {
  return (
    <div className="panel">
      <div className="grid">
        <Field
          label="Top Box"
          name="topBox"
          as="select"
          value={form.topBox}
          onChange={update("topBox")}
          options={["None", "BMW", "Aftermarket"]}
        />
        <Field
          label="Panniers"
          name="panniers"
          as="select"
          value={form.panniers}
          onChange={update("panniers")}
          options={["None", "BMW (Vario)", "BMW (Aluminium)", "Aftermarket"]}
        />
        <Field
          label="Engine Bars"
          name="engineBars"
          as="select"
          value={form.engineBars}
          onChange={update("engineBars")}
          options={["None", "OEM", "Aftermarket"]}
        />
      </div>
    </div>
  );
}
