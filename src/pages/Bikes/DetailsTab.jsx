export default function DetailsTab({ bike }) {
  // Mock out the rest of fields for now
  const full = {
    status: "stock",
    source: "bmw-uk",
    variant: "TE",
    cc: 1300,
    owners: 0,
    colour: "MSG",
    dateOfRegistration: "2024-09-12",
    motExpiry: "2027-09-12",
    fuelType: "Petrol",
    lastValuationDate: "2025-05-03",
    lastValuationPrice: 19250,
    lastSaleDate: "",
    lastPrice: "",
    preparationCosts: 0,
    pnl: "",
    serviceHistory: bike.serviceHistory,
    ...bike,
  };

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <Section title="Identity" rows={[
        ["Registration", full.registration],
        ["VIN", full.vin],
        ["Make / Model", `${full.make} ${full.model}`],
        ["Variant", full.variant || "-"],
      ]}/>
      <Section title="Spec" rows={[
        ["Mileage", full.mileage?.toLocaleString() ?? "-"],
        ["CC", full.cc ?? "-"],
        ["No. of Owners", full.owners ?? "-"],
        ["Colour", full.colour ?? "-"],
        ["Fuel Type", full.fuelType ?? "-"],
      ]}/>
      <Section title="Status" rows={[
        ["Status", "Stock"],
        ["Source", "BMW UK"],
        ["Service History", full.serviceHistory || "-"],
      ]}/>
      <Section title="Dates" rows={[
        ["Date of Registration", full.dateOfRegistration || "-"],
        ["MOT Expiry Date", full.motExpiry || "-"],
      ]}/>
      <Section title="Commercials" rows={[
        ["Last Valuation Date", full.lastValuationDate || "-"],
        ["Last Valuation Price", money(full.lastValuationPrice)],
        ["Last Sale Date", full.lastSaleDate || "-"],
        ["Last Price", money(full.lastPrice)],
        ["Preparation costs", money(full.preparationCosts)],
        ["P&L", money(full.pnl)],
      ]}/>
    </div>
  );
}

function Section({ title, rows }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-xs font-semibold mb-2">{title}</div>
      <dl className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-2">
            <dt className="text-gray-500">{k}</dt>
            <dd className="font-medium">{v ?? "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
const money = (n) => (n || n === 0 ? `£${Number(n).toLocaleString()}` : "-");
