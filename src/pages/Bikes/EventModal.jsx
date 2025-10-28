export default function EventModal({ event, onClose }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-[520px] max-w-[95vw]">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold capitalize">{event.type} details</div>
          <button className="text-sm text-gray-500" onClick={onClose}>Close</button>
        </div>
        <div className="p-4 text-sm space-y-3">
          <Row k="Date" v={new Date(event.date).toLocaleString()} />
          {event.type === "sale" && (
            <>
              <Row k="Price" v={money(event.sellPrice)} />
              <Row k="Buyer" v={event.buyer || "-"} />
              <Row k="Order ID" v={event.orderId || "-"} />
            </>
          )}
          {event.type === "valuation" && (
            <>
              <Row k="Valuation Price" v={money(event.price)} />
              <Row k="Notes" v={event.notes || "-"} />
            </>
          )}
          {event.type === "preparation" && (
            <>
              <Row k="Total Cost" v={money(event.cost)} />
              <div>
                <div className="text-gray-500 mb-1">Line Items</div>
                <ul className="space-y-1">
                  {(event.items || []).map((i, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{i.label}</span><span className="font-medium">{money(i.cost)}</span>
                    </li>
                  ))}
                  {!event.items?.length && <div className="text-gray-400">No items</div>}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div className="grid grid-cols-2">
      <div className="text-gray-500">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
const money = (n) => (n || n === 0 ? `£${Number(n).toLocaleString()}` : "-");
