// src/lib/bikesStore.js
import { useEffect, useState } from "react";

const STORAGE_KEY = "harbermotorrad:bikes";
const BUS_EVENT = "harber:bikes-updated";

/* ---------------------------
 * Helpers
 * --------------------------- */
export function getBikes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// saveBikes(bikes, { emit: boolean })
export function saveBikes(bikes, opts = { emit: true }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes));
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
export function addBike(bike) {
  const list = getBikes();
  const newBike = { ...bike, id: bike.id || crypto.randomUUID() };
  const next = [...list, newBike];
  saveBikes(next, { emit: true });
  return newBike;
}

export function updateBike(id, updates) {
  const list = getBikes();
  const next = list.map((b) => (b.id === id ? { ...b, ...updates } : b));
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
    const newBike = { ...bike, id: bike.id || crypto.randomUUID() };
    setBikes((prev) => [...prev, newBike]);
    return newBike;
  };

  const updateViaHook = (id, updates) => {
    setBikes((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
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
