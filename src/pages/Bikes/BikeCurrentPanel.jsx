import React from "react";

export default function BikeCurrentPanel({ bike }) {
  // Expecting bike to include features[], specs{}, pricing fields, etc.
  const rows = [
    ["Status", bike.status],
    ["Registration", bike.registration],
    ["Make / Model / Trim", [bike.make, bike.model, bike.trim].filter(Boolean).join(" ")],
    ["Year", bike.year],
    ["Mileage", bike.mileage_current?.toLocaleString()],
    ["Colour", bike.colour],
    ["VIN", bike.vin],
    ["Retail Price", bike.price_retail != null ? `£${Number(bike.price_retail).toLocaleString()}` : ""],
    ["Live Since", bike.live_since ? new Date(bike.live_since).toLocaleDateString() : ""],
    ["Sold At", bike.sold_at ? new Date(bike.sold_at).toLocaleDateString() : ""],
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-gray-500">{bike.registration || ""}</div>
        <h3 className="text-lg font-semibold">Current Bike Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="border rounded p-3">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-sm">{value || "-"}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      {Array.isArray(bike.features) && bike.features.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-2">Features</div>
          <div className="flex flex-wrap gap-2">
            {bike.features.map(f => (
              <span key={f} className="text-xs bg-gray-100 border rounded px-2 py-1">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Specs */}
      {bike.specs && Object.keys(bike.specs).length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-2">Specifications</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(bike.specs).map(([k, v]) => (
              <div key={k} className="border rounded p-3">
                <div className="text-xs text-gray-500">{k}</div>
                <div className="text-sm">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
