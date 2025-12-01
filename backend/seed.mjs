// backend/seed.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

const STATUSES_MAIN = ["Available", "Valuation", "Sold"];
const STATUSES_OTHER = ["Listing", "Prep", "Service", "Offer", "Price Change", "Warranty"];

const MAKES_MODELS = [
  { make: "BMW", model: "R 1250 GS", trims: ["Base", "TE", "Rallye TE"] },
  { make: "BMW", model: "R 1250 GS Adventure", trims: ["TE", "Rallye TE"] },
  { make: "BMW", model: "R 1300 GS", trims: ["Base", "TE", "TE Low", "GS Trophy"] },
  { make: "BMW", model: "S 1000 R", trims: ["Sport", "M Sport"] },
  { make: "BMW", model: "S 1000 XR", trims: ["TE", "Sport", "M Sport"] },
  { make: "BMW", model: "F 900 XR", trims: ["SE", "TE"] },
  { make: "BMW", model: "F 900 R", trims: ["SE", "Sport"] },
  { make: "BMW", model: "R 18", trims: ["First Edition", "Transcontinental"] }
];

const STAFF = ["Jamie Fitzsimmons", "Paul", "Joe Wicks", "Sonia", "Tarin", "System"];

// --- Helpers ------------------------------------------------

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function randomReg() {
  const letters = "ABCDEFGHJKLMNOPRSTUVWXYZ"; // skip I/Q for realism
  const l1 = letters[randInt(0, letters.length - 1)];
  const l2 = letters[randInt(0, letters.length - 1)];
  const digits = randInt(10, 99); // year-like
  const l3 = letters[randInt(0, letters.length - 1)];
  const l4 = letters[randInt(0, letters.length - 1)];
  const l5 = letters[randInt(0, letters.length - 1)];
  return `${l1}${l2}${digits} ${l3}${l4}${l5}`;
}

function randomVin() {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"; // skip I, O, Q
  let v = "";
  for (let i = 0; i < 17; i++) {
    v += chars[randInt(0, chars.length - 1)];
  }
  return v;
}

function randomDateWithin(daysBack = 365) {
  const now = Date.now();
  const offset = randInt(0, daysBack) * 24 * 60 * 60 * 1000;
  return new Date(now - offset).toISOString();
}

function makeEventsForBike(bike, status) {
  const events = [];

  // All bikes get at least one valuation event
  const valuationAmount = randInt(7000, 19000);
  events.push({
    id: nanoid(),
    type: "Valuation",
    amount: valuationAmount,
    notes: "Initial part-ex valuation.",
    meta: {
      source: pick(["Walk-in", "Web enquiry", "Phone enquiry"])
    },
    createdAt: randomDateWithin(365),
    createdBy: pick(STAFF)
  });

  // Listing / Available type history
  if (status === "Available" || status === "Listing") {
    events.push({
      id: nanoid(),
      type: "Listing",
      amount: valuationAmount + randInt(500, 2000),
      notes: "Bike listed on Auto Trader and showroom.",
      meta: {
        channel: pick(["Showroom", "Auto Trader", "Web site"])
      },
      createdAt: randomDateWithin(300),
      createdBy: pick(STAFF)
    });

    if (Math.random() < 0.4) {
      events.push({
        id: nanoid(),
        type: "Price Change",
        amount: valuationAmount + randInt(200, 1200),
        notes: "Price adjusted in line with market.",
        meta: {
          reason: pick(["Market adjustment", "Campaign", "Manager offer"])
        },
        createdAt: randomDateWithin(200),
        createdBy: pick(STAFF)
      });
    }
  }

  // Sold bikes get a Sale + possibly Warranty / Service
  if (status === "Sold") {
    const saleAmount = valuationAmount + randInt(500, 2500);
    events.push({
      id: nanoid(),
      type: "Offer",
      amount: saleAmount,
      notes: "Customer agreed deal subject to PX and finance.",
      meta: {
        finance: Math.random() < 0.7
      },
      createdAt: randomDateWithin(180),
      createdBy: pick(STAFF)
    });

    events.push({
      id: nanoid(),
      type: "Sale",
      amount: saleAmount,
      notes: "Bike sold and handed over.",
      meta: {
        finance: Math.random() < 0.7,
        gardx: Math.random() < 0.4
      },
      createdAt: randomDateWithin(160),
      createdBy: pick(STAFF)
    });

    if (Math.random() < 0.4) {
      events.push({
        id: nanoid(),
        type: "Warranty",
        amount: randInt(150, 900),
        notes: "Warranty claim processed.",
        meta: {
          job: pick(["ESA fault", "Switch gear", "Fuel pump", "Sensor"])
        },
        createdAt: randomDateWithin(120),
        createdBy: pick(STAFF)
      });
    }

    if (Math.random() < 0.4) {
      events.push({
        id: nanoid(),
        type: "Service",
        amount: randInt(150, 400),
        notes: "Post-sale service or check.",
        meta: {
          type: pick(["600 mile service", "Oil & filter", "Annual service"])
        },
        createdAt: randomDateWithin(90),
        createdBy: pick(STAFF)
      });
    }
  }

  // Valuation-only bikes: maybe a follow-up note
  if (status === "Valuation") {
    if (Math.random() < 0.5) {
      events.push({
        id: nanoid(),
        type: "Note",
        amount: null,
        notes: pick([
          "Customer considering options.",
          "Customer went away to think.",
          "Customer declined offer.",
          "Customer will come back after payday."
        ]),
        meta: {},
        createdAt: randomDateWithin(60),
        createdBy: pick(STAFF)
      });
    }
  }

  return events;
}

