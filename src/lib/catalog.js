// src/lib/catalog.js
// Central catalog for makes, models, years, features & common issues.

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function nk(s) {
  // normalizeKey: lower-case, alnum-and-dash only, collapse spaces/punctuation
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function keyFor(make, model) {
  return `${make}|${model}`;
}

/* -------------------------------------------------------------------------- */
/* Makes                                                                      */
/* -------------------------------------------------------------------------- */

const MAKES = [
  "Aprilia",
  "Benelli",
  "Beta",
  "Bimota",
  "BMW",
  "Brixton",
  "CFMoto",
  "Ducati",
  "Fantic",
  "GASGAS",
  "Harley-Davidson",
  "Hero",
  "Honda",
  "Husqvarna",
  "Hyosung",
  "Indian",
  "Keeway",
  "Kawasaki",
  "KTM",
  "Kymco",
  "Lexmoto",
  "Mash",
  "Moto Guzzi",
  "Moto Morini",
  "MV Agusta",
  "Norton",
  "Peugeot",
  "Piaggio",
  "Rieju",
  "Royal Enfield",
  "Sinnis",
  "Suzuki",
  "SYM",
  "Triumph",
  "UM",
  "Vespa",
  "Yamaha",
  "Zero",
].sort((a, b) => a.localeCompare(b));

/* -------------------------------------------------------------------------- */
/* Models by Make                                                             */
/* -------------------------------------------------------------------------- */

const MODELS_BY_MAKE = {
  Aprilia: ["RS 660", "RSV4", "Tuareg 660", "Tuono 660", "Tuono V4"],
  BMW: [
    "C 400 X",
    "CE 04",
    "F 750 GS",
    "F 850 GS",
    "F 900 R",
    "F 900 XR",
    "G 310 R",
    "R 1250 GS",
    "R 1250 GS Adventure",
    "R 1250 R",
    "R 1250 RS",
    "R 1300 GS",
    "R 18",
    "R nineT",
    "S 1000 R",
    "S 1000 RR",
    "S 1000 XR",
  ],
  CFMoto: ["450NK", "650MT", "700CL-X", "800MT"],
  Ducati: [
    "DesertX",
    "Monster",
    "Multistrada V4",
    "Panigale V2",
    "Panigale V4",
    "Scrambler Icon",
    "SuperSport 950",
  ],
  "Harley-Davidson": [
    "Fat Bob 114",
    "Low Rider S",
    "Nightster",
    "Pan America 1250",
    "Road Glide",
    "Sportster S",
    "Street Bob 114",
  ],
  Honda: [
    "CB500F",
    "CB650R",
    "CBR500R",
    "CBR650R",
    "CBR1000RR-R Fireblade",
    "CMX1100 Rebel",
    "CMX500 Rebel",
    "CRF300L",
    "CRF300 Rally",
    "CRF1100L Africa Twin",
    "CRF1100L Africa Twin Adventure Sports",
    "Hornet CB750",
    "NC750X",
    "NT1100",
    "XL750 Transalp",
  ],
  Husqvarna: ["Norden 901", "Svartpilen 401", "Vitpilen 401"],
  Indian: ["Chief", "FTR 1200", "Scout"],
  Kawasaki: ["Ninja 650", "Ninja ZX-10R", "Versys 650", "Versys 1000", "Z650", "Z900", "Z H2"],
  KTM: [
    "1290 Super Adventure",
    "1290 Super Duke R",
    "390 Duke",
    "690 SMC R",
    "790 Adventure",
    "790 Duke",
    "890 Adventure",
    "890 Duke",
  ],
  "Moto Guzzi": ["V7", "V85 TT"],
  "MV Agusta": ["Brutale 800", "Dragster 800"],
  Piaggio: ["Beverly 300", "Medley 125"],
  "Royal Enfield": [
    "Continental GT 650",
    "Himalayan 450",
    "Hunter 350",
    "Interceptor 650",
    "Meteor 350",
    "Super Meteor 650",
  ],
  Suzuki: [
    "GSX-8R",
    "GSX-8S",
    "GSX-S1000",
    "GSX-S1000GT",
    "Hayabusa",
    "V-Strom 650",
    "V-Strom 800DE",
  ],
  Triumph: [
    "Bonneville T120",
    "Scrambler 1200",
    "Speed Triple 1200 RS",
    "Speed Twin 1200",
    "Street Triple 765",
    "Tiger 1200",
    "Tiger 900",
    "Trident 660",
  ],
  Vespa: ["GTS 125", "GTS 300"],
  Yamaha: [
    "MT-07",
    "MT-09",
    "MT-10",
    "NMAX 125",
    "R7",
    "Tracer 7",
    "Tracer 9 GT",
    "Ténéré 700",
    "XSR700",
    "XSR900",
  ],
  Zero: ["S", "SR/F"],
};

/* -------------------------------------------------------------------------- */
/* Year Ranges (optional)                                                     */
/* -------------------------------------------------------------------------- */

const YEAR_RANGES = {
  "BMW|R 1300 GS": [2024, 2026],
  "BMW|R 1250 GS": [2019, 2024],
  "BMW|S 1000 XR": [2015, 2025],
  "Honda|CRF300L": [2021, 2025],
  "Honda|CRF1100L Africa Twin": [2020, 2025],
  "Honda|XL750 Transalp": [2023, 2025],
  "Yamaha|Ténéré 700": [2019, 2025],
  "Triumph|Trident 660": [2021, 2025],
  "Ducati|Multistrada V4": [2021, 2025],
  "KTM|890 Adventure": [2020, 2025],
  "Royal Enfield|Himalayan 450": [2023, 2025],
};

/* -------------------------------------------------------------------------- */
/* Spec & (Legacy) Feature Field Maps                                         */
/* -------------------------------------------------------------------------- */

const FIELD_MAPS = {
  specs: {
    "BMW|R 1300 GS": [
      {
        id: "package",
        label: "Package",
        type: "enum",
        options: ["Base", "TE", "TE with SOS"],
      },
      {
        id: "ride_modes",
        label: "Ride Modes",
        type: "enum",
        options: ["Rain/Road", "Pro"],
      },
      {
        id: "suspension",
        label: "Suspension",
        type: "enum",
        options: ["Standard", "Dynamic ESA"],
      },
      {
        id: "wheel_type",
        label: "Wheel Type",
        type: "enum",
        options: ["Cast", "Wire/Spoked"],
      },
    ],
    "Honda|CRF1100L Africa Twin": [
      {
        id: "variant",
        label: "Variant",
        type: "enum",
        options: ["Std", "Adventure Sports"],
      },
      {
        id: "gearbox",
        label: "Gearbox",
        type: "enum",
        options: ["Manual", "DCT"],
      },
    ],
  },
  features: {
    // Legacy (flat) features — these will be merged into the dynamic set
    "BMW|R 1300 GS": [
      { id: "heated_grips", label: "Heated Grips" },
      { id: "heated_seat", label: "Heated Seat" },
      { id: "keyless", label: "Keyless Ride" },
      { id: "adaptive_headlight", label: "Adaptive Headlight" },
      { id: "luggage_panniers", label: "BMW Panniers" },
      { id: "top_box", label: "Top Box" },
      { id: "engine_bars", label: "Engine Bars" },
      { id: "nav_prep", label: "Nav/Connectivity Prep" },
    ],
    "Honda|CRF1100L Africa Twin": [
      { id: "heated_grips", label: "Heated Grips" },
      { id: "luggage_panniers", label: "Panniers" },
      { id: "top_box", label: "Top Box" },
      { id: "crash_bars", label: "Crash Bars" },
      { id: "center_stand", label: "Centre Stand" },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Dynamic Feature Catalog (groups + per-model rules)                         */
/* -------------------------------------------------------------------------- */

const FEATURE_GROUPS = {
  Packs: [
    ["comfort-pack", "Comfort Pack"],
    ["touring-pack", "Touring Pack"],
    ["dynamic-pack", "Dynamic Pack"],
    ["m-sport-pack", "M Sport Pack"],
    ["enduro-pro", "Enduro Pro"],
  ],
  RiderAids: [
    ["dynamic-esa", "Dynamic ESA"],
    ["adaptive-height", "Adaptive Height Control"],
    ["riding-assistant", "Riding Assistant"],
    ["acc", "Active Cruise Control (ACC)"],
    ["abs-pro", "ABS Pro"],
    ["dtc", "Dynamic Traction Control (DTC)"],
    ["riding-modes-pro", "Riding Modes Pro"],
    ["quickshifter", "Gear Shift Assist Pro"],
  ],
  ChassisAndErgo: [
    ["low-chassis", "Low Chassis"],
    ["low-seat", "Lowered Seat"],
    ["heated-seat", "Heated Seat"],
    ["heated-grips", "Heated Grips"],
    ["sports-suspension", "Sports Suspension"],
    ["spoked-wheels", "Spoked Wheels"],
    ["cast-wheels", "Cast Wheels"],
  ],
  Luggage: [
    ["vario-panniers", "Vario Panniers"],
    ["aluminium-panniers", "Aluminium Panniers"],
    ["top-box", "Top Box"],
    ["tank-bag", "Tank Bag"],
  ],
  Lighting: [
    ["led-headlight", "LED Headlight"],
    ["headlight-pro", "Headlight Pro (Cornering)"],
    ["aux-leds", "Auxiliary LED Lights"],
  ],
  TechAndSecurity: [
    ['tft-65"', 'TFT 6.5"'],
    ["nav-prep", "Navigation Prep"],
    ["keyless-ride", "Keyless Ride"],
    ["rdc", "Tyre Pressure Control (RDC)"],
    ["usb-c", "USB-C"],
    ["alarm", "Alarm"],
  ],
};

// Default available features per make
const BASE_FEATURES_BY_MAKE = {
  bmw: Object.entries(FEATURE_GROUPS).flatMap(([group, pairs]) =>
    pairs.map(([id, label]) => ({ id, label, group }))
  ),
  // Other makes can be added here later (honda, triumph, etc.)
};

// Per-model include/exclude rules (normalized keys: `${make}:${model}`)
const MODEL_RULES = {
  // BMW R 1300 GS
  "bmw:r-1300-gs": {
    include: [
      "comfort-pack",
      "touring-pack",
      "dynamic-pack",
      "dynamic-esa",
      "adaptive-height",
      "riding-assistant",
      "acc",
      "abs-pro",
      "dtc",
      "riding-modes-pro",
      "quickshifter",
      "low-chassis",
      "low-seat",
      "heated-seat",
      "heated-grips",
      "spoked-wheels",
      "cast-wheels",
      "vario-panniers",
      "top-box",
      "tank-bag",
      "led-headlight",
      "headlight-pro",
      "aux-leds",
      'tft-65"',
      "nav-prep",
      "keyless-ride",
      "rdc",
      "usb-c",
      "alarm",
    ],
    exclude: ["m-sport-pack", "sports-suspension", "aluminium-panniers"],
  },

  // BMW S 1000 R
  "bmw:s-1000-r": {
    include: [
      "dynamic-pack",
      "m-sport-pack",
      "abs-pro",
      "dtc",
      "riding-modes-pro",
      "quickshifter",
      "sports-suspension",
      "heated-grips",
      "led-headlight",
      'tft-65"',
      "nav-prep",
      "keyless-ride",
      "rdc",
      "usb-c",
      "alarm",
      "top-box",
      "tank-bag",
      "cast-wheels",
    ],
    exclude: [
      "adaptive-height",
      "riding-assistant",
      "acc",
      "vario-panniers",
      "aluminium-panniers",
      "spoked-wheels",
      "touring-pack",
      "comfort-pack",
      "heated-seat",
      "low-chassis",
      "low-seat",
      "aux-leds",
      "headlight-pro",
      "enduro-pro",
    ],
  },

  // BMW F 900 XR
  "bmw:f-900-xr": {
    include: [
      "comfort-pack",
      "touring-pack",
      "abs-pro",
      "dtc",
      "riding-modes-pro",
      "quickshifter",
      "heated-grips",
      "heated-seat",
      "led-headlight",
      'tft-65"',
      "nav-prep",
      "keyless-ride",
      "rdc",
      "usb-c",
      "alarm",
      "top-box",
      "tank-bag",
      "cast-wheels",
    ],
    exclude: [
      "adaptive-height",
      "riding-assistant",
      "acc",
      "spoked-wheels",
      "aluminium-panniers",
      "enduro-pro",
    ],
  },

  // BMW R 18 (cruiser)
  "bmw:r-18": {
    include: [
      "heated-grips",
      "heated-seat",
      "led-headlight",
      "aux-leds",
      "alarm",
      "top-box",
      "tank-bag",
    ],
    exclude: [
      "dynamic-esa",
      "adaptive-height",
      "riding-assistant",
      "acc",
      "riding-modes-pro",
      "quickshifter",
      "dtc",
      "abs-pro",
      "vario-panniers",
      "aluminium-panniers",
      'tft-65"',
      "nav-prep",
      "rdc",
      "keyless-ride",
      "m-sport-pack",
      "dynamic-pack",
      "enduro-pro",
      "spoked-wheels",
      "sports-suspension",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Common Issues (model-specific known checks)                                */
/* -------------------------------------------------------------------------- */
/**
 * These are static, curated “known issues” / checks for each model.
 * They feed into:
 *  - PX Condition & History → Common Issues
 *  - Customer Valuation Report
 *
 * Keyed by "Make|Model".
 */
const COMMON_ISSUES_BY_MODEL = {
  // Core demo cases you mentioned
  "BMW|R 1250 GS": [
    {
      id: "r1250gs-rear-suspension",
      label:
        "Rear suspension unit – check ESA operation, leaks and play (known issue on R 1250 GS).",
      fromYear: 2019,
    },
  ],
  "BMW|R 1250 GS Adventure": [
    {
      id: "r1250gsa-rear-suspension",
      label:
        "Rear suspension unit – check ESA operation, leaks and play (known issue on R 1250 GS Adventure).",
      fromYear: 2019,
    },
  ],

  // K 1600 range – reverse gear
  "BMW|K 1600 GT": [
    {
      id: "k1600gt-reverse-gear",
      label:
        "Reverse gear – confirm engages smoothly with no errors or judder, and test operation on an incline.",
    },
  ],
  "BMW|K 1600 GTL": [
    {
      id: "k1600gtl-reverse-gear",
      label:
        "Reverse gear – confirm engages smoothly with no errors or judder, and test operation on an incline.",
    },
  ],
  "BMW|K 1600 B": [
    {
      id: "k1600b-reverse-gear",
      label:
        "Reverse gear – confirm engages smoothly with no errors or judder, and test operation on an incline.",
    },
  ],

  // A couple of extra demo-friendly ones for your stock
  "BMW|S 1000 XR": [
    {
      id: "s1000xr-switchgear",
      label:
        "Handlebar switchgear – check all buttons operate correctly (mode, heated grips, cruise, indicator cancel).",
    },
  ],
  "BMW|R 18": [
    {
      id: "r18-corrosion",
      label:
        "Chrome & exposed metal – inspect for pitting/corrosion on exhausts, shaft housing, wheel rims and bars.",
    },
  ],
  "BMW|R nineT": [
    {
      id: "rninet-fork-seals",
      label: "Fork seals – check for misting or leaks on fork stanchions.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function getMakes() {
  return MAKES.slice();
}

export function getModels(make) {
  if (!make) return [];
  const models = MODELS_BY_MAKE[make] || [];
  return models.slice().sort((a, b) => a.localeCompare(b));
}

export function getYears(make, model) {
  if (make && model && YEAR_RANGES[keyFor(make, model)]) {
    const [from, to] = YEAR_RANGES[keyFor(make, model)];
    const out = [];
    for (let y = to; y >= from; y--) out.push(String(y));
    return out;
  }
  const current = new Date().getFullYear();
  return Array.from({ length: 20 }, (_, i) => String(current - i));
}

export function getSpecFields(make, model) {
  if (!make || !model) return [];
  return FIELD_MAPS.specs[keyFor(make, model)] || [];
}

/**
 * getFeatureFields (flat): returns [{id, label}] for the given make/model.
 * - Merges legacy FIELD_MAPS.features with the dynamic catalog (if available).
 * - Use getFeatureGroups if you want grouped output for UI.
 */
export function getFeatureFields(make, model) {
  if (!make || !model) return [];

  // Legacy (explicit) feature list for this exact model key, if any
  const legacy = FIELD_MAPS.features[keyFor(make, model)] || [];

  // Dynamic set for makes we support (e.g., BMW)
  const makeKey = nk(make);
  const modelKey = nk(model);
  const base = (BASE_FEATURES_BY_MAKE[makeKey] || []).map((f) => ({ ...f })); // {id,label,group}

  let dyn = base;
  const rule = MODEL_RULES[`${makeKey}:${modelKey}`];
  if (rule?.include?.length) {
    const inc = new Set(rule.include);
    dyn = dyn.filter((f) => inc.has(f.id));
  }
  if (rule?.exclude?.length) {
    const exc = new Set(rule.exclude);
    dyn = dyn.filter((f) => !exc.has(f.id));
  }

  // Flatten dynamic (strip group) and merge with legacy by id (legacy can add extras)
  const byId = new Map();
  dyn.forEach((f) => byId.set(f.id, { id: f.id, label: f.label }));
  legacy.forEach((f) => {
    if (!byId.has(f.id)) byId.set(f.id, { id: f.id, label: f.label });
  });

  // Return stable array sorted by label
  return Array.from(byId.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * getFeatureGroups (grouped): returns
 * [{ group: string, options: [{id,label}] }, ...]
 * Useful for checkbox UIs with group headings.
 */
export function getFeatureGroups(make, model) {
  if (!make || !model) return [];

  // Build the dynamic list first (with groups)
  const makeKey = nk(make);
  const modelKey = nk(model);
  const base = (BASE_FEATURES_BY_MAKE[makeKey] || []).map((f) => ({ ...f })); // {id,label,group}
  let filtered = base;

  const rule = MODEL_RULES[`${makeKey}:${modelKey}`];
  if (rule?.include?.length) {
    const inc = new Set(rule.include);
    filtered = filtered.filter((f) => inc.has(f.id));
  }
  if (rule?.exclude?.length) {
    const exc = new Set(rule.exclude);
    filtered = filtered.filter((f) => !exc.has(f.id));
  }

  // Merge in legacy extras (assign to a generic group if not present in base)
  const legacy = FIELD_MAPS.features[keyFor(make, model)] || [];
  const knownIds = new Set(filtered.map((f) => f.id));
  legacy.forEach((f) => {
    if (!knownIds.has(f.id)) {
      filtered.push({ id: f.id, label: f.label, group: "Other" });
      knownIds.add(f.id);
    }
  });

  // Group
  const byGroup = filtered.reduce((acc, f) => {
    const g = f.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push({ id: f.id, label: f.label });
    return acc;
  }, {});

  // Sort groups by name and options by label
  return Object.keys(byGroup)
    .sort((a, b) => a.localeCompare(b))
    .map((group) => ({
      group,
      options: byGroup[group].sort((a, b) => a.label.localeCompare(b.label)),
    }));
}

/**
 * getCommonIssues: returns an array of known issues for the given make/model/year.
 * Shape: [{ id, label, fromYear?, toYear? }, ...]
 */
export function getCommonIssues(make, model, year) {
  if (!make || !model) return [];
  const list = COMMON_ISSUES_BY_MODEL[keyFor(make, model)] || [];

  if (!year) return list;

  const y = Number(year);
  if (!Number.isFinite(y)) return list;

  return list.filter((issue) => {
    if (issue.fromYear && y < issue.fromYear) return false;
    if (issue.toYear && y > issue.toYear) return false;
    return true;
  });
}
