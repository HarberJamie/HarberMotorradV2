// src/lib/deriveKpis.js
import { getBikes, setBikes } from "@/lib/bikesStore";
import { listEvents } from "@/lib/bikeEventsStore";

export function recomputeKpisForBike(bikeId) {
  const bikes = getBikes();
  const idx = bikes.findIndex(b => b.id === bikeId);
  if (idx === -1) return;

  const bike = bikes[idx];
  const events = listEvents(bikeId).slice().reverse(); // oldest -> newest

  const firstLiveEvt = events.find(e => e.event_type === "LISTING_PUBLISHED");
  const soldEvt = events.find(e => e.event_type === "SOLD");
  const firstLiveTs = firstLiveEvt?.ts || (bike.live_since ? new Date(bike.live_since).getTime() : null);
  const soldTs = soldEvt?.ts || (bike.sold_at ? new Date(bike.sold_at).getTime() : null);

  const enquiries = events.filter(e => e.event_type === "ENQUIRY_CREATED").length;
  const testRides = events.filter(e => e.event_type === "TEST_RIDE_COMPLETED").length;

  const prepCosts = events
    .filter(e => e.event_type === "PREP_TASK_DONE")
    .reduce((sum, e) => sum + (Number(e.payload?.cost) || 0), 0);

  // latest retail (from price changes) fallback to current field
  const priceChangeEvts = events.filter(e => e.event_type === "PRICE_CHANGED");
  const latestRetail = priceChangeEvts.length
    ? Number(priceChangeEvts[priceChangeEvts.length - 1].payload?.to_price) || Number(bike.price_retail) || 0
    : Number(bike.price_retail) || 0;

  const now = Date.now();
  const timeOnMarketDays = firstLiveTs ? Math.round(((soldTs || now) - firstLiveTs) / 86400000) : null;
  const daysToSell = (firstLiveTs && soldTs) ? Math.round((soldTs - firstLiveTs) / 86400000) : null;

  const discount = (bike.price_sold != null && latestRetail)
    ? Math.max(0, latestRetail - Number(bike.price_sold))
    : 0;

  const grossProfit = (bike.price_sold ?? 0)
    - ((bike.acquisition_price_buy_in ?? 0) + prepCosts + (bike.admin_fee ?? 0));
  const netMargin = grossProfit; // extend later with marketing costs, etc.

  bikes[idx] = {
    ...bike,
    kpis: {
      ...bike.kpis,
      time_on_market_days: timeOnMarketDays,
      days_to_sell: daysToSell,
      enquiries_count: enquiries,
      test_rides_count: testRides,
      discount_given: discount,
      prep_total: prepCosts,
      gross_profit: Number.isFinite(grossProfit) ? grossProfit : null,
      net_margin: Number.isFinite(netMargin) ? netMargin : null
    }
  };

  setBikes(bikes);
}
