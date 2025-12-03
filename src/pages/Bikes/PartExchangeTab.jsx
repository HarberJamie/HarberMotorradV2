// src/pages/Bikes/PartExchangeTab.jsx
import React, { useMemo, useState } from "react";
import { useBikes } from "@/lib/bikesStore.js";
import { useDeals } from "@/lib/dealsStore.js";
import {
  getMakes,
  getModels,
  getFeatureFields,
  getCommonIssues,
} from "@/lib/catalog.js";

/**
 * Known trims by Make|Model to keep data consistent.
 * Mirrored from AddBike.jsx so PX matches Add Bike.
 */
const TRIMS_BY_MODEL = {
  "BMW|R 1300 GS": ["Base", "TE", "TE Low", "GS Trophy"],
  "BMW|R 1250 GS": ["Base", "TE", "Rallye TE"],
  "BMW|R 1250 GS Adventure": ["TE", "Rallye TE"],
  "BMW|S 1000 R": ["Sport", "M Sport"],
  "BMW|S 1000 XR": ["TE", "Sport", "M Sport"],
  "BMW|F 900 XR": ["SE", "TE"],
  "BMW|F 900 R": ["SE", "Sport"],
  "BMW|R 18": ["First Edition", "Classic", "B", "Transcontinental"],
};

/**
 * Default feature fields – mirrors AddBike.jsx
 */
const DEFAULT_FEATURE_FIELDS = [
  { key: "heatedGrips", label: "Heated Grips" },
  { key: "cruiseControl", label: "Cruise Control" },
  { key: "quickshifter", label: "Quickshifter" },
  { key: "dynamicEse", label: "Dynamic ESA" },
  { key: "keylessRide", label: "Keyless Ride" },
  { key: "luggage", label: "Luggage / Panniers" },
];

/**
 * Accessories / Mods tick-list options
 */
const ACCESSORY_MOD_OPTIONS = [
  { key: "panniers", label: "Panniers" },
  { key: "topBox", label: "Top Box" },
  { key: "engineBars", label: "Engine Bars" },
  { key: "tallScreen", label: "Tall Screen" },
  { key: "handGuards", label: "Hand Guards" },
  { key: "tankBag", label: "Tank Bag" },
  { key: "gpsMount", label: "GPS / Nav Mount" },
  { key: "aftermarketExhaust", label: "Aftermarket Exhaust" },
  { key: "tailTidy", label: "Tail Tidy" },
  { key: "loweringKit", label: "Lowering Kit" },
  { key: "barRisers", label: "Bar Risers" },
  { key: "nonOeIndicators", label: "Non-OE Indicators" },
];

/**
 * Hard-coded list of appraisers for now.
 * Later this can be replaced with the signed-in user.
 */
const APPRAISERS = [
  "Louis Beetson",
  "Gregg Etchells",
  "David Cartwright",
  "Anna Revell",
  "Jamie Fitzsimmons",
  "Brandon Verdu",
  "Harry Steadman",
  "Marco Roberts",
];

/**
 * Very small helper to slug a label for use as an ID.
 */
