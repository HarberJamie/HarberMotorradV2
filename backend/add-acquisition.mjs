// backend/add-acquisition.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "db.json");

// 1. Load db.json
const raw = fs.readFileSync(DB_FILE, "utf8");
const db = JSON.parse(raw);

// Ensure shape { bikes: [...] }
if (!db.bikes || !Array.isArray(db.bikes)) {
  throw new Error("db.json does not contain a 'bikes' array at root");
}

// 2. Update every bike
db.bikes = db.bikes.map((bike) => {
  const next = { ...bike };

  // Only add acquisition if missing
  if (!next.acquisition) {
    const price = Number(next.price) || 0;

    // Example default calculation
    const defaultBuyIn =
      price > 0 ? Math.round(price * 0.8) : null;

    next.acquisition = {
      buyInPrice: defaultBuyIn,
      source: "retail_part_exchange",
    };
  }

  return next;
});

// 3. Save db.json
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");

console.log(
  `Updated ${db.bikes.length} bikes with acquisition.buyInPrice + source`
);
