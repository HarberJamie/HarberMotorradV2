// src/schemas/bikeSchemas.js
export const SCHEMA_VERSION = 1;

export const BikeStatus = [
  "inbound","in_prep","live","reserved","sold","returned","wholesaled","scrapped"
];

export const VatScheme = ["standard","margin_scheme"];
export const FinanceType = ["cash","PCP","HP","Lease"];
export const ServiceHistoryType = ["FBMWSH","FSH","Partial","None","Unknown"];
export const Location = ["showroom","overflow","workshop","loan","offsite"];

export const ListingChannels = ["AutoTrader","Website","FB Marketplace","PistonHeads","eBay"];

export const PrepCategories = [
  "tyres","brakes","service","diagnostics","bodywork","electrical","valet","suspension","drivetrain","other"
];

export const BikeEventTypes = [
  "ENQUIRY_CREATED",
  "VIEWING_ATTENDED",
  "TEST_RIDE_COMPLETED",
  "OFFER_MADE",
  "RESERVED",
  "SOLD",
  "PRICE_CHANGED",
  "PREP_TASK_CREATED",
  "PREP_TASK_DONE",
  "LISTING_PUBLISHED",
  "LISTING_REMOVED",
  "HPI_CHECKED",
  "RECALL_CHECKED",
  "IMAGESET_UPDATED",
  "DESCRIPTION_UPDATED"
];

// Shape for a Bike document (JS-doc style for clarity)
export const BikeTemplate = () => ({
  id: crypto.randomUUID(),
  schemaVersion: SCHEMA_VERSION,

  // Results-list essentials
  status: "inbound",
  registration: "",
  make: "",
  model: "",
  trim: "",
  year: null,
  mileage_current: null,
  colour: "",
  price_retail: null,
  price_last_changed_at: null,

  // Catalog anchors + dynamic attributes
  catalog_make_id: null,
  catalog_model_id: null,
  features: [],                 // ["active_height_control","keyless_ride"]
  specs: {},                    // { engine_cc: 1300, suspension: "Dynamic ESA" }

  // Legal / provenance
  vin: "",
  owners_count: null,
  hpi_status: "clear",          // or: finance_flag, category_s, category_n, stolen_flag
  hpi_checked_at: null,
  recalls_outstanding: false,
  recalls_notes: "",
  mot_expiry: null,
  service_history_type: "Unknown",
  service_records: [],          // [{date, mileage, description, dealer}]
  warranty_remaining_months: null,
  warranty_provider: "",

  // Commercials
  acquisition_source: "part_ex",         // part_ex | auction | trade_in | buy_direct | internal
  acquisition_channel: "walk_in",        // walk_in | online | phone | email
  acquisition_price_buy_in: null,
  transport_cost: 0,
  prep_estimate: 0,
  target_margin: 0,
  vat_scheme: "margin_scheme",
  admin_fee: 0,
  price_history: [],                     // [{date, price, reason}]
  live_since: null,
  sold_at: null,
  price_sold: null,
  finance_type: "cash",
  finance_apr: null,
  finance_term_months: null,
  finance_deposit: null,
  finance_gfv: null,
  px_included: false,
  px_reference_id: null,
  px_allowance: null,
  gardx_or_coating: "none",              // none | GardX | other
  add_on_sales: [],                      // [{type, amount}]

  // Marketing/Attribution
  listing_channels: [],
  marketing_utm: {},                      // {source,medium,campaign,term,content}
  photoshoot_date: null,
  description_version: 1,

  // Operational
  location: "showroom",
  workshop_job_number: "",
  linked_trello_card_id: "",
  linked_drive_dms_id: "",
  created_by_user_id: "",
  owner_sales_exec_id: "",
  notes_internal: "",

  // Derived KPIs (filled by compute helpers, not user input)
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

  audit_log: [] // [{ts,user,action,from,to}]
});

// Event record (append-only)
export const BikeEventTemplate = (bike_id) => ({
  id: crypto.randomUUID(),
  bike_id,
  ts: Date.now(),
  event_type: "ENQUIRY_CREATED",
  payload: {} // shape depends on type
});

// Part-ex entity (linked via px_reference_id)
export const PartExchangeTemplate = () => ({
  id: crypto.randomUUID(),
  customer_id: "",
  incoming_make: "",
  incoming_model: "",
  incoming_trim: "",
  incoming_year: null,
  incoming_mileage: null,
  valuation_offer: null,
  valuation_reasoning: "",
  known_issues: [],
  expected_prep_cost: 0,
  final_settlement_to_finance: 0,
  accepted_at: null,
  declined_at: null,
  sold_to_trade: false,
  sold_price: null,
  px_time_to_disposal_days: null
});
