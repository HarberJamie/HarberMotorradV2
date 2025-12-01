// backend/server.mjs
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

// --- Helpers -------------------------------------------------

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const empty = { bikes: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  const raw = fs.readFileSync(DB_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return { bikes: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

// --- Server --------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

// Simple logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Get all bikes
app.get("/api/bikes", (_req, res) => {
  const db = loadDB();
  res.json(db.bikes);
});

// Get a single bike
app.get("/api/bikes/:id", (req, res) => {
  const db = loadDB();
  const bike = db.bikes.find((b) => b.id === req.params.id);
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  res.json(bike);
});

// Create a bike
app.post("/api/bikes", (req, res) => {
  const db = loadDB();
  const bike = req.body;

  if (!bike.id) {
    // Frontend should ideally send an id, but just in case
    bike.id = `bike_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  bike.createdAt = bike.createdAt || new Date().toISOString();
  bike.updatedAt = new Date().toISOString();
  bike.events = bike.events || [];

  db.bikes.push(bike);
  saveDB(db);
  res.status(201).json(bike);
});

// Update a bike (partial)
app.patch("/api/bikes/:id", (req, res) => {
  const db = loadDB();
  const idx = db.bikes.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Bike not found" });

  const patch = req.body || {};
  const current = db.bikes[idx];

  const updated = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  db.bikes[idx] = updated;
  saveDB(db);
  res.json(updated);
});

// Optional: append an event to a bike's history
app.post("/api/bikes/:id/events", (req, res) => {
  const db = loadDB();
  const idx = db.bikes.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Bike not found" });

  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type: req.body.type || "Note",
    amount: req.body.amount ?? null,
    notes: req.body.notes || "",
    meta: req.body.meta || {},
    createdAt: req.body.createdAt || new Date().toISOString(),
    createdBy: req.body.createdBy || "System",
  };

  const bike = db.bikes[idx];
  bike.events = bike.events || [];
  bike.events.push(event);
  bike.updatedAt = new Date().toISOString();

  db.bikes[idx] = bike;
  saveDB(db);
  res.status(201).json(event);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Fake backend running on http://localhost:${PORT}`);
});
