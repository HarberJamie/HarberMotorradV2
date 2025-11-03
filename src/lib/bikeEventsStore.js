// src/lib/bikeEventsStore.js
const EVENTS_KEY = "harbermotorrad:bike_events";
const EVT = "harber:bike_events/updated";

function safeParse(json, fallback = []) {
  try { return JSON.parse(json) ?? fallback; } catch { return fallback; }
}

export function loadEvents() {
  return safeParse(localStorage.getItem(EVENTS_KEY), []);
}
export function saveEvents(list) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT, { detail: list }));
}

export function listEvents(bikeId) {
  return loadEvents()
    .filter(e => e.bike_id === bikeId)
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

export function addEvent({ bike_id, event_type, payload = {} }) {
  const evt = {
    id: crypto?.randomUUID?.() ?? `e_${Date.now()}`,
    bike_id,
    ts: Date.now(),
    event_type,
    payload
  };
  saveEvents([evt, ...loadEvents()]);
  return evt;
}

export function subscribeEvents(callback) {
  const onLocal = (e) => callback(e.detail);
  const onStorage = (e) => {
    if (e.key === EVENTS_KEY) callback(loadEvents());
  };
  window.addEventListener(EVT, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVT, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}
