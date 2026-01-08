// src/pages/Bikes/PartExchange/tabs/PxSummaryInsightsTab.jsx
import React from "react";
import { getPxEstimatedCostTotals } from "../usePxPartExchange.js";

export default function PxSummaryInsightsTab({
  bike,
  valuations = [],
  latestValuation,
  canCreateValuation,
  canSubmitPx,
  onSubmitPx,
  handleFinalSubmit,
}) {
  if (!bike) {
    return (
      <p className="text-sm text-slate-400">
        No bike selected for Summary &amp; Insights.
      </p>
    );
  }

  const allVals = valuations.length
    ? valuations
    : Array.isArray(bike.valuations)
    ? bike.valuations
    : [];

  const latest =
    latestValuation || (allVals.length > 0 ? allVals[0] : null) || null;

  // QoR flags
  const hasHpiClear =
    bike.hpiReport && ["Clear", "Warning"].includes(bike.hpiReport.status);
  const hasAtLeastOnePhoto =
    Array.isArray(bike.photos) && bike.photos.length > 0;
  const financeAnswered =
    bike.finance && typeof bike.finance.hasFinance === "boolean";

  const computedCanCreateValuation =
    typeof canCreateValuation === "boolean"
      ? canCreateValuation
      : hasHpiClear && hasAtLeastOnePhoto && financeAnswered;

  const computedCanSubmitPx =
    typeof canSubmitPx === "boolean"
      ? canSubmitPx
      : computedCanCreateValuation && allVals.length > 0;

  const linkedDeal = bike.acquisition?.linkedDeal || {};

  // Prep cost totals
  const { conditionTotal, serviceHistoryTotal, grandTotal } =
    getPxEstimatedCostTotals(bike);

  const onSubmit =
    onSubmitPx || handleFinalSubmit || (() => console.warn("No submit handler passed to PxSummaryInsightsTab"));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">
        Summary &amp; Insights
      </h2>
      <p className="text-xs text-slate-400">
        Final checklist, linked deal context and high-level insights before you
        submit this PX for manager review.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* QoR recap */}
        <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            QoR Checklist
          </h3>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>
              <span
                className={
                  hasHpiClear ? "text-green-400 mr-2" : "text-red-400 mr-2"
                }
              >
                ●
              </span>
              HPI done ({bike.hpiReport?.status || "Not started"})
            </li>
            <li>
              <span
                className={
                  financeAnswered ? "text-green-400 mr-2" : "text-red-400 mr-2"
                }
              >
                ●
              </span>
              Finance question answered on PX (
              {financeAnswered ? "Yes" : "No"})
            </li>
            <li>
              <span
                className={
                  hasAtLeastOnePhoto
                    ? "text-green-400 mr-2"
                    : "text-red-400 mr-2"
                }
              >
                ●
              </span>
              Minimum 1 walkaround photo attached (
              {hasAtLeastOnePhoto ? "Yes" : "No"})
            </li>
          </ul>

          {!computedCanCreateValuation && (
            <p className="mt-3 text-[11px] text-amber-400">
              Complete all QoR checks (HPI, finance question, and photos in the
              Condition tab) before creating valuations or submitting this PX.
            </p>
          )}
        </section>

        {/* Valuation recap */}
        <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            Valuation Recap
          </h3>

          {latest ? (
            <>
              <dl className="space-y-2 text-xs text-slate-200 mb-3">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Latest buy-in valuation</dt>
                  <dd>£{latest.amount || "0"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">
                    Expected retail (latest valuation)
                  </dt>
                  <dd>£{latest.marketRetailPrice || "0"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Valuations created</dt>
                  <dd>{allVals.length}</dd>
                </div>
              </dl>
              <p className="text-[11px] text-slate-500">
                The latest valuation will be treated as the primary reference
                unless a specific one is approved as the buy-in.
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400">
              No valuations yet. Create at least one valuation before
              submitting.
            </p>
          )}
        </section>
      </div>

      {/* Prep & Service Cost Summary */}
      <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Prep &amp; Service Cost Summary
        </h3>
        <p className="text-[11px] text-slate-500 mb-2">
          Estimated costs pulled from Condition checks and Service History for
          this PX. These will inform the deal profit chain and future Harber
          insights.
        </p>
        <dl className="space-y-1 text-xs text-slate-200">
          <div className="flex justify-between">
            <dt className="text-slate-400">Condition items (est.)</dt>
            <dd>£{conditionTotal.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Service history (est.)</dt>
            <dd>£{serviceHistoryTotal.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt className="text-slate-300">
              Total prep &amp; service (est.)
            </dt>
            <dd>£{grandTotal.toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      {/* Deal summary from linked deal context */}
      <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Linked Deal Summary
        </h3>
        {linkedDeal.targetRegistration ? (
          <dl className="space-y-2 text-xs text-slate-200">
            <div className="flex justify-between">
              <dt className="text-slate-400">
                Sale bike registration (target)
              </dt>
              <dd className="font-mono">{linkedDeal.targetRegistration}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">
                Finance required on new bike?
              </dt>
              <dd>
                {linkedDeal.financeRequired === true
                  ? "Yes"
                  : linkedDeal.financeRequired === false
                  ? "No"
                  : "Not answered"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">
                Additional deposit on new bike
              </dt>
              <dd>
                £
                {linkedDeal.additionalDeposit &&
                linkedDeal.additionalDeposit !== ""
                  ? linkedDeal.additionalDeposit
                  : "0"}
              </dd>
            </div>
            {linkedDeal.createdDealId && (
              <div className="flex justify-between">
                <dt className="text-slate-400">Created Deal ID</dt>
                <dd className="font-mono">{linkedDeal.createdDealId}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-xs text-slate-400">
            No linked sale bike set yet. Add a sale bike registration in the
            Bike Details tab to auto-create a Deal when you submit this PX.
          </p>
        )}
      </section>

      {/* Model Insights (placeholder for Harber brain) */}
      <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Model Insights (v1 placeholder)
        </h3>
        <p className="text-[11px] text-slate-500 mb-2">
          This will surface Harber insights: average prep, time to sell,
          recommended retail window, and common issues for this model based on
          your data.
        </p>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 space-y-1">
          <p>• Average prep cost for this model: –</p>
          <p>• Typical time to sell: – days</p>
          <p>• Recommended retail window: £– to £–</p>
          <p>• Common issues to check: –</p>
        </div>
      </section>

      {/* Submit bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="text-[11px] text-slate-500">
          <p>
            Current PX status:{" "}
            <span className="font-semibold text-slate-200">
              {bike.status || "Valuation"}
            </span>
          </p>
          <p>
            After submission this will change to{" "}
            <span className="font-semibold text-emerald-400">
              PX Submitted
            </span>{" "}
            and the linked Deal will be created (if a sale bike is set).
          </p>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!computedCanSubmitPx}
          className={`px-4 py-2 text-xs rounded-lg font-semibold ${
            computedCanSubmitPx
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          Submit Valuation for Approval
        </button>
      </div>
    </div>
  );
}