function slugify(label) {
  return String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

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
 * Condition line-item fields that support Cost Required + Estimated Cost.
 */
const CONDITION_LINE_ITEMS = [
  {
    key: "frontTyre",
    label: "Front tyre",
    placeholder: "e.g. 4mm, even wear",
  },
  {
    key: "rearTyre",
    label: "Rear tyre",
    placeholder: "e.g. 3mm, may need replacing soon",
  },
  {
    key: "bodywork",
    label: "Bodywork",
    placeholder: "e.g. light marks on tank, no dents",
  },
  {
    key: "mirrors",
    label: "Mirrors",
    placeholder: "e.g. original, light marks only",
  },
  {
    key: "engine",
    label: "Engine",
    placeholder: "e.g. dry, no leaks, starts/runs well",
  },
  {
    key: "corrosion",
    label: "Corrosion",
    placeholder: "e.g. minor on fasteners / exhaust hanger",
  },
  {
    key: "exhaust",
    label: "Exhaust",
    placeholder: "e.g. OE, no damage / blowing",
  },
];

export default function PartExchangeTab({ bike, onSave, onOpenDeal }) {
  const { bikes, addBike } = useBikes();
  const { addDeal } = useDeals();
  const [activeTab, setActiveTab] = useState("bikeDetails");

  if (!bike)
    return <p className="text-sm text-slate-400">No bike selected.</p>;

  const valuations = bike.valuations || [];
  const latestValuation = valuations[0] || null;

  const linkedDeal = bike.acquisition?.linkedDeal || {};

  /* ---------------
   * Helpers
   * --------------- */

  // Format now as local datetime suitable for <input type="datetime-local" />
  const getNowLocalDateTime = () => {
    const now = new Date();
    const offsetMs = now.getTime() - now.getTimezoneOffset() * 60000;
    return new Date(offsetMs).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  };

  const ensureBikeInStore = () => {
    if (!bike) return;
    const hasId = !!bike.id;
    const alreadyExists =
      hasId && bikes.some((b) => String(b.id) === String(bike.id));

    if (!alreadyExists) {
      const id =
        bike.id ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `bike-${Date.now()}`);

      const baseBike = {
        ...bike,
        id,
        acquisition: {
          ...(bike.acquisition || {}),
          // Any bike added via PX flow is always PX source
          source: bike.acquisition?.source || "PX",
        },
      };

      addBike(baseBike);
    }
  };

  const updateFinance = (partial) => {
    ensureBikeInStore();
    onSave({
      finance: {
        ...(bike.finance || {}),
        ...partial,
      },
    });
  };

  const updateHpi = (partial) => {
    ensureBikeInStore();
    onSave({
      hpiReport: {
        ...(bike.hpiReport || {}),
        ...partial,
      },
    });
  };

  const updateAcquisition = (partial) => {
    ensureBikeInStore();
    onSave({
      acquisition: {
        ...(bike.acquisition || {}),
        ...partial,
      },
    });
  };

  const updateLinkedDeal = (partial) => {
    ensureBikeInStore();
    const current = bike.acquisition?.linkedDeal || {};
    updateAcquisition({
      linkedDeal: {
        ...current,
        ...partial,
      },
    });
  };

  const updatePxSpec = (partial) => {
    ensureBikeInStore();
    onSave({
      pxSpec: {
        ...(bike.pxSpec || {}),
        ...partial,
      },
    });
  };

  /**
   * Service history costs: one small cost object per field.
   * Keys: history, lastServiceDate, lastServiceMiles, nextMajorServiceDate
   */
  const updateServiceHistoryCost = (fieldKey, patch) => {
    ensureBikeInStore();
    const prevCosts = bike.pxSpec?.serviceHistoryCosts || {};
    const prev = prevCosts[fieldKey] || {};
    updatePxSpec({
      serviceHistoryCosts: {
        ...prevCosts,
        [fieldKey]: {
          ...prev,
          ...patch,
        },
      },
    });
  };

  const updateAppraisal = (partial) => {
    ensureBikeInStore();
    onSave({
      appraisal: {
        ...(bike.appraisal || {}),
        ...partial,
      },
    });
  };

  /**
   * Update a condition line item.
   * Supports both legacy string values and new object shape:
   * { notes, costRequired, estimatedCost }
   */
  const updateConditionField = (fieldKey, patch) => {
    ensureBikeInStore();
    const prevCondition = (bike.appraisal && bike.appraisal.condition) || {};
    const prevValue = prevCondition[fieldKey];

    let base = {};
    if (typeof prevValue === "string") {
      base = { notes: prevValue };
    } else if (prevValue && typeof prevValue === "object") {
      base = prevValue;
    }

    const nextCondition = {
      ...prevCondition,
      [fieldKey]: {
        ...base,
        ...patch,
      },
    };

    updateAppraisal({ condition: nextCondition });
  };

  const updateCommonIssueCheck = (issueId, field, value) => {
    ensureBikeInStore();
    const prevChecks =
      (bike.appraisal && bike.appraisal.commonIssuesChecks) || {};
    const prevIssue = prevChecks[issueId] || {};
    updateAppraisal({
      commonIssuesChecks: {
        ...prevChecks,
        [issueId]: {
          ...prevIssue,
          [field]: value,
        },
      },
    });
  };

  const toggleFeature = (key) => {
    ensureBikeInStore();
    const prev = bike.features || {};
    onSave({
      features: {
        ...prev,
        [key]: !prev[key],
      },
    });
  };

  const toggleAccessoryMod = (key) => {
    ensureBikeInStore();
    const prevExtras = (bike.pxSpec && bike.pxSpec.extras) || {};
    updatePxSpec({
      extras: {
        ...prevExtras,
        [key]: !prevExtras[key],
      },
    });
  };

  // Attach / upload placeholder for HPI report (per-bike)
  const attachHpiDocument = () => {
    ensureBikeInStore();
    const now = new Date().toISOString();

    const existingDocs = Array.isArray(bike.hpiReport?.documents)
      ? bike.hpiReport.documents
      : [];

    const docId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `hpidoc-${Date.now()}`;

    const newDoc = {
      id: docId,
      label: `HPI report for ${bike.registration || bike.vin || bike.id}`,
      uploadedAt: now,
      uploadedBy: bike.appraisal?.appraisedBy || "Sales Exec",
      // v1 placeholder only – later this will point to a real file / blob / URL
      storageKey: `hpi://${bike.id || bike.registration || Date.now()}`,
    };

    // Update HPI doc list
    updateHpi({
      documents: [newDoc, ...existingDocs],
    });

    // Log an event under "Valuation" heading for audit
    const existingEvents = Array.isArray(bike.events) ? bike.events : [];
    const eventId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ev-${Date.now()}`;

    const newEvent = {
      id: eventId,
      type: "valuation",
      label: "HPI report attached",
      date: now,
    };

    onSave({
      events: [newEvent, ...existingEvents],
    });
  };

  const addValuation = () => {
    ensureBikeInStore();

    const now = new Date().toISOString();
    const newVal = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `val-${Date.now()}`,
      amount: latestValuation?.amount || "",
      marketRetailPrice: latestValuation?.marketRetailPrice || "",
      estTechPrep: latestValuation?.estTechPrep || "",
      estCosmeticPrep: latestValuation?.estCosmeticPrep || "",
      estWarranty: latestValuation?.estWarranty || "",
      distributionCost: latestValuation?.distributionCost || "",
      channel: latestValuation?.channel || "Retail",
      taxFlag: latestValuation?.taxFlag || "Margin",
      notes: "",
      createdAt: now,
      createdBy: "TODO-user", // placeholder until auth/roles
    };

    onSave({
      valuations: [newVal, ...valuations],
    });

    // Move workflow into Valuation tab once created
    setActiveTab("valuation");
  };

  const updateValuationField = (id, field, value) => {
    ensureBikeInStore();
    const nextVals = valuations.map((v) =>
      v.id === id ? { ...v, [field]: value } : v
    );
    onSave({ valuations: nextVals });
  };

  const approveValuation = (id) => {
    ensureBikeInStore();
    const now = new Date().toISOString();

    const nextVals = valuations.map((v) =>
      v.id === id
        ? {
            ...v,
            approvedAt: now,
            approvedBy: "TODO-manager", // placeholder
          }
        : v
    );

    const selected = nextVals.find((v) => v.id === id) || {};

    const existingEvents = Array.isArray(bike.events) ? bike.events : [];
    const newEvent = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `ev-${Date.now()}`,
      type: "valuation",
      label: "Valuation approved",
      date: now,
      valuation: selected.amount ?? null,
      mileage: bike.totalMiles ?? bike.mileage ?? bike.odometer ?? null,
    };

    onSave({
      valuations: nextVals,
      acquisition: {
        ...(bike.acquisition || {}),
        buyInPrice: selected.amount ?? null,
        linkedPxValuationId: id,
      },
      events: [newEvent, ...existingEvents],
    });
  };

  const handleFinalSubmit = () => {
    ensureBikeInStore();
    const now = new Date().toISOString();

    // 1) Update PX status
    onSave({
      status: "PX Submitted",
      acquisition: {
        ...(bike.acquisition || {}),
        submittedAt: now,
      },
    });

    // 2) Create a Deal (only if we have a target registration and haven't already created one)
    if (addDeal && linkedDeal.targetRegistration && !linkedDeal.createdDealId) {
      const dealId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `deal-${Date.now()}`;

      const newDeal = {
        id: dealId,
        status: "Negotiation",
        createdAt: now,
        source: "PX",
        saleBikeRegistration: linkedDeal.targetRegistration,
        pxBikeId: bike.id || null,
        pxRegistration: bike.registration || null,
        financeRequired: !!linkedDeal.financeRequired,
        additionalDeposit:
          linkedDeal.additionalDeposit !== undefined &&
          linkedDeal.additionalDeposit !== null &&
          linkedDeal.additionalDeposit !== ""
            ? Number(linkedDeal.additionalDeposit)
            : 0,
      };

      try {
        addDeal(newDeal);
      } catch (e) {
        // Fail silently for now – PX still submits even if deal creation fails
        // eslint-disable-next-line no-console
        console.error("Failed to create deal from PX:", e);
      }

      // Persist the created deal id against the PX bike so we don't double-create later
      updateLinkedDeal({
        createdDealId: dealId,
        createdAt: now,
      });
    }

    // 3) Optionally open the linked deal view
    if (onOpenDeal) onOpenDeal();
  };

  /* ---------------
   * Catalogue-driven dropdown options (Make / Model / Trim)
   * --------------- */

  const makeOptions = useMemo(
    () => getMakes().map((m) => ({ value: m, label: m })),
    []
  );

  const modelOptions = useMemo(
    () =>
      bike.make
        ? getModels(bike.make).map((m) => ({ value: m, label: m }))
        : [],
    [bike.make]
  );

  const trimOptions = useMemo(() => {
    if (!bike.make || !bike.model) return [];
    const key = `${bike.make}|${bike.model}`;
    const list = TRIMS_BY_MODEL[key] || [];
    return list.map((t) => ({ value: t, label: t }));
  }, [bike.make, bike.model]);

  /* ---------------
   * Dynamic feature fields (like AddBike)
   * --------------- */

  const featureFields = useMemo(() => {
    try {
      let raw = [];
      if (bike.make && bike.model) {
        // catalog.js implementation ignores extra args safely if not used
        raw = getFeatureFields(bike.make, bike.model, bike.year) || [];
      }

      const source = raw.length ? raw : DEFAULT_FEATURE_FIELDS;

      return source.map((f) => ({
        key: f.key ?? f.id ?? f.name,
        label: f.label,
      }));
    } catch {
      return DEFAULT_FEATURE_FIELDS.map((f) => ({ ...f }));
    }
  }, [bike.make, bike.model, bike.year]);

  /* ---------------
   * Derived flags – QoR checks
   * --------------- */
  const hasHpiClear =
    bike.hpiReport && ["Clear", "Warning"].includes(bike.hpiReport.status);
  const hasAtLeastOnePhoto =
    Array.isArray(bike.photos) && bike.photos.length > 0;
  const financeAnswered =
    bike.finance && typeof bike.finance.hasFinance === "boolean";

  const canCreateValuation =
    hasHpiClear && hasAtLeastOnePhoto && financeAnswered;

  const canSubmitPx = canCreateValuation && valuations.length > 0;

  /* ---------------
   * Data-driven common issues
   * --------------- */

  // Derived from Warranty / Service / Prep events on similar bikes
  const derivedCommonIssues = useMemo(() => {
    if (!bike?.make || !bike?.model) return [];

    const relevant = (bikes || []).filter(
      (other) =>
        other &&
        other.id !== bike.id &&
        other.make === bike.make &&
        other.model === bike.model
    );

    const counters = new Map();

    for (const other of relevant) {
      const events = Array.isArray(other.events) ? other.events : [];
      for (const ev of events) {
        if (
          !ev ||
          !ev.label ||
          !["warranty", "service", "prep", "preparation"].includes(
            String(ev.type || "").toLowerCase()
          )
        ) {
          continue;
        }
        const key = ev.issueKey || ev.label;
        counters.set(key, (counters.get(key) || 0) + 1);
      }
    }

    const sorted = [...counters.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted.map(([label, count]) => ({
      id: `derived-${slugify(label)}`,
      label: `${label} (seen on ${count} similar bike${
        count > 1 ? "s" : ""
      })`,
    }));
  }, [bikes, bike?.id, bike?.make, bike?.model]);

  // Static/model-specific issues from catalog
  const staticIssues = useMemo(() => {
    if (!bike?.make || !bike?.model) return [];
    const raw = getCommonIssues(bike.make, bike.model, bike.year) || [];
    return raw.map((issue) => ({
      id: issue.id || `catalog-${slugify(issue.label)}`,
      label: issue.label,
    }));
  }, [bike?.make, bike?.model, bike?.year]);

  // Combined list: catalog → data-driven (no duplicates)
  const combinedCommonIssues = useMemo(() => {
    const byId = new Map();
    for (const issue of staticIssues) {
      byId.set(issue.id, issue);
    }
    for (const issue of derivedCommonIssues) {
      if (!byId.has(issue.id)) {
        byId.set(issue.id, issue);
      }
    }
    return [...byId.values()];
  }, [staticIssues, derivedCommonIssues]);

  /* ---------------
   * Tab nav helpers
   * --------------- */
  const activeIndex = useMemo(
    () => TABS.findIndex((t) => t.id === activeTab),
    [activeTab]
  );
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

  /* ---------------
   * UI
   * --------------- */
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
        {/* BIKE DETAILS TAB – high-level info + HPI + QoR + Linked Deal */}
        {activeTab === "bikeDetails" && (
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Left: basic PX details, finance, linked deal */}
              <section className="rounded-2xl bg-slate-900/80 p-5 shadow">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  Basic PX Details
                </h2>

                <div className="space-y-4">
                  {/* Make / Model / Trim – mirroring AddBike */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Make */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Make
                      </label>
                      <select
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        value={bike.make || ""}
                        onChange={(e) => {
                          const nextMake = e.target.value || "";
                          onSave({
                            make: nextMake,
                            model: "",
                            trim: "",
                          });
                        }}
                      >
                        <option value="">Select make…</option>
                        {makeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Model
                      </label>
                      <select
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        value={bike.model || ""}
                        onChange={(e) => {
                          const nextModel = e.target.value || "";
                          onSave({
                            model: nextModel,
                            trim: "",
                          });
                        }}
                        disabled={!bike.make}
                      >
                        <option value="">
                          {bike.make ? "Select model…" : "Choose make first…"}
                        </option>
                        {modelOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trim / Variant */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Trim / Variant
                      </label>
                      {trimOptions.length > 0 ? (
                        <select
                          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                          value={bike.trim || ""}
                          onChange={(e) =>
                            onSave({
                              trim: e.target.value || "",
                            })
                          }
                          disabled={!bike.make || !bike.model}
                        >
                          <option value="">
                            {bike.make && bike.model
                              ? "Select trim…"
                              : "Choose make & model first…"}
                          </option>
                          {trimOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                          value={bike.trim || ""}
                          onChange={(e) =>
                            onSave({
                              trim: e.target.value,
                            })
                          }
                          placeholder="TE, Sport, Triple Black..."
                        />
                      )}
                    </div>
                  </div>

                  {/* Customer price + appraiser info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Customer&apos;s valuation (£)
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        value={bike.appraisal?.customerValuation || ""}
                        onChange={(e) =>
                          updateAppraisal({
                            customerValuation: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Appraised by
                      </label>
                      <select
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        value={bike.appraisal?.appraisedBy || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const next = {
                            ...(bike.appraisal || {}),
                            appraisedBy: value,
                          };

                          // Auto-stamp appraisedAt if it isn't already set
                          if (!next.appraisedAt && value) {
                            next.appraisedAt = getNowLocalDateTime();
                          }

                          onSave({ appraisal: next });
                        }}
                      >
                        <option value="">Select appraiser…</option>
                        {APPRAISERS.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Appraised at
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                        value={bike.appraisal?.appraisedAt || ""}
                        onChange={(e) =>
                          updateAppraisal({ appraisedAt: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Finance question about the PX bike */}
                  <div className="border-t border-slate-800 pt-4 mt-2">
                    <p className="text-xs font-semibold text-slate-300 mb-2">
                      Outstanding Finance on PX (QoR required)
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-slate-200">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          className="accent-blue-500"
                          checked={bike.finance?.hasFinance === true}
                          onChange={() => updateFinance({ hasFinance: true })}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          className="accent-blue-500"
                          checked={bike.finance?.hasFinance === false}
                          onChange={() => updateFinance({ hasFinance: false })}
                        />
                        <span>No</span>
                      </label>
                    </div>

                    {bike.finance?.hasFinance === true && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Settlement amount (£)
                          </label>
                          <input
                            type="number"
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                            value={bike.finance?.settlementAmount || ""}
                            onChange={(e) =>
                              updateFinance({
                                settlementAmount: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Finance provider
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                            value={bike.finance?.provider || ""}
                            onChange={(e) =>
                              updateFinance({ provider: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Linked Deal (new bike context) */}
                  <div className="border-t border-slate-800 pt-4 mt-2">
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">
                      Linked Deal (New Bike)
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Link this PX to the bike the customer is buying so we can
                      build a full deal and profit chain.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Registration of new / stock bike */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Sale bike registration
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                          placeholder="e.g. DE22 XYZ"
                          value={linkedDeal.targetRegistration || ""}
                          onChange={(e) =>
                            updateLinkedDeal({
                              targetRegistration: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      </div>

                      {/* Finance required on new bike */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Finance required on new bike?
                        </label>
                        <div className="flex items-center gap-4 text-sm text-slate-200">
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="radio"
                              className="accent-blue-500"
                              checked={linkedDeal.financeRequired === true}
                              onChange={() =>
                                updateLinkedDeal({ financeRequired: true })
                              }
                            />
                            <span>Yes</span>
                          </label>
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="radio"
                              className="accent-blue-500"
                              checked={linkedDeal.financeRequired === false}
                              onChange={() =>
                                updateLinkedDeal({ financeRequired: false })
                              }
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      {/* Additional deposit on new bike */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Additional deposit on new bike (£)
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                          placeholder="0"
                          value={
                            linkedDeal.additionalDeposit !== undefined &&
                            linkedDeal.additionalDeposit !== null
                              ? linkedDeal.additionalDeposit
                              : ""
                          }
                          onChange={(e) =>
                            updateLinkedDeal({
                              additionalDeposit: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {linkedDeal.createdDealId && (
                      <p className="mt-2 text-[11px] text-emerald-400">
                        Linked Deal already created (ID:{" "}
                        <span className="font-mono">
                          {linkedDeal.createdDealId}
                        </span>
                        ). Submitting again won&apos;t create a duplicate.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Right: Checks & Compliance (HPI + QoR summary) */}
              <section className="rounded-2xl bg-slate-900/80 p-5 shadow">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  Checks &amp; Compliance
                </h2>

                {/* HPI */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-300">
                      HPI / Provenance (must be done before valuation)
                    </p>
                    <span className="text-xs rounded-full px-2 py-1 bg-slate-800 text-slate-200">
                      {bike.hpiReport?.status || "NotStarted"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
                      onClick={() => {
                        ensureBikeInStore();
                        const now = new Date().toISOString();

                        // Update HPI status
                        updateHpi({
                          status: "Clear",
                          checkedAt: now,
                          checkedBy: bike.appraisal?.appraisedBy || "Sales Exec",
                        });

                        // Log a valuation-type event so it appears under "Valuation"
                        const existingEvents = Array.isArray(bike.events)
                          ? bike.events
                          : [];
                        const eventId =
                          typeof crypto !== "undefined" && crypto.randomUUID
                            ? crypto.randomUUID()
                            : `ev-${Date.now()}`;

                        const newEvent = {
                          id: eventId,
                          type: "valuation",
                          label: "HPI check completed",
                          date: now,
                          hpiStatus: "Clear",
                          mileage:
                            bike.totalMiles ??
                            bike.mileage ??
                            bike.odometer ??
                            null,
                        };

                        onSave({
                          events: [newEvent, ...existingEvents],
                        });
                      }}
                    >
                      Mark HPI as Clear
                    </button>

                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700"
                      onClick={attachHpiDocument}
                    >
                      Attach HPI report (placeholder)
                    </button>

                    <p className="text-[11px] text-slate-400">
                      Attached HPI reports:{" "}
                      <span className="font-semibold text-slate-200">
                        {Array.isArray(bike.hpiReport?.documents)
                          ? bike.hpiReport.documents.length
                          : 0}
                      </span>
                    </p>

                    <p className="text-[11px] text-slate-500">
                      v1: HPI status and attachments are stored against this
                      bike for audit. Later this will integrate with a live HPI
                      API and real file uploads.
                    </p>
                  </div>
                </div>

                {/* QoR status mini-summary */}
                <div className="border-t border-slate-800 pt-4">
                  <p className="text-xs font-semibold text-slate-300 mb-2">
                    QoR submission checklist
                  </p>
                  <ul className="text-[11px] text-slate-400 space-y-1">
                    <li>
                      • HPI done:{" "}
                      <span
                        className={
                          hasHpiClear ? "text-green-400" : "text-red-400"
                        }
                      >
                        {hasHpiClear ? "Yes" : "No"}
                      </span>
                    </li>
                    <li>
                      • Finance question answered (PX):{" "}
                      <span
                        className={
                          financeAnswered ? "text-green-400" : "text-red-400"
                        }
                      >
                        {financeAnswered ? "Yes" : "No"}
                      </span>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* SPECIFICATION TAB – dynamic features + accessories/mods checklist */}
        {activeTab === "specification" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Specification
            </h2>
            <p className="text-xs text-slate-400">
              Model-led Features &amp; Equipment plus accessories and
              modifications that impact valuation and marketing.
            </p>

            {/* Dynamic Features & Equipment – mirrors AddBike */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Features &amp; Equipment
              </h3>
              <p className="text-[11px] text-slate-500 mb-1">
                Driven by catalog where available; falls back to a core list if
                not defined for this bike.
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {featureFields.map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={!!(bike.features && bike.features[field.key])}
                      onChange={() => toggleFeature(field.key)}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs">{field.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Accessories & Mods checklist */}
            <section className="space-y-3 mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Accessories &amp; Non-Standard Items
              </h3>
              <p className="text-[11px] text-slate-500 mb-1">
                Tick anything fitted to this bike that isn&apos;t part of the
                standard factory spec.
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {ACCESSORY_MOD_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={
                        !!(
                          bike.pxSpec &&
                          bike.pxSpec.extras &&
                          bike.pxSpec.extras[opt.key]
                        )
                      }
                      onChange={() => toggleAccessoryMod(opt.key)}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* CONDITION & HISTORY TAB – service history, condition detail, common issues, photos */}
        {activeTab === "condition" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Condition &amp; History
            </h2>
            <p className="text-xs text-slate-400">
              Service history, structured condition checks, common known issues
              and photo records for this PX.
            </p>

            {/* Service history at the top */}
            <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">
                Service History
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Service History type */}
                <ServiceHistoryField
                  label="Service History"
                  type="select"
                  value={bike.pxSpec?.serviceHistoryType || ""}
                  onValueChange={(val) =>
                    updatePxSpec({ serviceHistoryType: val })
                  }
                  options={[
                    { value: "", label: "Select…" },
                    { value: "Full", label: "Full" },
                    { value: "Partial", label: "Partial" },
                    { value: "Self", label: "Self" },
                    { value: "None", label: "None" },
                  ]}
                  cost={
                    bike.pxSpec?.serviceHistoryCosts?.history || {
                      costRequired: false,
                      estimatedCost: "",
                    }
                  }
                  onCostChange={(patch) =>
                    updateServiceHistoryCost("history", patch)
                  }
                />

                {/* Date of last service */}
                <ServiceHistoryField
                  label="Date of Last Service"
                  type="date"
                  value={bike.pxSpec?.lastServiceDate || ""}
                  onValueChange={(val) =>
                    updatePxSpec({ lastServiceDate: val })
                  }
                  cost={
                    bike.pxSpec?.serviceHistoryCosts?.lastServiceDate || {
                      costRequired: false,
                      estimatedCost: "",
                    }
                  }
                  onCostChange={(patch) =>
                    updateServiceHistoryCost("lastServiceDate", patch)
                  }
                />

                {/* Miles at last service */}
                <ServiceHistoryField
                  label="Miles at Last Service"
                  type="number"
                  value={bike.pxSpec?.lastServiceMiles || ""}
                  onValueChange={(val) =>
                    updatePxSpec({ lastServiceMiles: val })
                  }
                  cost={
                    bike.pxSpec?.serviceHistoryCosts?.lastServiceMiles || {
                      costRequired: false,
                      estimatedCost: "",
                    }
                  }
                  onCostChange={(patch) =>
                    updateServiceHistoryCost("lastServiceMiles", patch)
                  }
                />

                {/* Next major service due */}
                <ServiceHistoryField
                  label="Next Major Service Due"
                  type="date"
                  value={bike.pxSpec?.nextMajorServiceDate || ""}
                  onValueChange={(val) =>
                    updatePxSpec({ nextMajorServiceDate: val })
                  }
                  cost={
                    bike.pxSpec?.serviceHistoryCosts?.nextMajorServiceDate || {
                      costRequired: false,
                      estimatedCost: "",
                    }
                  }
                  onCostChange={(patch) =>
                    updateServiceHistoryCost("nextMajorServiceDate", patch)
                  }
                />
              </div>
            </section>

            {/* Condition summary + common issues in a 2-column layout */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Condition summary – structured fields with Cost Required + Estimated Cost */}
              <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  Condition Summary
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Record the condition of key components, and flag any items
                  where a prep cost is required.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONDITION_LINE_ITEMS.map((field) => (
                    <ConditionField
                      key={field.key}
                      label={field.label}
                      placeholder={field.placeholder}
                      condition={
                        bike.appraisal?.condition?.[field.key] ??
                        bike.appraisal?.condition?.[field.key] ??
                        ""
                      }
                      onChange={(patch) =>
                        updateConditionField(field.key, patch)
                      }
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
                    value={
                      (() => {
                        const v =
                          bike.appraisal?.condition?.overallNotes ?? "";
                        if (typeof v === "string") return v;
                        if (v && typeof v === "object") return v.notes || "";
                        return "";
                      })()
                    }
                    onChange={(e) =>
                      updateConditionField("overallNotes", {
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </section>

              {/* Common issues – static + data-driven, with Cost Required + Estimated Cost */}
              <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  Common Issues
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Model-specific checks plus patterns from Warranty / Service /
                  Prep events on similar bikes. You can also flag cost
                  implications for each issue.
                </p>

                {combinedCommonIssues.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No model-specific issues detected yet. As more Warranty,
                    Service and Preparation events are recorded for this model,
                    we&apos;ll surface common jobs here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {combinedCommonIssues.map((issue) => {
                      const checks =
                        bike.appraisal?.commonIssuesChecks?.[issue.id] || {};
                      const costRequired = !!checks.costRequired;
                      const estimatedCost = checks.estimatedCost ?? "";

                      return (
                        <div
                          key={issue.id}
                          className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 space-y-1.5"
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
                              updateCommonIssueCheck(
                                issue.id,
                                "notes",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Photos – kept at the bottom */}
            <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Photos
              </h3>
              <p className="text-xs text-slate-400 mb-2">
                Minimum 1 walkaround photo required before valuation.
              </p>
              <p className="text-xs text-slate-400 mb-2">
                Current photos:{" "}
                <span className="font-semibold text-slate-200">
                  {Array.isArray(bike.photos) ? bike.photos.length : 0}
                </span>
              </p>
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700"
                onClick={() => {
                  ensureBikeInStore();
                  const now = new Date().toISOString();
                  const newPhoto = {
                    id:
                      typeof crypto !== "undefined" && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `photo-${Date.now()}`,
                    url: "placeholder://local-photo",
                    uploadedAt: now,
                    uploadedBy: bike.appraisal?.appraisedBy || "Sales Exec",
                    tag: "Walkaround",
                  };
                  const existing = Array.isArray(bike.photos)
                    ? bike.photos
                    : [];
                  onSave({ photos: [...existing, newPhoto] });
                }}
              >
                Add placeholder photo
              </button>
              <p className="mt-2 text-[11px] text-slate-500">
                v1: adds a placeholder record only. Later this will hook into
                file upload / camera capture.
              </p>
            </section>
          </div>
        )}

        {/* VALUATION TAB – valuations list + deal snapshot */}
        {activeTab === "valuation" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-slate-100">
                Valuation(s)
              </h2>
              <button
                type="button"
                disabled={!canCreateValuation}
                onClick={addValuation}
                className={`text-xs px-3 py-2 rounded-lg font-semibold ${
                  canCreateValuation
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                Create new valuation
              </button>
            </div>
            {!canCreateValuation && (
              <p className="text-[11px] text-amber-400 mb-1">
                Complete QoR checks (HPI, at least one photo, and finance
                question) before creating a valuation.
              </p>
            )}

            <div className="grid gap-4 lg:grid-cols-[2fr,1.3fr]">
              {/* Valuations list / editor */}
              <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
                {valuations.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No valuations yet. Use &quot;Create new valuation&quot; once
                    QoR checks are complete.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {valuations.map((v, idx) => (
                      <div
                        key={v.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-slate-300">
                            Valuation v{valuations.length - idx}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            {v.createdAt
                              ? new Date(v.createdAt).toLocaleString()
                              : "Draft"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <FieldNumber
                            label="Expected retail (£)"
                            value={v.marketRetailPrice}
                            onChange={(val) =>
                              updateValuationField(
                                v.id,
                                "marketRetailPrice",
                                val
                              )
                            }
                          />
                          <FieldNumber
                            label="Buy-in valuation (£)"
                            value={v.amount}
                            onChange={(val) =>
                              updateValuationField(v.id, "amount", val)
                            }
                          />
                          <FieldNumber
                            label="Tech prep est. (£)"
                            value={v.estTechPrep}
                            onChange={(val) =>
                              updateValuationField(v.id, "estTechPrep", val)
                            }
                          />
                          <FieldNumber
                            label="Cosmetic prep est. (£)"
                            value={v.estCosmeticPrep}
                            onChange={(val) =>
                              updateValuationField(
                                v.id,
                                "estCosmeticPrep",
                                val
                              )
                            }
                          />
                          <FieldNumber
                            label="Warranty provision (£)"
                            value={v.estWarranty}
                            onChange={(val) =>
                              updateValuationField(v.id, "estWarranty", val)
                            }
                          />
                          <FieldNumber
                            label="Distribution / marketing (£)"
                            value={v.distributionCost}
                            onChange={(val) =>
                              updateValuationField(
                                v.id,
                                "distributionCost",
                                val
                              )
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Channel
                            </label>
                            <select
                              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100"
                              value={v.channel || "Retail"}
                              onChange={(e) =>
                                updateValuationField(
                                  v.id,
                                  "channel",
                                  e.target.value
                                )
                              }
                            >
                              <option value="Retail">Retail</option>
                              <option value="Trader">Trader</option>
                              <option value="Auction">Auction</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Tax / VAT flag
                            </label>
                            <select
                              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100"
                              value={v.taxFlag || "Margin"}
                              onChange={(e) =>
                                updateValuationField(
                                  v.id,
                                  "taxFlag",
                                  e.target.value
                                )
                              }
                            >
                              <option value="Margin">Margin</option>
                              <option value="VATQualifying">
                                VAT Qualifying
                              </option>
                              <option value="NonVat">Non-VAT</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-2">
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">
                            Notes
                          </label>
                          <textarea
                            rows={2}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100"
                            value={v.notes || ""}
                            onChange={(e) =>
                              updateValuationField(
                                v.id,
                                "notes",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[11px] text-slate-500">
                            Approved:{" "}
                            {v.approvedAt
                              ? `${new Date(
                                  v.approvedAt
                                ).toLocaleDateString()} by ${
                                  v.approvedBy || "Manager"
                                }`
                              : "No"}
                          </p>
                          <button
                            type="button"
                            className="text-[11px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                            onClick={() => approveValuation(v.id)}
                          >
                            Approve &amp; set as buy-in
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Deal snapshot */}
              <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
                <h2 className="text-lg font-semibold text-slate-100 mb-3">
                  Deal Snapshot
                </h2>

                {latestValuation ? (
                  <>
                    <p className="text-sm text-slate-300 mb-2">
                      This summarises how this buy-in fits into the overall deal
                      (linked sale bike + finance + products).
                    </p>

                    <dl className="space-y-2 text-sm text-slate-200 mb-4">
                      <div className="flex justify-between">
                        <dt className="text-slate-400">
                          Buy in Price (approved)
                        </dt>
                        <dd>
                          £
                          {bike.acquisition?.buyInPrice ??
                            latestValuation.amount ??
                            "0"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Expected retail</dt>
                        <dd>£{latestValuation.marketRetailPrice || "0"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">
                          Total prep &amp; costs
                        </dt>
                        <dd>
                          £
                          {[
                            latestValuation.estTechPrep,
                            latestValuation.estCosmeticPrep,
                            latestValuation.estWarranty,
                            latestValuation.distributionCost,
                          ]
                            .map((x) => Number(x || 0))
                            .reduce((a, b) => a + b, 0)
                            .toLocaleString()}
                        </dd>
                      </div>
                    </dl>

                    <button
                      type="button"
                      className="w-full text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold mb-2"
                      onClick={onOpenDeal}
                    >
                      Link / open deal (Negotiation)
                    </button>

                    <p className="text-[11px] text-slate-500">
                      v1: this just calls <code>onOpenDeal()</code>. Later we’ll
                      auto-create a Deal in <code>Negotiation</code> status
                      linked to this buy-in and sale bike, with full chain
                      P&amp;L.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    Once a valuation exists, we&apos;ll show margin preview and
                    link to the Deal here.
                  </p>
                )}
              </section>
            </div>
          </div>
        )}

        {/* SUMMARY & INSIGHTS TAB (merged) */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Summary &amp; Insights
            </h2>
            <p className="text-xs text-slate-400">
              Final checklist, linked deal context and high-level insights
              before you submit this PX for manager review.
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
                        financeAnswered
                          ? "text-green-400 mr-2"
                          : "text-red-400 mr-2"
                      }
                    >
                      ●
                    </span>
                    Finance question answered on PX (
                    {financeAnswered ? "Yes" : "No"})
                  </li>
                </ul>

                {!canCreateValuation && (
                  <p className="mt-3 text-[11px] text-amber-400">
                    Complete all QoR checks (including photos in the Condition
                    tab) before submitting this PX.
                  </p>
                )}
              </section>

              {/* Valuation recap */}
              <section className="rounded-2xl bg-slate-900/80 p-4 shadow">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  Valuation Recap
                </h3>

                {latestValuation ? (
                  <>
                    <dl className="space-y-2 text-xs text-slate-200 mb-3">
                      <div className="flex justify-between">
                        <dt className="text-slate-400">
                          Latest buy-in valuation
                        </dt>
                        <dd>£{latestValuation.amount || "0"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">
                          Expected retail (latest)
                        </dt>
                        <dd>£{latestValuation.marketRetailPrice || "0"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Valuations created</dt>
                        <dd>{valuations.length}</dd>
                      </div>
                    </dl>
                    <p className="text-[11px] text-slate-500">
                      The latest valuation will be treated as the primary
                      reference unless a specific one is approved as the buy-in.
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
                    <dd className="font-mono">
                      {linkedDeal.targetRegistration}
                    </dd>
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
                      <dd className="font-mono">
                        {linkedDeal.createdDealId}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-xs text-slate-400">
                  No linked sale bike set yet. Add a sale bike registration in
                  the Bike Details tab to auto-create a Deal when you submit
                  this PX.
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
                recommended retail window, and common issues for this model
                based on your data.
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
                onClick={handleFinalSubmit}
                disabled={!canSubmitPx}
                className={`px-4 py-2 text-xs rounded-lg font-semibold ${
                  canSubmitPx
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                Submit Valuation for Approval
              </button>
            </div>
          </div>
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
              Use &quot;Submit Valuation for Approval&quot; to complete this PX
              and create the linked Deal.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* Small helper component for compact numeric fields */
function FieldNumber({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-400 mb-1">
        {label}
      </label>
      <input
        type="number"
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-100"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Condition field with notes + Cost Required + Estimated Cost.
 * Accepts either a legacy string or an object { notes, costRequired, estimatedCost }.
 */
function ConditionField({ label, condition, onChange, placeholder }) {
  let notes = "";
  let costRequired = false;
  let estimatedCost = "";

  if (typeof condition === "string") {
    notes = condition;
  } else if (condition && typeof condition === "object") {
    notes = condition.notes || "";
    costRequired = !!condition.costRequired;
    estimatedCost = condition.estimatedCost ?? "";
  }

  const handleNotesChange = (e) => {
    onChange({ notes: e.target.value });
  };

  const handleCostRequiredChange = (e) => {
    const checked = e.target.checked;
    onChange({
      costRequired: checked,
      estimatedCost: checked ? estimatedCost : "",
    });
  };

  const handleEstimatedCostChange = (e) => {
    onChange({ estimatedCost: e.target.value });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-medium text-slate-200">
          {label}
        </label>
        <label className="inline-flex items-center gap-1 text-[11px] text-slate-300">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
            checked={costRequired}
            onChange={handleCostRequiredChange}
          />
          <span>Cost Required</span>
        </label>
      </div>

      <input
        type="text"
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-slate-100"
        value={notes}
        onChange={handleNotesChange}
        placeholder={placeholder}
      />

      {costRequired && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-300">
            Estimated Cost (£)
          </span>
          <input
            type="number"
            min="0"
            step="1"
            className="w-24 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-100"
            value={estimatedCost}
            onChange={handleEstimatedCostChange}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Service history field with Cost Required + Estimated Cost.
 * `type` controls the main input type (select, date, number, text).
 */
function ServiceHistoryField({
  label,
  type,
  value,
  onValueChange,
  options = [],
  cost,
  onCostChange,
}) {
  const costRequired = !!cost.costRequired;
  const estimatedCost = cost.estimatedCost ?? "";

  const handleCostRequiredChange = (e) => {
    const checked = e.target.checked;
    onCostChange({
      costRequired: checked,
      estimatedCost: checked ? estimatedCost : "",
    });
  };

  const handleEstimatedCostChange = (e) => {
    onCostChange({
      estimatedCost: e.target.value,
    });
  };

  const baseInputClasses =
    "w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-medium text-slate-400">
          {label}
        </label>
        <label className="inline-flex items-center gap-1 text-[11px] text-slate-300">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-sky-500"
            checked={costRequired}
            onChange={handleCostRequiredChange}
          />
          <span>Cost Required</span>
        </label>
      </div>

      {/* Main value field */}
      {type === "select" ? (
        <select
          className={baseInputClasses}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={baseInputClasses}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        />
      )}

      {/* Estimated Cost */}
      {costRequired && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-300">
            Estimated Cost (£)
          </span>
          <input
            type="number"
            min="0"
            step="1"
            className="w-24 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-100"
            value={estimatedCost}
            onChange={handleEstimatedCostChange}
          />
        </div>
      )}
    </div>
  );
}
