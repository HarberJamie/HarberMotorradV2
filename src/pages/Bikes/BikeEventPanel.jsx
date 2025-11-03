import React, { useMemo, useState } from "react";
import { listEvents, addEvent } from "@/lib/bikeEvents";

const EVENT_TYPES = [
  "ENQUIRY_CREATED",
  "VIEWING_ATTENDED",
  "TEST_RIDE_COMPLETED",
  "OFFER_MADE",
  "RESERVED",
  "SOLD",
  "PRICE_CHANGED",
  "PREP_TASK_DONE",
  "HPI_CHECKED",
  "LISTING_PUBLISHED"
];

export default function BikeEventPanel({ bike }) {
  const [events, setEvents] = useState(() => listEvents(bike.id));
  const [eventType, setEventType] = useState("ENQUIRY_CREATED");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState(""); // used for price/offer/etc

  const subtitle = useMemo(() => {
    const makeModel = [bike.make, bike.model].filter(Boolean).join(" ");
    return `${bike.registration || ""} • ${makeModel}`;
  }, [bike]);

  function submit(e) {
    e.preventDefault();
    const payload = {};
    if (notes) payload.notes = notes;
    if (amount) payload.amount = Number(amount);

    addEvent({
      bike_id: bike.id,
      event_type: eventType,
      payload
    });
    setEvents(listEvents(bike.id));
    setNotes("");
    setAmount("");
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-gray-500">{subtitle}</div>
        <h3 className="text-lg font-semibold">Events & History</h3>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <label className="block">
          <span className="text-xs">Event Type</span>
          <select
            className="mt-1 w-full rounded border p-2"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-xs">Amount (optional)</span>
          <input
            className="mt-1 w-full rounded border p-2"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 17990 / 350 deposit"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs">Notes (optional)</span>
          <input
            className="mt-1 w-full rounded border p-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Short note…"
          />
        </label>

        <div className="md:col-span-4">
          <button className="rounded bg-black text-white px-4 py-2">Add Event</button>
        </div>
      </form>

      <div className="border rounded-lg divide-y">
        {events.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No events yet.</div>
        ) : events.map(ev => (
          <div key={ev.id} className="p-3 flex items-start gap-3">
            <div className="text-xs w-40 shrink-0 text-gray-500">
              {new Date(ev.ts).toLocaleString()}
            </div>
            <div className="grow">
              <div className="font-medium text-sm">{ev.event_type}</div>
              {ev.payload && (
                <div className="text-sm text-gray-700">
                  {ev.payload.amount ? <div>Amount: £{Number(ev.payload.amount).toLocaleString()}</div> : null}
                  {ev.payload.notes ? <div>Notes: {ev.payload.notes}</div> : null}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
