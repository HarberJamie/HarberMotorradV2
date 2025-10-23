import React, { useState } from "react";

export default function PartEx() {
  const [form, setForm] = useState({
    // Bike Details
    registration: "",
    make: "",
    model: "",
    variant: "",
    vin: "",
    colour: "",
    mileage: "",
    cc: "",
    owners: "",
    modelYear: "",

    // History
    fsh: "",
    lastService: "",
    milesAtLastService: "",
    serviceBookAvailable: "",
    motExpiry: "",

    // Specification
    topBox: "",
    panniers: "",
    engineBars: "",

    // Condition
    frTyre: "",
    rrTyre: "",
    damage: "",

    // Preparation
    prepDescription: "",
    prepCosts: "",
  });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // No-op for now; wired for future actions
    console.log("Part-Exchange form submitted:", form);
    alert("Saved (placeholder) — submit actions will be added in a later build.");
  };

  const Section = ({ title, children }) => (
    <fieldset className="section">
      <legend className="section-title">{title}</legend>
      <div className="grid">{children}</div>
    </fieldset>
  );

  const Field = ({ label, children }) => (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );

  return (
    <div className="container">
      <h1 className="page-title">Part Exchange</h1>

      <form onSubmit={handleSubmit} className="form">
        {/* Bike Details */}
        <Section title="Bike Details">
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
        </Section>

        {/* History */}
        <Section title="History">
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
            <input type="number" inputMode="numeric" value={form.milesAtLastService} onChange={update("milesAtLastService")} />
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
        </Section>

        {/* Specification */}
        <Section title="Specification">
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
        </Section>

        {/* Condition */}
        <Section title="Condition">
          <Field label="Fr Tyre">
            <input value={form.frTyre} onChange={update("frTyre")} />
          </Field>
          <Field label="Rr Tyre">
            <input value={form.rrTyre} onChange={update("rrTyre")} />
          </Field>
          <Field label="Damage">
            <textarea rows={3} value={form.damage} onChange={update("damage")} />
          </Field>
        </Section>

        {/* Preparation */}
        <Section title="Preparation">
          <Field label="Description">
            <textarea rows={4} value={form.prepDescription} onChange={update("prepDescription")} />
          </Field>
          <Field label="Costs">
            <input type="number" inputMode="decimal" step="0.01" value={form.prepCosts} onChange={update("prepCosts")} />
          </Field>
        </Section>

        <div className="actions">
          <button type="submit" className="btn">Submit</button>
        </div>
      </form>

      {/* Minimal component-scoped styles to avoid touching global CSS */}
      <style>{`
        .container { max-width: 960px; margin: 0 auto; padding: 1.25rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; }
        .form { display: grid; gap: 1.25rem; }
        .section { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem; }
        .section-title { font-weight: 600; padding: 0 .5rem; }
        .grid { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .field { display: flex; flex-direction: column; gap: .25rem; }
        .field-label { font-size: .9rem; color: #374151; }
        input, select, textarea {
          border: 1px solid #d1d5db; border-radius: .5rem; padding: .6rem .7rem; font: inherit;
        }
        .actions { display: flex; justify-content: flex-end; }
        .btn { padding: .7rem 1rem; border-radius: .6rem; border: none; cursor: pointer; font-weight: 600; }
        .btn { background:#111827; color:white; }
        .btn:hover { opacity: .9; }
      `}</style>
    </div>
  );
}
