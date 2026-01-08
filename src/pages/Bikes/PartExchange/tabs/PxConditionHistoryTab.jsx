// src/pages/Bikes/PartExchange/tabs/PxConditionHistoryTab.jsx
import React, { useState } from "react";
import { CONDITION_LINE_ITEMS } from "../usePxPartExchange.js";
import PxConditionField from "@/components/PxConditionField.jsx";

export default function PxConditionHistoryTab({
  bike,
  combinedCommonIssues,
  updatePxSpec,
  updateServiceHistoryCost,
  updateConditionField,
  updateCommonIssueCheck,
  addPlaceholderPhoto,
}) {
  const [activeSection, setActiveSection] = useState(null); // "service" | "issues" | "condition" | "photos" | null

  if (!bike) {
    return (
      <p className="text-sm text-slate-400">
        No bike selected for Condition &amp; History.
      </p>
    );
  }

  const serviceHistoryCosts = bike.pxSpec?.serviceHistoryCosts || {};
  const extras = bike.pxSpec || {};
  const appraisal = bike.appraisal || {};
  const condition = appraisal.condition || {};
  const commonIssuesChecks = appraisal.commonIssuesChecks || {};

  // Single cost object for the whole Service History section
  const overallServiceCost = serviceHistoryCosts.overallService || {};
  const serviceRequired = !!overallServiceCost.costRequired;
  const serviceEstimatedCost = overallServiceCost.estimatedCost ?? "";

  const handleServiceRequiredChange = (e) => {
    const checked = e.target.checked;
    updateServiceHistoryCost("overallService", {
      costRequired: checked,
      estimatedCost: checked ? serviceEstimatedCost : "",
    });
  };

  const handleServiceEstimatedCostChange = (e) => {
    updateServiceHistoryCost("overallService", {
      estimatedCost: e.target.value,
    });
  };

  /** ----------------- Section renderers (used inside modal) ----------------- */

  const renderServiceHistorySection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          Service History
        </h3>
        <p className="text-[11px] text-slate-500">
          Capture the service story of this bike and flag any upcoming work that
          will affect prep costs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Service History type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400">
            Service History
          </label>
          <select
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            value={extras?.serviceHistoryType || ""}
            onChange={(e) =>
              updatePxSpec({ serviceHistoryType: e.target.value })
            }
          >
            <option value="">Select…</option>
            <option value="Full">Full</option>
            <option value="Partial">Partial</option>
            <option value="Self">Self</option>
            <option value="None">None</option>
          </select>
        </div>

        {/* Date of last service */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400">
            Date of Last Service
          </label>
          <input
            type="date"
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            value={extras?.lastServiceDate || ""}
            onChange={(e) => updatePxSpec({ lastServiceDate: e.target.value })}
          />
        </div>

        {/* Miles at last service */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400">
            Miles at Last Service
          </label>
          <input
            type="number"
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            value={extras?.lastServiceMiles || ""}
            onChange={(e) =>
              updatePxSpec({ lastServiceMiles: e.target.value })
            }
          />
        </div>

        {/* Next major service due */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400">
            Next Major Service Due
          </label>
          <input
            type="date"
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            value={extras?.nextMajorServiceDate || ""}
            onChange={(e) =>
              updatePxSpec({ nextMajorServiceDate: e.target.value })
            }
          />
        </div>
      </div>

      {/* Single Service Cost toggle + value for the entire section */}
      <div className="pt-3 mt-1 border-t border-slate-800 flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
        <label className="inline-flex items-center gap-1">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
            checked={serviceRequired}
            onChange={handleServiceRequiredChange}
          />
          <span>Service work required</span>
        </label>

        {serviceRequired && (
          <div className="flex items-center gap-2">
            <span>Estimated Cost (£)</span>
            <input
              type="number"
              min="0"
              step="1"
              className="w-24 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-100"
              value={serviceEstimatedCost}
              onChange={handleServiceEstimatedCostChange}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderKnownIssuesSection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          Known / Common Issues
        </h3>
        <p className="text-[11px] text-slate-500">
          Model-specific checks plus patterns from Warranty / Service / Prep
          events on similar bikes. Flag anything that requires attention and log
          estimated costs.
        </p>
      </div>

      {combinedCommonIssues.length === 0 ? (
        <p className="text-xs text-slate-400">
          No model-specific issues detected yet. As more Warranty, Service and
          Preparation events are recorded for this model, we&apos;ll surface
          common jobs here.
        </p>
      ) : (
        <div className="space-y-3">
          {combinedCommonIssues.map((issue) => {
            const checks = commonIssuesChecks[issue.id] || {};
            const costRequired = !!checks.costRequired;
            const estimatedCost = checks.estimatedCost ?? "";

            return (
              <div
                key={issue.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2"
              >
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
                      checked={!!checks.checked}
                      onChange={(e) =>
                        updateCommonIssueCheck(
                          issue.id,
                          "checked",
                          e.target.checked
                        )
                      }
                    />
                    <span>{issue.label}</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
                        checked={costRequired}
                        onChange={(e) =>
                          updateCommonIssueCheck(
                            issue.id,
                            "costRequired",
                            e.target.checked
                          )
                        }
                      />
                      <span>Cost Required</span>
                    </label>
                    {costRequired && (
                      <div className="flex items-center gap-1">
                        <span>Estimated Cost (£)</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-24 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-100"
                          value={estimatedCost}
                          onChange={(e) =>
                            updateCommonIssueCheck(
                              issue.id,
                              "estimatedCost",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 text-[11px] text-slate-100"
                  placeholder="Notes / findings for this check."
                  value={checks.notes || ""}
                  onChange={(e) =>
                    updateCommonIssueCheck(issue.id, "notes", e.target.value)
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderConditionSection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          Condition Checklist
        </h3>
        <p className="text-[11px] text-slate-500">
          Record the condition of key components, and flag any items where a
          prep cost is required. These costs will be used in the Summary &
          Valuation tabs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CONDITION_LINE_ITEMS.map((field) => (
          <PxConditionField
            key={field.key}
            label={field.label}
            placeholder={field.placeholder}
            condition={condition[field.key] ?? ""}
            onChange={(patch) => updateConditionField(field.key, patch)}
          />
        ))}
      </div>

      <div className="mt-3">
        <label className="block text-[11px] font-medium text-slate-400 mb-1">
          Overall notes
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-slate-100"
          placeholder="Summary of overall condition, any notable damage or positives."
          value={(() => {
            const v = condition.overallNotes ?? "";
            if (typeof v === "string") return v;
            if (v && typeof v === "object") return v.notes || "";
            return "";
          })()}
          onChange={(e) =>
            updateConditionField("overallNotes", {
              notes: e.target.value,
            })
          }
        />
      </div>
    </div>
  );

  const renderPhotosSection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Photos</h3>
        <p className="text-xs text-slate-400">
          Minimum 1 walkaround photo required before valuation.
        </p>
      </div>

      <p className="text-xs text-slate-400">
        Current photos:{" "}
        <span className="font-semibold text-slate-200">
          {Array.isArray(bike.photos) ? bike.photos.length : 0}
        </span>
      </p>

      <button
        type="button"
        className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700"
        onClick={addPlaceholderPhoto}
      >
        Add placeholder photo
      </button>

      <p className="mt-1 text-[11px] text-slate-500">
        v1: adds a placeholder record only. Later this will hook into file
        upload / camera capture.
      </p>
    </div>
  );

  const getModalTitle = () => {
    switch (activeSection) {
      case "service":
        return "Service History";
      case "issues":
        return "Known / Common Issues";
      case "condition":
        return "Condition Checklist";
      case "photos":
        return "Photos";
      default:
        return "";
    }
  };

  const renderModalBody = () => {
    switch (activeSection) {
      case "service":
        return renderServiceHistorySection();
      case "issues":
        return renderKnownIssuesSection();
      case "condition":
        return renderConditionSection();
      case "photos":
        return renderPhotosSection();
      default:
        return null;
    }
  };

  /** ----------------------------- Main layout ----------------------------- */

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <header>
          <h2 className="text-lg font-semibold text-slate-100">
            Condition &amp; History
          </h2>
          <p className="text-xs text-slate-400">
            Open each section to record service history, model-specific issues,
            detailed condition and photos for this PX.
          </p>
        </header>

        {/* Four section cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service History card */}
          <section className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                Service History
              </h3>
              <p className="text-[11px] text-slate-500">
                Service story, dates and mileage, plus a single prep cost for
                service work if needed.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 self-start text-xs px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium"
              onClick={() => setActiveSection("service")}
            >
              Open Service History
            </button>
          </section>

          {/* Known / Common Issues card */}
          <section className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                Known / Common Issues
              </h3>
              <p className="text-[11px] text-slate-500">
                Model-specific known issues plus patterns from Warranty / Service /
                Prep events on similar bikes.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 self-start text-xs px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium"
              onClick={() => setActiveSection("issues")}
            >
              Open Known Issues
            </button>
          </section>

          {/* Condition Checklist card */}
          <section className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                Condition Checklist
              </h3>
              <p className="text-[11px] text-slate-500">
                Structured condition fields for tyres, bodywork, corrosion and
                more, plus cost flags.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 self-start text-xs px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium"
              onClick={() => setActiveSection("condition")}
            >
              Open Condition Checklist
            </button>
          </section>

          {/* Photos card */}
          <section className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                Photos
              </h3>
              <p className="text-[11px] text-slate-500">
                Capture a basic photo record. Minimum 1 walkaround photo required
                before valuation.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 self-start text-xs px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium"
              onClick={() => setActiveSection("photos")}
            >
              Open Photos
            </button>
          </section>
        </div>
      </div>

      {/* Modal overlay */}
      {activeSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-100">
                {getModalTitle()}
              </h2>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-200 text-sm"
                onClick={() => setActiveSection(null)}
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">{renderModalBody()}</div>
          </div>
        </div>
      )}
    </>
  );
}
