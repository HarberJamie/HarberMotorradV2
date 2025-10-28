// src/pages/PartEx/PartEx.jsx
import React, { useState } from "react";

// TabsHeader lives in src/pages/, so from /PartEx/ it's one level up:
import TabsHeader from "../TabsHeader.jsx";

// These files are in the same folder as PartEx.jsx:
import Field from "./Field.jsx";
import DetailsPanel from "./panels/DetailsPanel.jsx";
import HistoryPanel from "./panels/HistoryPanel.jsx";
import SpecPanel from "./panels/SpecPanel.jsx";
import ConditionPanel from "./panels/ConditionPanel.jsx";
import PrepPanel from "./panels/PrepPanel.jsx";

function PartEx() {
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

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Part-Exchange form submitted:", form);
    alert("Saved (placeholder) — submit actions will be added in a later build.");
  };

  const TABS = [
    { id: "details", label: "Bike Details" },
    { id: "history", label: "History" },
    { id: "spec", label: "Specification" },
    { id: "condition", label: "Condition" },
    { id: "prep", label: "Preparation" },
  ];

  const [active, setActive] = useState("details");
  const setTab = (id) => setActive(id);

  return (
    <div className="container">
      <h1 className="page-title">Part Exchange</h1>

      <TabsHeader tabs={TABS} active={active} onChange={setTab} />

      <form onSubmit={handleSubmit} className="form">
        {active === "details"   && <DetailsPanel   form={form} update={update} Field={Field} />}
        {active === "history"   && <HistoryPanel   form={form} update={update} Field={Field} />}
        {active === "spec"      && <SpecPanel      form={form} update={update} Field={Field} />}
        {active === "condition" && <ConditionPanel form={form} update={update} Field={Field} />}
        {active === "prep"      && <PrepPanel      form={form} update={update} Field={Field} />}

        <div className="actions">
          <div className="pager">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === active);
                if (idx > 0) setTab(TABS[idx - 1].id);
              }}
            >
              ◀ Previous
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === active);
                if (idx < TABS.length - 1) setTab(TABS[idx + 1].id);
              }}
            >
              Next ▶
            </button>
          </div>

          <button type="submit" className="btn">Submit</button>
        </div>
      </form>

      <style>{`
        .container { max-width: 960px; margin: 0 auto; padding: 1.25rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; }
        .form { display: grid; gap: 1.25rem; }
        .panel { padding: .5rem 0; }

        .grid { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .field { display: flex; flex-direction: column; gap: .25rem; }
        .field-label { font-size: .9rem; color: #374151; }
        input, select, textarea {
          border: 1px solid #d1d5db; border-radius: .5rem; padding: .6rem .7rem; font: inherit;
        }

        .actions { display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed #eee; padding-top: .75rem; }
        .pager { display: flex; gap: .5rem; }
        .btn { padding: .7rem 1rem; border-radius: .6rem; border: none; cursor: pointer; font-weight: 600; background:#111827; color:white; }
        .btn:hover { opacity: .9; }
        .btn--ghost { background: transparent; border: 1px solid #d1d5db; color: #111827; }
        .btn--ghost:hover { background: #f9fafb; }
      `}</style>
    </div>
  );
}

export default PartEx;
