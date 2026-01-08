// src/pages/Bikes/PartExchangeTab.jsx
import React, { useState } from "react";
import { usePxPartExchange } from "./PartExchange/usePxPartExchange.js";
import PxBikeDetailsTab from "./PartExchange/tabs/PxBikeDetailsTab.jsx";
import PxSpecificationTab from "./PartExchange/tabs/PxSpecificationTab.jsx";
import PxConditionHistoryTab from "./PartExchange/tabs/PxConditionHistoryTab.jsx";
import PxSummaryInsightsTab from "./PartExchange/tabs/PxSummaryInsightsTab.jsx";
import PxValuationTab from "./PartExchange/tabs/PxValuationTab.jsx";

/**
 * Tabs (Summary has Insights merged in)
 */
const TABS = [
  { id: "bikeDetails", label: "Bike Details" },
  { id: "specification", label: "Specification" },
  { id: "condition", label: "Condition & History" },
  { id: "summary", label: "Summary & Insights" },
  { id: "valuation", label: "Valuation" },
];

/**
 * Props:
 *  - bike: the full bike object
 *  - onSave: (patch: Partial<Bike>) => void  // parent wires this to updateBike(bike.id, patch)
 *  - onOpenDeal?: () => void                 // optional: open linked deal page/modal
 */
export default function PartExchangeTab({ bike, onSave, onOpenDeal }) {
  const [activeTab, setActiveTab] = useState("bikeDetails");

  const {
    valuations,
    latestValuation,
    linkedDeal,
    makeOptions,
    modelOptions,
    trimOptions,
    featureFields,
    combinedCommonIssues,
    hasHpiClear,
    hasAtLeastOnePhoto,
    financeAnswered,
    canCreateValuation,
    canSubmitPx,
    getNowLocalDateTime,
    updateAppraisal,
    updateFinance,
    updateLinkedDeal,
    updatePxSpec,
    updateServiceHistoryCost,
    updateConditionField,
    updateCommonIssueCheck,
    toggleFeature,
    toggleAccessoryMod,
    attachHpiDocument,
    markHpiClear,
    addPlaceholderPhoto,
    addValuation,
    updateValuationField,
    approveValuation,
    handleFinalSubmit,
  } = usePxPartExchange(bike, onSave, onOpenDeal);

  if (!bike) {
    return <p className="text-sm text-slate-400">No bike selected.</p>;
  }

  const activeIndex = TABS.findIndex((t) => t.id === activeTab);
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === TABS.length - 1;

  const goNext = () => {
    if (!isLast) {
      setActiveTab(TABS[activeIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      setActiveTab(TABS[activeIndex - 1].id);
    }
  };

  const handleCreateValuation = () => {
    addValuation();
    setActiveTab("valuation");
  };

  return (
    <div className="space-y-4">
      {/* Tabs header */}
      <div className="flex gap-2 border-b border-slate-700">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-3 py-2 text-base font-medium rounded-t-md transition-colors",
                isActive
                  ? "bg-slate-800 text-white border-x border-t border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab body wrapper */}
      <div className="rounded-b-2xl rounded-tr-2xl bg-slate-900/80 border border-slate-700 p-5 flex flex-col gap-5">
        {activeTab === "bikeDetails" && (
          <PxBikeDetailsTab
            bike={bike}
            makeOptions={makeOptions}
            modelOptions={modelOptions}
            trimOptions={trimOptions}
            linkedDeal={linkedDeal}
            onSave={onSave}
            updateAppraisal={updateAppraisal}
            updateFinance={updateFinance}
            updateLinkedDeal={updateLinkedDeal}
            getNowLocalDateTime={getNowLocalDateTime}
            attachHpiDocument={attachHpiDocument}
            markHpiClear={markHpiClear}
            hasHpiClear={hasHpiClear}
            financeAnswered={financeAnswered}
          />
        )}

        {activeTab === "specification" && (
          <PxSpecificationTab
            bike={bike}
            featureFields={featureFields}
            toggleFeature={toggleFeature}
            toggleAccessoryMod={toggleAccessoryMod}
          />
        )}

        {activeTab === "condition" && (
          <PxConditionHistoryTab
            bike={bike}
            combinedCommonIssues={combinedCommonIssues}
            updatePxSpec={updatePxSpec}
            updateServiceHistoryCost={updateServiceHistoryCost}
            updateConditionField={updateConditionField}
            updateCommonIssueCheck={updateCommonIssueCheck}
            addPlaceholderPhoto={addPlaceholderPhoto}
          />
        )}

        {activeTab === "valuation" && (
          <PxValuationTab
            bike={bike}
            valuations={valuations}
            latestValuation={latestValuation}
            canCreateValuation={canCreateValuation}
            onCreateValuation={handleCreateValuation}
            updateValuationField={updateValuationField}
            approveValuation={approveValuation}
            onOpenDeal={onOpenDeal}
          />
        )}

        {activeTab === "summary" && (
          <PxSummaryInsightsTab
            bike={bike}
            hasHpiClear={hasHpiClear}
            financeAnswered={financeAnswered}
            canCreateValuation={canCreateValuation}
            valuations={valuations}
            latestValuation={latestValuation}
            linkedDeal={linkedDeal}
            canSubmitPx={canSubmitPx}
            handleFinalSubmit={handleFinalSubmit}
          />
        )}

        {/* Back / Next navigation across tabs */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 mt-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className={[
              "px-3 py-1.5 text-xs rounded-md border",
              isFirst
                ? "border-slate-800 text-slate-500 cursor-not-allowed"
                : "border-slate-600 text-slate-200 hover:bg-slate-800",
            ].join(" ")}
          >
            Back
          </button>

          {!isLast && (
            <button
              type="button"
              onClick={goNext}
              className="px-3 py-1.5 text-xs rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium"
            >
              Next
            </button>
          )}

          {isLast && (
            <span className="text-[10px] text-slate-500">
              Use &quot;Submit Valuation for Approval&quot; to complete this
              PX and create the linked Deal.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
