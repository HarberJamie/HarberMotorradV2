// src/pages/NewDeal.jsx
import { useState } from "react";
import { createDeal } from "../services/api";

export default function NewDeal(){
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  async function onSubmit(e){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const answers = {
      make: fd.get("make")?.toString().trim(),
      model: fd.get("model")?.toString().trim(),
      reg: fd.get("reg")?.toString().trim(),
      isUsed: fd.get("condition")==="used",
      hasPartExchange: fd.get("px")==="yes",
      hasOutstandingFinance: fd.get("finance")==="yes",
    };
    setSaving(true);
    const res = await createDeal(answers);
    setSaving(false);
    setResult(res);
    e.currentTarget.reset();
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl mb-3">Add New Deal</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label>Condition</label><br/>
          <label><input type="radio" name="condition" value="new" defaultChecked/> New</label>{" "}
          <label><input type="radio" name="condition" value="used"/> Used</label>
        </div>
        <div>
          <label>Sale Bike Make</label><br/>
          <input name="make" required placeholder="BMW" />
        </div>
        <div>
          <label>Sale Bike Model</label><br/>
          <input name="model" required placeholder="R1250GS" />
        </div>
        <div>
          <label>Registration (optional)</label><br/>
          <input name="reg" placeholder="AB12 CDE" />
        </div>
        <div>
          <label>Part-exchange?</label><br/>
          <label><input type="radio" name="px" value="no" defaultChecked/> No</label>{" "}
          <label><input type="radio" name="px" value="yes"/> Yes</label>
        </div>
        <div>
          <label>Outstanding finance?</label><br/>
          <label><input type="radio" name="finance" value="no" defaultChecked/> No</label>{" "}
          <label><input type="radio" name="finance" value="yes"/> Yes</label>
        </div>
        <button disabled={saving} type="submit">
          {saving? "Creating..." : "Create Deal"}
        </button>
      </form>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl mb-2">Created</h2>
          <div>Deal ID: <code>{result.deal.id}</code></div>
          <div>Tasks created: {result.tasks.length}</div>
        </div>
      )}
    </div>
  );
}
