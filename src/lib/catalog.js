// src/lib/catalog.js
// Clean, safe, and validated version (no syntax errors)

// ------------------------------ Makes ------------------------------
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

// ------------------------- Models by Make --------------------------
const MODELS_BY_MAKE = {
  "Aprilia": ["RS 660", "RSV4", "Tuareg 660", "Tuono 660", "Tuono V4"],
  "BMW": [
    "C 400 X", "CE 04", "F 750 GS", "F 850 GS", "F 900 R", "F 900 XR",
    "G 310 R", "R 1250 GS", "R 1250 GS Adventure", "R 1250 R",
    "R 1250 RS", "R 1300 GS", "R 18", "R nineT", "S 1000 R",
    "S 1000 RR", "S 1000 XR"
  ],
  "CFMoto": ["450NK", "650MT", "700CL-X", "800MT"],
  "Ducati": [
    "DesertX", "Monster", "Multistrada V4", "Panigale V2",
    "Panigale V4", "Scrambler Icon", "SuperSport 950"
  ],
  "Harley-Davidson": [
    "Fat Bob 114", "Low Rider S", "Nightster",
    "Pan America 1250", "Road Glide", "Sportster S", "Street Bob 114"
  ],
  "Honda": [
    "CB500F", "CB650R", "CBR500R", "CBR650R", "CBR1000RR-R Fireblade",
    "CMX1100 Rebel", "CMX500 Rebel", "CRF300L", "CRF300 Rally",
    "CRF1100L Africa Twin", "CRF1100L Africa Twin Adventure Sports",
    "Hornet CB750", "NC750X", "NT1100", "XL750 Transalp"
  ],
  "Husqvarna": ["Norden 901", "Svartpilen 401", "Vitpilen 401"],
  "Indian": ["Chief", "FTR 1200", "Scout"],
  "Kawasaki": [
    "Ninja 650", "Ninja ZX-10R", "Versys 650", "Versys 1000",
    "Z650", "Z900", "Z H2"
  ],
  "KTM": [
    "1290 Super Adventure", "1290 Super Duke R", "390 Duke", "690 SMC R",
    "790 Adventure", "790 Duke", "890 Adventure", "890 Duke"
  ],
  "Moto Guzzi": ["V7", "V85 TT"],
  "MV Agusta": ["Brutale 800", "Dragster 800"],
  "Piaggio": ["Beverly 300", "Medley 125"],
  "Royal Enfield": [
    "Continental GT 650", "Himalayan 450", "Hunter 350",
    "Interceptor 650", "Meteor 350", "Super Meteor 650"
  ],
  "Suzuki": [
    "GSX-8R", "GSX-8S", "GSX-S1000", "GSX-S1000GT",
    "Hayabusa", "V-Strom 650", "V-Strom 800DE"
  ],
  "Triumph": [
    "Bonneville T120", "Scrambler 1200", "Speed Triple 1200 RS",
    "Speed Twin 1200", "Street Triple 765", "Tiger 1200",
    "Tiger 900", "Trident 660"
  ],
  "Vespa": ["GTS 125", "GTS 300"],
  "Yamaha": [
    "MT-07", "MT-09", "MT-10", "NMAX 125", "R7",
    "Tracer 7", "Tracer 9 GT", "Ténéré 700", "XSR700", "XSR900"
  ],
  "Zero": ["S", "SR/F"]
};

// ---------------------- Year Ranges (optional) ----------------------
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

// -------------------- Spec & Feature Field Maps --------------------
const FIELD_MAPS = {
  specs: {
    "BMW|R 1300 GS": [
      { id: "package", label: "Package", type: "enum", options: ["Base", "TE", "TE with SOS"] },
      { id: "ride_modes", label: "Ride Modes", type: "enum", options: ["Rain/Road", "Pro"] },
      { id: "suspension", label: "Suspension", type: "enum", options: ["Standard", "Dynamic ESA"] },
      { id: "wheel_type", label: "Wheel Type", type: "enum", options: ["Cast", "Wire/Spoked"] },
    ],
    "Honda|CRF1100L Africa Twin": [
      { id: "variant", label: "Variant", type: "enum", options: ["Std", "Adventure Sports"] },
      { id: "gearbox", label: "Gearbox", type: "enum", options: ["Manual", "DCT"] },
    ],
  },
  features: {
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

// --------------------------- Helper utils ---------------------------
function keyFor(make, model) {
  return `${make}|${model}`;
}

// ------------------------------ Exports ------------------------------
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

export function getFeatureFields(make, model) {
  if (!make || !model) return [];
  return FIELD_MAPS.features[keyFor(make, model)] || [];
}
