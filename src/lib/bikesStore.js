// src/lib/bikesStore.js
import { useEffect, useState } from "react";

const STORAGE_KEY = "harbermotorrad:bikes";
const BUS_EVENT = "harber:bikes-updated";

/* ---------------------------
 * Schema normalisation
 * --------------------------- */

/**
 * Normalise a raw bike object so it always has the fields we expect.
 * This is the backbone for Part Exchange, acquisition and profit chain.
 */
function normalizeBike(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id || (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()));

  // Status & sale type
  const status = raw.status || "Available"; // fallback if unset
  const soldType =
    raw.soldType && ["Private", "Company", "TradedOut"].includes(raw.soldType)
      ? raw.soldType
      : null;

  // Acquisition (where we got the bike + buy-in)
  const acquisition = {
    source: raw.acquisition?.source || raw.source || null, // legacy "source" support
    buyInPrice:
      raw.acquisition && "buyInPrice" in raw.acquisition
        ? raw.acquisition.buyInPrice
        : null,
    acquiredAt:
      raw.acquisition?.acquiredAt ||
      raw.acquiredAt ||
      null,
    linkedDealId: raw.acquisition?.linkedDealId || null,
    linkedPxValuationId: raw.acquisition?.linkedPxValuationId || null,
  };

  // Valuations (PX v1, v2, v3…)
  const valuations = Array.isArray(raw.valuations) ? raw.valuations : [];

  // Finance (PX outstanding finance info)
  const finance = {
    hasFinance:
      raw.finance && typeof raw.finance.hasFinance === "boolean"
        ? raw.finance.hasFinance
        : false,
    settlementAmount:
      raw.finance && "settlementAmount" in raw.finance
        ? raw.finance.settlementAmount
        : null,
    provider: raw.finance?.provider || "",
    confirmed:
      raw.finance && typeof raw.finance.confirmed === "boolean"
        ? raw.finance.confirmed
        : false,
  };

  // Photos (PX appraisal photos, stock photos, damage pics etc.)
  const photos = Array.isArray(raw.photos) ? raw.photos : [];

  // HPI / provenance report
  const hpiReport = raw.hpiReport || {
    status: "not_checked", // "not_checked" | "done" | "issue_found"
    checkedAt: null,
    checkedBy: null,
    notes: "",
  };

  // Prep (we may later derive totalPrepCost from events, but keep a slot)
  const prep = raw.prep || {
    totalPrepCost: null,
  };

  return {
    ...raw,
    id,
    status,
    soldType,
    acquisition,
    valuations,
    finance,
    photos,
    hpiReport,
    prep,
  };
}

/* ---------------------------
 * Storage helpers
 * --------------------------- */
export function getBikes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const normalized = parsed
      .map((b) => normalizeBike(b))
      .filter(Boolean);

    return normalized;
  } catch {
    return [];
  }
}

// saveBikes(bikes, { emit: boolean })
export function saveBikes(bikes, opts = { emit: true }) {
  const safe = Array.isArray(bikes)
    ? bikes.map((b) => normalizeBike(b)).filter(Boolean)
    : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  if (opts.emit) {
    // Notify same-tab listeners only when we intend to
    window.dispatchEvent(new Event(BUS_EVENT));
  }
}

function isSameArray(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/* ----------------------------------------------------
 * Plain functions API (usable anywhere, emit updates)
 * ---------------------------------------------------- */

/**
 * Add a bike (used from non-React code).
 * Automatically normalises schema (acquisition, valuations, etc.).
 */
export function addBike(bike) {
  const list = getBikes();
  const newBike = normalizeBike(bike);
  const next = [...list, newBike];
  saveBikes(next, { emit: true });
  return newBike;
}

/**
 * Update a bike by id with partial updates.
 * Nested objects (acquisition, finance, hpiReport) are merged shallowly.
 */
export function updateBike(id, updates) {
  const list = getBikes();
  const next = list.map((b) => {
    if (b.id !== id) return b;

    const merged = {
      ...b,
      ...updates,
      acquisition: {
        ...b.acquisition,
        ...(updates.acquisition || {}),
      },
      finance: {
        ...b.finance,
        ...(updates.finance || {}),
      },
      hpiReport: {
        ...b.hpiReport,
        ...(updates.hpiReport || {}),
      },
      prep: {
        ...b.prep,
        ...(updates.prep || {}),
      },
    };

    if (updates.valuations) {
      merged.valuations = updates.valuations;
    }
    if (updates.photos) {
      merged.photos = updates.photos;
    }

    return normalizeBike(merged);
  });

  saveBikes(next, { emit: true });
  return next.find((b) => b.id === id) || null;
}

export function removeBike(id) {
  const list = getBikes();
  const next = list.filter((b) => b.id !== id);
  saveBikes(next, { emit: true });
  return true;
}

export function clearBikes() {
  saveBikes([], { emit: true });
  return true;
}

/* ---------------------------
 * React Hook API
 * --------------------------- */
export function useBikes() {
  const [bikes, setBikes] = useState(getBikes);

  // Listen for cross-tab storage changes and same-tab bus events
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      const next = getBikes();
      setBikes((prev) => (isSameArray(prev, next) ? prev : next));
    };
    const handleBus = () => {
      const next = getBikes();
      setBikes((prev) => (isSameArray(prev, next) ? prev : next));
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(BUS_EVENT, handleBus);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(BUS_EVENT, handleBus);
    };
  }, []);

  // Persist whenever local state changes via the hook’s mutators
  // IMPORTANT: do NOT emit here (we already have the state locally)
  useEffect(() => {
    saveBikes(bikes, { emit: false });
  }, [bikes]);

  // Hook-bound mutators update state (ideal inside React components)
  const addViaHook = (bike) => {
    const newBike = normalizeBike(bike);
    setBikes((prev) => [...prev, newBike]);
    return newBike;
  };

  const updateViaHook = (id, updates) => {
    setBikes((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;

        const merged = {
          ...b,
          ...updates,
          acquisition: {
            ...b.acquisition,
            ...(updates.acquisition || {}),
          },
          finance: {
            ...b.finance,
            ...(updates.finance || {}),
          },
          hpiReport: {
            ...b.hpiReport,
            ...(updates.hpiReport || {}),
          },
          prep: {
            ...b.prep,
            ...(updates.prep || {}),
          },
        };

        if (updates.valuations) {
          merged.valuations = updates.valuations;
        }
        if (updates.photos) {
          merged.photos = updates.photos;
        }

        return normalizeBike(merged);
      })
    );
  };

  const removeViaHook = (id) => {
    setBikes((prev) => prev.filter((b) => b.id !== id));
  };

  const clearViaHook = () => setBikes([]);

  return {
    bikes,
    addBike: addViaHook,
    updateBike: updateViaHook,
    removeBike: removeViaHook,
    clearBikes: clearViaHook,
  };
}
