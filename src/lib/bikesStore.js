// src/lib/bikesStore.js
const KEY = "harbermotorrad:bikes";
const EVENT = "harber:bikes/updated";

function safeParse(json, fallback = []) {
  try { return JSON.parse(json) ?? fallback; } catch { return fallback; }
}

/** Lightweight template so new fields exist without overwriting user data */
export const SCHEMA_VERSION = 1;
export function bikeTemplate() {
  return {
    id: null,
    createdAt: null,

    // Results-list essentials
    status: "inbound",                 // inbound|in_prep|live|reserved|sold|returned|wholesaled|scrapped
    registration: "",
    make: "",
    model: "",
    trim: "",
    year: null,
    mileage_current: null,
    colour: "",
    price_retail: null,
    price_last_changed_at: null,

    // Dynamic attributes
    catalog_make_id: null,
    catalog_model_id: null,
    features: [],                      // ["active_height_control", ...]
    specs: {},                         // { engine_cc: 1300, ... }

    // Provenance
    vin: "",
    owners_count: null,
    hpi_status: "clear",
    hpi_checked_at: null,
    recalls_outstanding: false,
    recalls_notes: "",
    mot_expiry: null,
    service_history_type: "Unknown",
    service_records: [],               // [{date, mileage, description, dealer}]
    warranty_remaining_months: null,
    warranty_provider: "",

    // Commercials
    acquisition_source: "part_ex",     // part_ex|auction|trade_in|buy_direct|internal
    acquisition_channel: "walk_in",    // walk_in|online|phone|email
    acquisition_price_buy_in: null,
    transport_cost: 0,
    prep_estimate: 0,
    target_margin: 0,
    vat_scheme: "margin_scheme",       // standard|margin_scheme
    admin_fee: 0,
    price_history: [],                 // [{date, price, reason}]
    live_since: null,
    sold_at: null,
    price_sold: null,
    finance_type: "cash",              // cash|PCP|HP|Lease
    finance_apr: null,
    finance_term_months: null,
    finance_deposit: null,
    finance_gfv: null,
    px_included: false,
    px_reference_id: null,
    px_allowance: null,
    gardx_or_coating: "none",          // none|GardX|other
    add_on_sales: [],                  // [{type, amount}]

    // Marketing
    listing_channels: [],              // ["AutoTrader","Website",...]
    marketing_utm: {},                 // {source,medium,campaign,term,content}
    photoshoot_date: null,
    description_version: 1,

    // Ops
    location: "showroom",
    workshop_job_number: "",
    linked_trello_card_id: "",
    linked_drive_dms_id: "",
    created_by_user_id: "",
    owner_sales_exec_id: "",
    notes_internal: "",

    // KPIs (derived)
    kpis: {
      time_on_market_days: null,
      days_to_sell: null,
      lead_count: 0,
      enquiries_count: 0,
      test_rides_count: 0,
      views_count: 0,
      discount_given: 0,
      prep_total: 0,
      gross_profit: null,
      net_margin: null
    },

    schemaVersion: SCHEMA_VERSION,
    audit_log: []                      // [{ts,user,action,from,to}]
  };
}

/** Merge missing fields from template without clobbering existing data */
function applyTemplate(bike) {
  const t = bikeTemplate();
  // normalise legacy field name -> mileage_current
  const legacyMileage = (bike.mileage_current == null && Number.isFinite(Number(bike.mileage)))
    ? { mileage_current: Number(bike.mileage) }
    : {};
  const merged = {
    ...t,
    ...bike,
    ...legacyMileage,
    kpis: { ...t.kpis, ...(bike.kpis || {}) }
  };
  if (!merged.schemaVersion) merged.schemaVersion = SCHEMA_VERSION;
  return merged;
}

export function getBikes() {
  return safeParse(localStorage.getItem(KEY), []).map(applyTemplate);
}

export function setBikes(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

export function addBike(bike) {
  const all = getBikes();
  const withId = applyTemplate({
    id: bike.id ?? (crypto?.randomUUID?.() ?? `b_${Date.now()}`),
    createdAt: bike.createdAt ?? new Date().toISOString(),
    ...bike
  });
  setBikes([withId, ...all]);
  return withId;
}

export function updateBike(id, patch) {
  const next = getBikes().map(b => (b.id === id ? applyTemplate({ ...b, ...patch }) : b));
  setBikes(next);
}

export function upsertBike(predicate, updater) {
  const all = getBikes();
  const idx = all.findIndex(predicate);
  if (idx === -1) {
    const created = applyTemplate(updater(null));
    setBikes([created, ...all]);
    return created;
  }
  const updated = applyTemplate(updater(all[idx]));
  const next = [...all];
  next[idx] = updated;
  setBikes(next);
  return updated;
}

export function deleteBike(id) {
  const next = getBikes().filter(b => b.id !== id);
  setBikes(next);
}

export function getBikeById(id) {
  return getBikes().find(b => b.id === id) || null;
}

/** One-shot migration runner: provide a mapper(oldBike)->newBike */
export function migrateBikes(mapper) {
  const migrated = getBikes().map((b) => applyTemplate(mapper(b)));
  setBikes(migrated);
}

/** Subscribe to updates from setBikes (same tab) and storage events (other tabs) */
export function subscribe(callback) {
  const onLocal = (e) => callback(e.detail.map(applyTemplate));
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
