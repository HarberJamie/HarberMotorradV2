// src/pages/Bikes/ResultsList.jsx
import React, { useMemo } from "react";
import { useBikes } from "@/lib/bikesStore.js";
import { normalizeKey } from "@/lib/normalizeKey.js";
import {
  STATUS_TYPES,
  EVENT_TYPES,
  toLabel as labelFrom,
} from "@/lib/enums.js";

const COLS = [
  { label: "Registration" },
  { label: "Make" },
  { label: "Model" },
  { label: "Trim" },
  { label: "VIN (last 7)" },
  { label: "Status" },
  { label: "Latest Event" },
  {
    label: "Total Miles",
    fmt: (v) =>
      isFinite(Number(v)) ? Number(v).toLocaleString() : "–",
  },
  {
    label: "Price",
    fmt: (v) =>
      v === null ||
      v === undefined ||
      v === "" ||
      isNaN(Number(v))
        ? "–"
        : `£${Number(v).toLocaleString()}`,
  },
  { label: "VAT Qualifying" },
];

/**
 * Safely normalise a status value to a comparable string.
 * Handles things like "Available" vs "AVAILABLE".
 */
function normalizeStatus(value) {
  if (!value) return "";
  return value.toString().trim().toLowerCase();
}

/**
 * Get a human-friendly label for a status, if STATUS_TYPES is present.
 */
function statusLabel(status) {
  if (!status) return "";
  if (STATUS_TYPES && typeof STATUS_TYPES === "object") {
    // STATUS_TYPES may be an enum-like object – try to map it
    const norm = normalizeStatus(status);
    const matchKey = Object.keys(STATUS_TYPES).find(
      (k) => normalizeStatus(STATUS_TYPES[k]) === norm
    );
    if (matchKey) {
      return labelFrom
        ? labelFrom("STATUS_TYPES", STATUS_TYPES[matchKey])
        : STATUS_TYPES[matchKey];
    }
  }
  // Fallback: prettify the raw string
  const norm = status.toString().trim();
  return norm.charAt(0).toUpperCase() + norm.slice(1);
}

/**
 * Get a human-friendly label for an event type, if EVENT_TYPES is present.
 */
function eventLabel(type) {
  if (!type) return "";
  if (EVENT_TYPES && typeof EVENT_TYPES === "object") {
    const norm = normalizeStatus(type);
    const matchKey = Object.keys(EVENT_TYPES).find(
      (k) => normalizeStatus(EVENT_TYPES[k]) === norm
    );
    if (matchKey) {
      return labelFrom
        ? labelFrom("EVENT_TYPES", EVENT_TYPES[matchKey])
        : EVENT_TYPES[matchKey];
    }
  }
  const norm = type.toString().trim();
  return norm.charAt(0).toUpperCase() + norm.slice(1);
}

/**
 * Filter bikes based on filters from BikesPage.
 * Filters structure:
 * {
 *   registration, vin, keyword, make, model,
 *   mileageMin, mileageMax, status,
 *   modelYear, priceMin, priceMax, vatQualifying
 * }
 */