// --- Main seed logic ----------------------------------------

function main() {
  console.log("Seeding bikes into", DB_FILE);

  const bikes = [];
  const total = 100;

  for (let i = 0; i < total; i++) {
    let status;
    if (i < 50) status = "Available";
    else if (i < 70) status = "Valuation";
    else if (i < 90) status = "Sold";
    else status = pick(STATUSES_OTHER);

    // Bias some bikes to be R 1250 GS / Adventure
    let mm;
    if (i < 20) {
      mm = pick([
        MAKES_MODELS[0], // R 1250 GS
        MAKES_MODELS[1]  // R 1250 GS Adventure
      ]);
    } else {
      mm = pick(MAKES_MODELS);
    }

    const { make, model, trims } = mm;
    const trim = pick(trims);

    const year = randInt(2018, 2025);
    const mileage = randInt(368, 10918);
    const price = randInt(7999, 18999);
    const vatQualifying = Math.random() < 0.1; // ~10% VAT qualifying

    // Features, including Seat Height Reduced for some R1250 GS/Adv
    const features = {};
    if (
      (model === "R 1250 GS" || model === "R 1250 GS Adventure") &&
      Math.random() < 0.4 // 40% of these are low chassis
    ) {
      features["Seat Height Reduced"] = true; // your "low chassis" flag
    }

    if (Math.random() < 0.5) features["Heated Grips"] = true;
    if (Math.random() < 0.4) features["Cruise Control"] = true;
    if (Math.random() < 0.3) features["Quickshifter"] = true;
    if (Math.random() < 0.3) features["LED Headlight"] = true;

    const id = nanoid();

    const bike = {
      id,
      registration: randomReg(),
      vin: randomVin(),
      make,
      model,
      trim,
      modelYear: year,
      status,
      mileage,
      price,
      vatQualifying,
      features,
      serviceHistory: pick([
        "Full BMW service history",
        "Part BMW service history",
        "Independent service history",
        "Limited service history"
      ]),
      motExpiry: Math.random() < 0.6 ? null : randomDateWithin(365),
      createdAt: randomDateWithin(365),
      updatedAt: randomDateWithin(30),
      events: [] // filled below
    };

    bike.events = makeEventsForBike(bike, status);
    bikes.push(bike);
  }

  const db = { bikes };
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  console.log(`✅ Seeded ${bikes.length} bikes into ${DB_FILE}`);
}

main();
