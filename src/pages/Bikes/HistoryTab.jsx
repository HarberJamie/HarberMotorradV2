import { useMemo, useState } from "react";
import EventModal from "./EventModal";

const MOCK_EVENTS = {
  b1: [
    { id: "e1", bikeId: "b1", type: "valuation", date: "2025-05-03", price: 19250, notes: "Trade valuation by BMW UK" },
    { id: "e2", bikeId: "b1", type: "preparation", date: "2025-05-10", cost: 320, items: [{label:"PDI", cost:120},{label:"Valet", cost:200}] },
  ],
  b2: [
    { id: "e3", bikeId: "b2", type: "sale", date: "2025-06-20", sellPrice: 14990, buyer: "Mr Smith", orderId: "SO-10034" },
  ],
};

export default function HistoryTab({ bikeId }) {
  const [selected, setSelected] = useState(null);
  const events = useMemo(() => MOCK_EVENTS[bikeId] || [], [bikeId]);

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Type</th>
            <th className="py-2">Date</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Summary</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelected(e)}>
              <td><Chip type={e.type}/></td>
              <td>{fmtDate(e.date)}</td>
              <td>{amount(e)}</td>
              <td className="text-gray-600">{summary(e)}</td>
            </tr>
          ))}
          {!events.length && (
            <tr><td colSpan={4} className="text-center text-gray-400 py-6">No events yet.</td></tr>
          )}
        </tbody>
      </table>

      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function Chip({ type }) {
  const label = type[0].toUpperCase() + type.slice(1);
  return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{label}</span>;
}
const fmtDate = (iso) => new Date(iso).toLocaleDateString();
function amount(e){
  if(e.type === "sale") return `£${(e.sellPrice ?? 0).toLocaleString()}`;
  if(e.type === "valuation") return `£${(e.price ?? 0).toLocaleString()}`;
  if(e.type === "preparation") return `£${(e.cost ?? 0).toLocaleString()}`;
  return "-";
}
function summary(e){
  if(e.type === "sale") return `Sold to ${e.buyer || "customer"} (${e.orderId || "—"})`;
  if(e.type === "valuation") return e.notes || "Valuation recorded";
  if(e.type === "preparation") return `${(e.items?.length || 0)} prep items`;
  return "-";
}
