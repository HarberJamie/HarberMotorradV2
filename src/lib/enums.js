// src/lib/enums.js

export const EVENT_TYPES = [
  { id: "valuation", label: "Valuation" },
  { id: "listing", label: "Listing" },
  { id: "price_change", label: "Price Change" },
  { id: "offer", label: "Offer" },
  { id: "sale", label: "Sale" },
  { id: "warranty_work", label: "Warranty Work" },
  { id: "service", label: "Service" },
  { id: "repair", label: "Repair" },
];

export const STATUS_TYPES = [
  { id: "valuation", label: "Valuation" },
  { id: "available", label: "Available" },
  { id: "sold", label: "Sold" },
  { id: "customer_bike", label: "Customer Bike" },
];

// Helpers
export function toLabel(list, id) {
  const item = list.find((x) => x.id === id) || null;
  return item ? item.label : "–";
}

export const isValidEvent = (id) => EVENT_TYPES.some((x) => x.id === id);
export const isValidStatus = (id) => STATUS_TYPES.some((x) => x.id === id);

// Optional: sensible defaults you can reuse
export const DEFAULT_STATUS_ID = "valuation";
export const DEFAULT_EVENT_ID = "valuation";
