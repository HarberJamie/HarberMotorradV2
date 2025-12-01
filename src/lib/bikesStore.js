// src/lib/bikesStore.js
import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:4000/api";
const BIKES_ENDPOINT = `${API_BASE_URL}/bikes`;

/**
 * Module-level cache so every component using useBikes()
 * shares the same data without each doing its own fetch.
 */
let bikesCache = [];
let hasLoadedOnce = false;
const listeners = new Set();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Request failed: ${res.status} ${res.statusText}${text ? ` – ${text}` : ""}`
    );
  }

  return res.json();
}

function notifyListeners() {
  for (const listener of listeners) {
    listener(bikesCache);
  }
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* -------------------------------------------------------------------------- */
/* Backend integration (load / add / update)                                  */
/* -------------------------------------------------------------------------- */

/**
 * Load all bikes from the fake backend and update the cache.
 */
export async function reloadBikes() {
  const data = await fetchJson(BIKES_ENDPOINT);
  bikesCache = Array.isArray(data) ? data : [];
  hasLoadedOnce = true;
  notifyListeners();
  return bikesCache;
}

/**
 * Snapshot of the current cache (synchronous).
 * Useful if you need the latest bikes outside React.
 */
export function getBikes() {
  return bikesCache;
}

/**
 * Add a bike via POST to the backend.
 * The backend is the source of truth for `id` etc.
 */
export async function addBike(bikeInput) {
  // Ensure we always send something reasonable
  const payload = {
    // Keep any id the caller already set, otherwise let json-server assign
    ...bikeInput,
  };

  const created = await fetchJson(BIKES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  bikesCache = [...bikesCache, created];
  notifyListeners();

  return created;
}

/**
 * Update a bike via PATCH to the backend.
 */
export async function updateBike(id, updates) {
  if (!id) {
    throw new Error("updateBike requires a bike id");
  }

  const updatedFromServer = await fetchJson(`${BIKES_ENDPOINT}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  bikesCache = bikesCache.map((bike) =>
    bike.id === id ? { ...bike, ...updatedFromServer } : bike
  );
  notifyListeners();

  return updatedFromServer;
}

/* -------------------------------------------------------------------------- */
/* React hook                                                                 */
/* -------------------------------------------------------------------------- */

export function useBikes() {
  const [bikes, setBikes] = useState(bikesCache);
  const [loading, setLoading] = useState(!hasLoadedOnce);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Subscribe to module-level cache updates
    const unsubscribe = subscribe((nextBikes) => {
      if (isMounted) setBikes(nextBikes);
    });

    // First mount -> fetch from backend if not already done
    if (!hasLoadedOnce) {
      setLoading(true);
      reloadBikes()
        .catch((err) => {
          console.error("Failed to load bikes from backend", err);
          if (isMounted) setError(err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const add = useCallback(
    async (bike) => {
      setLoading(true);
      try {
        const created = await addBike(bike);
        return created;
      } catch (err) {
        console.error("Failed to add bike", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const update = useCallback(
    async (id, updates) => {
      setLoading(true);
      try {
        const updated = await updateBike(id, updates);
        return updated;
      } catch (err) {
        console.error("Failed to update bike", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await reloadBikes();
    } catch (err) {
        console.error("Failed to reload bikes", err);
        setError(err);
      } finally {
        setLoading(false);
      }
  }, []);

  return {
    bikes,
    loading,
    error,
    addBike: add,
    updateBike: update,
    reloadBikes: refresh,
  };
}
