// src/lib/bikesStore.js
const KEY = "harbermotorrad:bikes";
const EVENT = "harber:bikes/updated";

function safeParse(json, fallback = []) {
  try { return JSON.parse(json) ?? fallback; } catch { return fallback; }
}

export function getBikes() {
  return safeParse(localStorage.getItem(KEY), []);
}

export function setBikes(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
  // notify listeners in this tab
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

export function addBike(bike) {
  const all = getBikes();
  const withId = {
    id: bike.id ?? (crypto?.randomUUID?.() ?? `b_${Date.now()}`),
    createdAt: bike.createdAt ?? new Date().toISOString(),
    ...bike,
  };
  setBikes([withId, ...all]);
  return withId;
}

export function updateBike(id, patch) {
  const next = getBikes().map(b => (b.id === id ? { ...b, ...patch } : b));
  setBikes(next);
}

export function deleteBike(id) {
  const next = getBikes().filter(b => b.id !== id);
  setBikes(next);
}

// Subscribe to updates from setBikes (same tab) and storage events (other tabs)
export function subscribe(callback) {
  const onLocal = (e) => callback(e.detail);
  const onStorage = (e) => {
    if (e.key === KEY) callback(getBikes());
  };
  window.addEventListener(EVENT, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}
