// src/pages/Bikes/PartExchange/usePxPartExchange.js
import { useMemo } from "react";
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
export const TRIMS_BY_MODEL = {
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
export const DEFAULT_FEATURE_FIELDS = [
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
export const ACCESSORY_MOD_OPTIONS = [
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
export const APPRAISERS = [
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
export function slugify(label) {
  return String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Condition line-item fields that support Cost Required + Estimated Cost.
 * Shared between PX Condition tab and any future views.
 */
export const CONDITION_LINE_ITEMS = [
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

/**
 * Get total estimated PX prep costs from:
 *  - Condition fields (bike.appraisal.condition[*].estimatedCost)
 *  - Service history fields (bike.pxSpec.serviceHistoryCosts[*].estimatedCost)
 */
export function getPxEstimatedCostTotals(bike) {
  if (!bike) {
    return {
      conditionTotal: 0,
      serviceHistoryTotal: 0,
      grandTotal: 0,
    };
  }

  let conditionTotal = 0;
  let serviceHistoryTotal = 0;

  // 1) Condition costs
  const condition = bike.appraisal?.condition || {};
  for (const value of Object.values(condition)) {
    if (!value || typeof value !== "object") continue;

    const raw = value.estimatedCost ?? null;
    const num = Number(raw);

    if (!Number.isNaN(num) && num > 0) {
      conditionTotal += num;
    }
  }

  // 2) Service history costs
  const serviceHistoryCosts = bike.pxSpec?.serviceHistoryCosts || {};
  for (const cost of Object.values(serviceHistoryCosts)) {
    if (!cost || typeof cost !== "object") continue;

    if (cost.costRequired === false) continue;

    const raw = cost.estimatedCost ?? null;
    const num = Number(raw);

    if (!Number.isNaN(num) && num > 0) {
      serviceHistoryTotal += num;
    }
  }

  return {
    conditionTotal,
    serviceHistoryTotal,
    grandTotal: conditionTotal + serviceHistoryTotal,
  };
}

/**
 * Main PX hook used by PartExchangeTab and its sub-tabs.
 */
export function usePxPartExchange(bike, onSave, onOpenDeal) {
  const { bikes, addBike } = useBikes();
  const { addDeal } = useDeals();

  const valuations = bike?.valuations || [];
  const latestValuation = valuations[0] || null;
  const linkedDeal = bike?.acquisition?.linkedDeal || {};

  // ---------- Helpers ----------

  const getNowLocalDateTime = () => {
    const now = new Date();
    const offsetMs = now.getTime() - now.getTimezoneOffset() * 60000;
    return new Date(offsetMs).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  };

  const ensureBikeInStore = () => {
    if (!bike || !onSave) return;

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
          source: bike.acquisition?.source || "PX",
        },
      };

      addBike(baseBike);
      // ensure local object also has id so subsequent operations are consistent
      onSave({ id });
    }
  };

  const updateFinance = (partial) => {
    if (!onSave) return;
    ensureBikeInStore();
    onSave({
      finance: {
        ...(bike.finance || {}),
        ...partial,
      },
    });
  };

  const updateHpi = (partial) => {
    if (!onSave) return;
    ensureBikeInStore();
    onSave({
      hpiReport: {
        ...(bike.hpiReport || {}),
        ...partial,
      },
    });
  };

  const updateAcquisition = (partial) => {
    if (!onSave) return;
    ensureBikeInStore();
    onSave({
      acquisition: {
        ...(bike.acquisition || {}),
        ...partial,
      },
    });
  };

  const updateLinkedDeal = (partial) => {
    const current = bike?.acquisition?.linkedDeal || {};
    updateAcquisition({
      linkedDeal: {
        ...current,
        ...partial,
      },
    });
  };

  const updatePxSpec = (partial) => {
    if (!onSave) return;
    ensureBikeInStore();
    onSave({
      pxSpec: {
        ...(bike.pxSpec || {}),
        ...partial,
      },
    });
  };

  const updateServiceHistoryCost = (fieldKey, patch) => {
    const prevCosts = bike?.pxSpec?.serviceHistoryCosts || {};
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
    if (!onSave) return;
    ensureBikeInStore();
    onSave({
      appraisal: {
        ...(bike.appraisal || {}),
        ...partial,
      },
    });
  };

  const updateConditionField = (fieldKey, patch) => {
    const prevCondition = bike?.appraisal?.condition || {};
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
    const prevChecks = bike?.appraisal?.commonIssuesChecks || {};
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
    if (!onSave) return;
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
    const prevExtras = bike?.pxSpec?.extras || {};
    updatePxSpec({
      extras: {
        ...prevExtras,
        [key]: !prevExtras[key],
      },
    });
  };

  const attachHpiDocument = () => {
    ensureBikeInStore();
    const now = new Date().toISOString();

    const existingDocs = Array.isArray(bike?.hpiReport?.documents)
      ? bike.hpiReport.documents
      : [];

    const docId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `hpidoc-${Date.now()}`;

    const newDoc = {
      id: docId,
      label: `HPI report for ${bike?.registration || bike?.vin || bike?.id}`,
      uploadedAt: now,
      uploadedBy: bike?.appraisal?.appraisedBy || "Sales Exec",
      storageKey: `hpi://${bike?.id || bike?.registration || Date.now()}`,
    };

    updateHpi({
      documents: [newDoc, ...existingDocs],
    });

    const existingEvents = Array.isArray(bike?.events) ? bike.events : [];
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

    onSave?.({
      events: [newEvent, ...existingEvents],
    });
  };

  const markHpiClear = () => {
    ensureBikeInStore();
    const now = new Date().toISOString();

    updateHpi({
      status: "Clear",
      checkedAt: now,
      checkedBy: bike?.appraisal?.appraisedBy || "Sales Exec",
    });

    const existingEvents = Array.isArray(bike?.events) ? bike.events : [];
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
        bike?.totalMiles ?? bike?.mileage ?? bike?.odometer ?? null,
    };

    onSave?.({
      events: [newEvent, ...existingEvents],
    });
  };

  const addPlaceholderPhoto = () => {
    ensureBikeInStore();
    const now = new Date().toISOString();
    const newPhoto = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `photo-${Date.now()}`,
      url: "placeholder://local-photo",
      uploadedAt: now,
      uploadedBy: bike?.appraisal?.appraisedBy || "Sales Exec",
      tag: "Walkaround",
    };
    const existing = Array.isArray(bike?.photos) ? bike.photos : [];
    onSave?.({ photos: [...existing, newPhoto] });
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
      createdBy: "TODO-user",
    };

    onSave?.({
      valuations: [newVal, ...valuations],
    });
  };

  const updateValuationField = (id, field, value) => {
    const nextVals = valuations.map((v) =>
      v.id === id ? { ...v, [field]: value } : v
    );
    onSave?.({ valuations: nextVals });
  };

  const approveValuation = (id) => {
    ensureBikeInStore();
    const now = new Date().toISOString();

    const nextVals = valuations.map((v) =>
      v.id === id
        ? {
            ...v,
            approvedAt: now,
            approvedBy: "TODO-manager",
          }
        : v
    );

    const selected = nextVals.find((v) => v.id === id) || {};

    const existingEvents = Array.isArray(bike?.events) ? bike.events : [];
    const newEvent = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `ev-${Date.now()}`,
      type: "valuation",
      label: "Valuation approved",
      date: now,
      valuation: selected.amount ?? null,
      mileage:
        bike?.totalMiles ?? bike?.mileage ?? bike?.odometer ?? null,
    };

    onSave?.({
      valuations: nextVals,
      acquisition: {
        ...(bike?.acquisition || {}),
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
    onSave?.({
      status: "PX Submitted",
      acquisition: {
        ...(bike?.acquisition || {}),
        submittedAt: now,
      },
    });

    // 2) Create a Deal (if needed)
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
        pxBikeId: bike?.id || null,
        pxRegistration: bike?.registration || null,
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
        // eslint-disable-next-line no-console
        console.error("Failed to create deal from PX:", e);
      }

      updateLinkedDeal({
        createdDealId: dealId,
        createdAt: now,
      });
    }

    if (onOpenDeal) onOpenDeal();
  };

  // ---------- Catalogue-driven dropdown options ----------

  const makeOptions = useMemo(
    () => getMakes().map((m) => ({ value: m, label: m })),
    []
  );

  const modelOptions = useMemo(() => {
    if (!bike?.make) return [];
    return getModels(bike.make).map((m) => ({ value: m, label: m }));
  }, [bike?.make]);

  const trimOptions = useMemo(() => {
    if (!bike?.make || !bike?.model) return [];
    const key = `${bike.make}|${bike.model}`;
    const list = TRIMS_BY_MODEL[key] || [];
    return list.map((t) => ({ value: t, label: t }));
  }, [bike?.make, bike?.model]);

  // ---------- Dynamic feature fields (model-specific spec) ----------

  const featureFields = useMemo(() => {
    try {
      let raw = [];
      if (bike?.make && bike?.model) {
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
  }, [bike?.make, bike?.model, bike?.year]);

  // ---------- Derived flags – QoR checks ----------

  const hasHpiClear =
    bike?.hpiReport &&
    ["Clear", "Warning"].includes(bike.hpiReport.status);
  const hasAtLeastOnePhoto =
    Array.isArray(bike?.photos) && bike.photos.length > 0;
  const financeAnswered =
    bike?.finance && typeof bike.finance.hasFinance === "boolean";

  const canCreateValuation =
    hasHpiClear && hasAtLeastOnePhoto && financeAnswered;

  const canSubmitPx = canCreateValuation && valuations.length > 0;

  // ---------- Data-driven common issues ----------

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

  const staticIssues = useMemo(() => {
    if (!bike?.make || !bike?.model) return [];
    const raw = getCommonIssues(bike.make, bike.model, bike.year) || [];
    return raw.map((issue) => ({
      id: issue.id || `catalog-${slugify(issue.label)}`,
      label: issue.label,
    }));
  }, [bike?.make, bike?.model, bike?.year]);

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

  return {
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
  };
}