function applyFilters(bikes, filters = {}) {
  if (!Array.isArray(bikes) || bikes.length === 0) return [];

  const {
    registration,
    vin,
    keyword,
    make,
    model,
    mileageMin,
    mileageMax,
    status,
    modelYear,
    priceMin,
    priceMax,
    vatQualifying,
  } = filters;

  const regFilter = registration
    ? registration.trim().toUpperCase()
    : null;
  const vinFilter = vin ? vin.trim().toUpperCase() : null;
  const keywordFilter = keyword
    ? keyword.trim().toLowerCase()
    : null;
  const makeFilter = make ? make.trim().toLowerCase() : null;
  const modelFilter = model ? model.trim().toLowerCase() : null;
  const statusFilter = status
    ? status.toString().trim().toLowerCase()
    : null;
  const modelYearFilter = modelYear ? Number(modelYear) : null;
  const mileageMinNum = mileageMin ? Number(mileageMin) : null;
  const mileageMaxNum = mileageMax ? Number(mileageMax) : null;
  const priceMinNum = priceMin ? Number(priceMin) : null;
  const priceMaxNum = priceMax ? Number(priceMax) : null;
  const vatFilter =
    typeof vatQualifying === "string" &&
    vatQualifying.trim() !== ""
      ? vatQualifying
      : null;

  return bikes.filter((b) => {
    if (!b) return false;

    // Registration exact/partial match (case-insensitive)
    if (regFilter) {
      const reg = (b.registration || "")
        .toString()
        .toUpperCase();
      if (!reg.includes(regFilter)) return false;
    }

    // VIN partial match (case-insensitive)
    if (vinFilter) {
      const vinValue = (b.vin || "").toString().toUpperCase();
      if (!vinValue.includes(vinFilter)) return false;
    }

    // Keyword search across a few fields
    if (keywordFilter) {
      const haystack = [
        b.registration,
        b.make,
        b.model,
        b.trim,
        b.notes,
      ]
        .map((x) =>
          (x || "").toString().toLowerCase()
        )
        .join(" ");

      if (!haystack.includes(keywordFilter)) return false;
    }

    // Make
    if (makeFilter) {
      const makeValue = (b.make || "")
        .toString()
        .toLowerCase();
      if (makeValue !== makeFilter) return false;
    }

    // Model
    if (modelFilter) {
      const modelValue = (b.model || "")
        .toString()
        .toLowerCase();
      if (modelValue !== modelFilter) return false;
    }

    // Status – ONLY if a status filter is set.
    // (If no status filter, we show all statuses so your seed data is visible.)
    if (statusFilter) {
      const bikeStatus = normalizeStatus(b.status);
      if (bikeStatus !== statusFilter) return false;
    }

    // Model year
    if (modelYearFilter && Number(b.modelYear) !== modelYearFilter) {
      return false;
    }

    // Mileage range
    const mileage = Number(b.mileage);
    if (!Number.isNaN(mileage)) {
      if (
        mileageMinNum !== null &&
        mileage < mileageMinNum
      ) {
        return false;
      }
      if (
        mileageMaxNum !== null &&
        mileage > mileageMaxNum
      ) {
        return false;
      }
    }

    // Price range
    const price = Number(b.price);
    if (!Number.isNaN(price)) {
      if (priceMinNum !== null && price < priceMinNum) {
        return false;
      }
      if (priceMaxNum !== null && price > priceMaxNum) {
        return false;
      }
    }

    // VAT qualifying filter ("yes" / "no")
    if (vatFilter) {
      const isVatQualifying = !!b.vatQualifying;
      if (
        vatFilter === "yes" &&
        !isVatQualifying
      ) {
        return false;
      }
      if (
        vatFilter === "no" &&
        isVatQualifying
      ) {
        return false;
      }
    }

    return true;
  });
}

export default function ResultsList({
  selectedId,
  onSelect,
  filters,
}) {
  const { bikes } = useBikes();

  const filtered = useMemo(
    () => applyFilters(bikes, filters),
    [bikes, filters]
  );

  // Simple default sort: newest first by createdAt, then registration
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      if (bTime !== aTime) return bTime - aTime;

      const aReg = (a.registration || "").toString();
      const bReg = (b.registration || "").toString();
      return aReg.localeCompare(bReg);
    });
  }, [filtered]);

  const handleRowClick = (id) => {
    if (typeof onSelect === "function") {
      onSelect(id);
    }
  };

  if (!Array.isArray(sorted) || sorted.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-6 text-sm text-slate-200 shadow-lg shadow-black/40">
        No bikes match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-lg shadow-black/40">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
            {COLS.map((col) => (
              <th
                key={col.label}
                className="px-3 py-2 text-left font-semibold"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((bike) => {
            const isSelected = bike.id === selectedId;
            const latestEvent = Array.isArray(bike.events)
              ? bike.events
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt || 0) -
                      new Date(a.createdAt || 0)
                  )[0]
              : null;

            const vinLast7 = bike.vin
              ? bike.vin.toString().slice(-7)
              : "";

            return (
              <tr
                key={bike.id}
                className={`cursor-pointer border-t border-white/5 ${
                  isSelected
                    ? "bg-sky-900/60"
                    : "hover:bg-white/5"
                }`}
                onClick={() => handleRowClick(bike.id)}
              >
                <td className="px-3 py-2 font-semibold text-slate-50">
                  {bike.registration || "—"}
                </td>
                <td className="px-3 py-2 text-slate-100">
                  {bike.make || "—"}
                </td>
                <td className="px-3 py-2 text-slate-100">
                  {bike.model || "—"}
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {bike.trim || "—"}
                </td>
                <td className="px-3 py-2 font-mono text-slate-200">
                  {vinLast7 || "—"}
                </td>
                <td className="px-3 py-2 text-slate-100">
                  {statusLabel(bike.status)}
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {latestEvent
                    ? eventLabel(latestEvent.type)
                    : "—"}
                </td>
                <td className="px-3 py-2 text-slate-100">
                  {COLS[7].fmt
                    ? COLS[7].fmt(bike.mileage)
                    : bike.mileage || "—"}
                </td>
                <td className="px-3 py-2 text-slate-100">
                  {COLS[8].fmt
                    ? COLS[8].fmt(bike.price)
                    : bike.price || "—"}
                </td>
                <td className="px-3 py-2 text-slate-100">
                  {bike.vatQualifying ? "Yes" : "No"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
