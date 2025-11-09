// src/lib/featureLabels.js
import { getFeatureFields } from "@/lib/catalog";

/**
 * Returns [{id, label}] for the given stored feature IDs.
 */
export function resolveFeatureLabels(make, model, ids = []) {
  const options = getFeatureFields(make, model); // [{id,label}]
  const map = new Map(options.map(o => [o.id, o.label]));
  return ids.map(id => ({ id, label: map.get(id) || id }));
}
