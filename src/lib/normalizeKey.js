// src/lib/normalizeKey.js
export function normalizeKey(label) {
  return label
    .replace(/\(.*?\)/g, "")        // remove any parentheses and content
    .replace(/[^a-zA-Z0-9]+/g, " ") // replace symbols/underscores with spaces
    .trim()
    .split(" ")
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join("");
}
